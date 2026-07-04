import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import admin from 'firebase-admin';
import { GoogleGenAI } from "@google/genai";
import { body, validationResult } from 'express-validator';
import { config } from 'dotenv';

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

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any }) : null;

// Initialize Gemini AI (server-side only)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000');

  app.use(express.json());

  // Authentication middleware - verifies user identity
  // Tries Firebase ID token first, falls back to email header for backward compatibility
  const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const xEmail = req.headers['x-user-email'] as string;
    
    // Try to verify Firebase ID token first (more secure)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // Check if admin is initialized and verify token
        if (admin.apps.length > 0) {
          const decodedToken = await admin.auth().verifyIdToken(token);
          (req as any).userId = decodedToken.uid;
          (req as any).userEmail = decodedToken.email;
          return next();
        }
      } catch (tokenError) {
        // Token verification failed, try fallback
        console.warn('Token verification failed, using fallback:', tokenError);
      }
    }
    
    // Fallback: use email header (less secure but maintains compatibility)
    if (!xEmail) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    (req as any).userEmail = xEmail;
    next();
  };

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
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

  const validateCoachAdvice = [
    body('userProfile.name').optional().trim().isLength({ max: 100 }).escape(),
    body('userProfile.objective').optional().trim().isLength({ max: 200 }).escape(),
    body('userProfile.experienceLevel').optional().isIn(['Iniciante', 'Intermediário', 'Avançado']),
    body('sessions').optional().isArray({ max: 100 }),
    body('progressScore.score').optional().isNumeric(),
    body('progressScore.classification').optional().trim().isLength({ max: 50 }).escape(),
    body('stagnationReports').optional().isArray({ max: 50 }),
  ];

  // AI Generate First Workout Endpoint
  app.post('/api/ai/generate-first-workout', [
    body('sports').isArray({ min: 1, max: 10 }),
    body('objective').optional().trim().isLength({ max: 200 }).escape(),
    body('experience').optional().trim().isLength({ max: 50 }).escape(),
    body('location').optional().isIn(['Casa', 'Academia']),
    body('height').optional().isInt({ min: 100, max: 250 }),
    body('weight').optional().isInt({ min: 30, max: 300 }),
    body('age').optional().isInt({ min: 10, max: 100 }),
  ], async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (!genAI) return res.status(500).json({ error: 'AI não configurado.' });

    const { sports, objective, experience, location, height, weight, age } = req.body;

    const exp = (experience || '').toLowerCase();
    const difficulty = exp.includes('nunca') || exp.includes('never')
      ? 'INICIANTE ABSOLUTO: exercicios simples (IDs 9,10,11). sets="8".'
      : exp.includes('avan')
        ? 'AVANCADO: exercicios pesados (IDs 6,2,4). sets="13".'
        : exp.includes('intermedi')
          ? 'INTERMEDIARIO: exercicios compostos (IDs 1,2,3). sets="12".'
          : 'INICIANTE: exercicios basicos (IDs 7,8,9). sets="10".';

    const prompt = `Personal trainer: crie treino para modalidade ${sports.join(', ')}, objetivo ${objective || 'condicionamento'}, local ${location || 'Academia'}${height ? `, altura ${height}cm` : ''}${weight ? `, peso ${weight}kg` : ''}${age ? `, idade ${age} anos` : ''}.
Nivel: ${difficulty}
Regras: EXATAMENTE 3 exercicios, numSets=3 em todos, rest="60s" em todos. Casa: apenas IDs 9,10,11,14,33,35,38.
IDs: 1=Supino,2=Agachamento,3=Remada,4=Dev.Militar,5=Rosca,6=Terra,7=LegPress,8=Puxada,9=Flexao,10=Afundo,11=Prancha,13=RoscaHalter,14=KBSwing,19=Extensora,20=MesaFlexora,21=Stiff,22=ElevPelvica,25=Gemeos,28=ElevLateral,30=TricepsPulley,33=AbdSupra,35=GiroRusso,36=Corrida,37=Ciclismo,38=PularCorda.
JSON sem markdown: {"name":"Treino Básico: <modalidade>","exercises":[{"exerciseId":"ID","numSets":3,"sets":"10","rest":"60s"}]}`;

    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      const text = (response.text || '').replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      parsed.exercises = (parsed.exercises || []).slice(0, 3).map((e: any) => ({ ...e, numSets: 3, rest: '60s' }));
      res.json(parsed);
    } catch (error: any) {
      console.error('Generate workout error:', error);
      res.status(500).json({ error: 'Erro ao gerar treino.' });
    }
  });

  // AI Coach Endpoint (server-side Gemini)
  app.post('/api/ai/coach-advice', authMiddleware, validateCoachAdvice, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!genAI) {
      return res.status(500).json({ error: 'AI não está configurado. Adicione GEMINI_API_KEY nas variáveis de ambiente.' });
    }

    const { userProfile, sessions, stagnationReports, progressScore } = req.body;

    try {
      const prompt = `Você é um Personal Trainer IA de elite chamado "Shape Express Coach". 
      Analise os dados do usuário e forneça conselhos motivadores e técnicos para sua evolução.
      
      Perfil do Usuário:
      - Nome: ${userProfile?.name || 'Não informado'}
      - Objetivo: ${userProfile?.objective || 'Não informado'}
      - Nível: ${userProfile?.experienceLevel || 'Intermediário'}
      
      Dados Recentes:
      - Total de Treinos: ${sessions?.length || 0}
      - Score de Progresso: ${progressScore?.score || 'N/A'} (${progressScore?.classification || 'N/A'})
      - Relatórios de Estagnação: ${JSON.stringify(stagnationReports || [])}
      
      Responda em Português (Brasil). Seja conciso, use emojis e foque em como superar a estagnação se houver, ou como manter o ritmo se estiver progredindo bem.
      Limite a resposta a no máximo 3 parágrafos curtos.`;

      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      res.json({ advice: response.text || "Não consegui gerar um conselho no momento. Continue treinando firme!" });
    } catch (error: any) {
      console.error('AI Coach Error:', error);
      res.status(500).json({ error: 'Erro ao gerar conselho. Tente novamente.' });
    }
  });

  // Stripe Endpoints
  // Note: For fully secure external Firebase admin integration, a service account JSON is needed.
  app.post('/api/checkout/session', authMiddleware, validateProtocolId, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const email = (req as any).userEmail;
    const { protocolId } = req.body;

    if (!stripe) {
      return res.status(500).json({ error: 'Stripe não está configurado. Adicione STRIPE_SECRET_KEY nas variáveis de ambiente.' });
    }

    try {
      // Create a checkout session purely via Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: 'Protocolo de Treino', // Mocado na ausência do Admin SDK
                description: 'Acesso VIP',
              },
              unit_amount: 9700, // 97 BRL default
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/?tab=express&success=true&session_id={CHECKOUT_SESSION_ID}&protocol_id=${protocolId}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/?tab=express&canceled=true`,
        client_reference_id: email,
        metadata: {
          protocolId: protocolId,
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: 'Erro ao processar pagamento. Tente novamente.' });
    }
  });

  app.post('/api/checkout/verify', authMiddleware, validateSessionId, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const email = (req as any).userEmail;
    const { sessionId, protocolId } = req.body;

    if (!stripe) {
      return res.status(500).json({ error: 'Stripe não está configurado.' });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid') {
        // Here you would normally update Firestore using Admin SDK. 
        // We will return success so the client can update via client SDK natively.
        res.json({ success: true, verified: true });
      } else {
        res.status(400).json({ error: 'Pagamento não concluído.' });
      }
    } catch (error: any) {
      console.error('Verify error:', error);
      res.status(500).json({ error: 'Erro ao verificar pagamento. Tente novamente.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
