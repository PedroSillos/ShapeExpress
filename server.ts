import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { GoogleGenAI } from "@google/genai";
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { EXERCISES } from './src/domain/entities/exercises.js';
import { SPORT_EXERCISE_IDS } from './src/domain/use-cases/sportExercises.js';

// Load .env.local in development
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' });
}

// Initialize Firebase Admin
// On Railway: set FIREBASE_SERVICE_ACCOUNT env var with the JSON content
// On Cloud Run: uses Application Default Credentials automatically
if (admin.apps.length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
  } else {
    admin.initializeApp();
  }
}

// Initialize Gemini AI (server-side only)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000');

  app.use(express.json());

  // ── Security Middleware ────────────────────────────────────────────────────

  // SEC-005 — Helmet: security HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://www.gstatic.com"],
        connectSrc: [
          "'self'",
          "https://*.firebaseio.com",
          "https://*.googleapis.com",
          "https://firestore.googleapis.com",
          "https://identitytoolkit.googleapis.com",
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }));

  // SEC-004 — CORS: restrict cross-origin requests to known origins
  const allowedOrigins: (string | RegExp)[] = [
    'https://shapeexpress-production.up.railway.app',
    'capacitor://localhost',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  const extraOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  allowedOrigins.push(...extraOrigins);

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((o) => (o instanceof RegExp ? o.test(origin) : o === origin))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origem não permitida — ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  }));

  // SEC-014 — Global rate limiting: 200 req / 15 min per IP for all routes
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
    skip: (req) => req.path === '/api/health', // health check always passes
  });
  app.use(globalLimiter);

  // Authentication middleware - verifies Firebase ID token
  const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação obrigatório' });
    }

    const token = authHeader.split(' ')[1];
    try {
      if (admin.apps.length === 0) {
        return res.status(500).json({ error: 'Servidor não inicializado corretamente' });
      }
      const decodedToken = await admin.auth().verifyIdToken(token);
      (req as any).userId = decodedToken.uid;
      (req as any).userEmail = decodedToken.email;
      return next();
    } catch (tokenError: any) {
      console.warn('[authMiddleware] Token inválido:', tokenError.message);
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  };

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Rate limiter for unauthenticated AI endpoints (5 requests/min per IP)
  const aiGuestLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: 'Muitas solicitações. Tente novamente em 1 minuto.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Input validation rules
  const validateProtocolId = body('protocolId')
    .trim()
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('ID de protocolo inválido');

  const validateSessionId = body('sessionId')
    .trim()
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('ID de sessão inválido');

  // AI Generate First Workout Endpoint
  app.post('/api/ai/generate-first-workout', aiGuestLimiter, [
    body('sports').isArray({ min: 1, max: 10 }),
    body('objective').optional().trim().isLength({ max: 200 }).escape(),
    body('experience').optional().trim().isLength({ max: 50 }).escape(),
    body('height').optional().isInt({ min: 60, max: 250 }),
    body('weight').optional().isInt({ min: 30, max: 300 }),
    body('age').optional().isInt({ min: 10, max: 100 }),
  ], async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (!genAI) return res.status(500).json({ error: 'AI não configurado.' });

    const { sports, objective, experience, height, weight, age } = req.body;

    const exp = (experience || '').toLowerCase();
    const difficulty = exp.includes('nunca') || exp.includes('never')
      ? 'INICIANTE ABSOLUTO: exercicios simples e de baixo impacto. sets="8".'
      : exp.includes('avan')
        ? 'AVANCADO: exercicios compostos e de alta intensidade. sets="13".'
        : exp.includes('intermedi')
          ? 'INTERMEDIARIO: exercicios compostos moderados. sets="12".'
          : 'INICIANTE: exercicios basicos. sets="10".';

    // Sport-specific exercise pools — derived from the canonical SPORT_EXERCISE_IDS catalog.
    // Format: "id=ShortName,..." — compact representation for the AI prompt.
    const buildSportPoolStr = (sport: string): string => {
      const ids = SPORT_EXERCISE_IDS[sport] ?? SPORT_EXERCISE_IDS['Musculação'] ?? [];
      return ids
        .map(id => {
          const ex = EXERCISES.find(e => e.id === id);
          if (!ex) return null;
          // Compact label: remove spaces and accents for a shorter prompt token
          const label = ex.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
          return `${id}=${label}`;
        })
        .filter(Boolean)
        .join(',');
    };
    const primarySport = (sports[0] || '').trim();
    const sportPoolStr = buildSportPoolStr(primarySport) || buildSportPoolStr('Musculação');

    // Build biometric hints so the AI can make a more appropriate selection
    const bmiHint = (weight && height)
      ? (() => {
          const bmi = weight / ((height / 100) ** 2);
          if (bmi > 30) return 'IMC elevado: prefira exercicios de baixo impacto articular.';
          if (bmi < 18.5) return 'IMC baixo: priorize exercicios compostos de ganho de massa.';
          return '';
        })()
      : '';
    const ageHint = age
      ? (age >= 50 ? 'Idade 50+: evite impacto alto e priorizze mobilidade.' : age <= 18 ? 'Jovem: foque em tecnica e peso corporal.' : '')
      : '';
    const biometricContext = [bmiHint, ageHint].filter(Boolean).join(' ');

    // Exercise IDs that use duration input — derived from catalog (inputMode is not weight_reps or reps_only).
    const durationExerciseIds = new Set(
      EXERCISES
        .filter(e => e.inputMode !== 'weight_reps' && e.inputMode !== 'reps_only')
        .map(e => e.id)
    );

    const prompt = `Voce e um personal trainer. Crie um treino VARIADO e PERSONALIZADO para: modalidade ${sports.join(', ')}, objetivo ${objective || 'condicionamento geral'}${height ? `, altura ${height}cm` : ''}${weight ? `, peso ${weight}kg` : ''}${age ? `, idade ${age} anos` : ''}.
Nivel: ${difficulty}
${biometricContext ? `Contexto biometrico: ${biometricContext}` : ''}
Pool de exercicios disponiveis (use APENAS estes IDs): ${sportPoolStr}.
INSTRUCAO DE VARIACAO: escolha 3 exercicios que melhor se encaixem no perfil do usuario. Nao escolha sempre os primeiros da lista — varie a selecao com base no objetivo, nivel e dados biometricos. Dois usuarios diferentes com perfis diferentes devem receber combinacoes diferentes.
REGRA ESTRUTURAL: use EXATAMENTE 3 exercicios, numSets=3 em todos, rest="60s" em todos.
REGRA DE SETS: Para exercicios de duracao/cardio (corrida, ciclismo, natacao, trote, caminhada, pular corda e similares) use sets="5 min". Para exercicios de forca/repeticoes use sets=numero (ex: sets="10"). Use o campo sets conforme o tipo do exercicio.
Retorne JSON sem markdown: {"name":"Treino de IA: <modalidade>","exercises":[{"exerciseId":"ID","numSets":3,"sets":"VALOR","rest":"60s"}]}`;

    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      const raw = (response.text || '').trim();
      // Strip markdown code fences if present
      const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch (parseError) {
        console.error('Generate workout JSON parse error. Raw response:', raw);
        return res.status(500).json({ error: 'Resposta da IA em formato inválido.' });
      }
      parsed.exercises = (parsed.exercises || []).slice(0, 3).map((e: any) => {
        // Safety net: if a duration exercise got a plain numeric sets value from AI, replace with '5 min'
        const sets = String(e.sets ?? '10');
        const correctedSets = durationExerciseIds.has(String(e.exerciseId)) && /^\d+$/.test(sets.trim())
          ? '5 min'
          : sets;
        return { ...e, sets: correctedSets, numSets: 3, rest: '60s' };
      });
      res.json(parsed);
    } catch (error: any) {
      console.error('Generate workout error:', error?.message || error);
      res.status(500).json({ error: 'Erro ao gerar treino.' });
    }
  });

  // ── Store Endpoints ────────────────────────────────────────────────────────

  // GET /api/store/items — public, returns all published items
  app.get('/api/store/items', async (req, res) => {
    try {
      const db = admin.firestore();
      const snap = await db.collection('store_items')
        .where('status', '==', 'published')
        .orderBy('createdAt', 'desc')
        .get();
      // SEC-006: omit creatorEmail from public response to avoid exposing trainer PII.
      // The creatorName (display name) is sufficient for presentation.
      const items = snap.docs.map((d) => {
        const { creatorEmail: _omit, ...pub } = d.data() as Record<string, any>;
        return { id: d.id, ...pub };
      });
      res.json({ items });
    } catch (error: any) {
      console.error('store/items error:', error);
      res.status(500).json({ error: 'Erro ao buscar itens da loja.' });
    }
  });

  // POST /api/store/publish — trainer publishes a workout or program
  app.post('/api/store/publish', authMiddleware, [
    body('type').isIn(['workout', 'program']).withMessage('Tipo inválido'),
    body('title').trim().isLength({ min: 3, max: 120 }).escape(),
    body('description').optional().trim().isLength({ max: 500 }).escape(),
    body('price').isInt({ min: 0, max: 999900 }).withMessage('Preço inválido (entre R$0 e R$9999)'),
    body('duration').isInt({ min: 1, max: 52 }).withMessage('Duração inválida (entre 1 e 52)'),
    body('durationUnit').isIn(['weeks', 'months']).withMessage('Unidade de duração inválida'),
    body('tags').isArray({ max: 8 }),
    body('coverImageUrl').optional().trim().isURL().withMessage('URL de capa inválida'),
    body('templateId').optional().trim().isLength({ min: 1, max: 100 }),
    body('templateIds').optional().isArray({ min: 1, max: 20 }),
  ], async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const email = (req as any).userEmail;

    // Verify the requester is a trainer
    try {
      const db = admin.firestore();
      const userSnap = await db.collection('users').doc(email.toLowerCase()).get();
      const userData = userSnap.exists ? userSnap.data() : null;
      if (!userData || userData.userType !== 'treinador') {
        return res.status(403).json({ error: 'Apenas treinadores podem publicar na loja.' });
      }

      const { type, title, description, price, duration, durationUnit, tags, coverImageUrl, templateId, templateIds } = req.body;

      const base = {
        creatorEmail: email.toLowerCase(),
        creatorName: userData.firstName ? [userData.firstName, userData.lastName].filter(Boolean).join(' ') : email,
        creatorAvatar: '',
        title,
        description: description || '',
        coverImageUrl: coverImageUrl || '',
        price,
        duration,
        durationUnit,
        tags: tags || [],
        rating: 0,
        salesCount: 0,
        createdAt: new Date().toISOString(),
        status: 'published',
      };

      let data: Record<string, any>;
      if (type === 'workout') {
        if (!templateId) return res.status(400).json({ error: 'templateId obrigatório para treino.' });
        data = { ...base, type: 'workout', templateId };
      } else {
        if (!templateIds?.length) return res.status(400).json({ error: 'templateIds obrigatório para programa.' });
        data = { ...base, type: 'program', templateIds };
      }

      const ref = await db.collection('store_items').add(data);
      res.json({ id: ref.id, ...data });
    } catch (error: any) {
      console.error('store/publish error:', error);
      res.status(500).json({ error: 'Erro ao publicar item.' });
    }
  });

  // POST /api/store/unpublish/:id — trainer unpublishes their own item
  app.post('/api/store/unpublish/:id', authMiddleware, async (req: any, res: any) => {
    const email = (req as any).userEmail;
    const { id } = req.params;
    if (!id || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    try {
      const db = admin.firestore();
      const itemRef = db.collection('store_items').doc(id);
      const snap = await itemRef.get();
      if (!snap.exists) return res.status(404).json({ error: 'Item não encontrado.' });
      if (snap.data()?.creatorEmail !== email.toLowerCase()) {
        return res.status(403).json({ error: 'Sem permissão para remover este item.' });
      }
      await itemRef.update({ status: 'draft' });
      res.json({ success: true });
    } catch (error: any) {
      console.error('store/unpublish error:', error);
      res.status(500).json({ error: 'Erro ao remover item da loja.' });
    }
  });

  // Paid checkout endpoints removed — payment system disabled.
  // Free item claiming is handled client-side via Firestore SDK.

  // Vite middleware for development
  // When running via `npm run dev` (Vite standalone + Express separately),
  // skip creating an internal Vite server — Vite is already running standalone.
  // In production, serve the built dist folder.
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[server] Port ${PORT} already in use. Is another instance running?`);
    } else {
      console.error('[server] Fatal error:', err);
    }
    process.exit(1);
  });
}

startServer();
