import express from 'express';
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

/**
 * Calculate startDate and endDate for a purchased template based on purchase date and duration
 * @param purchaseDate - ISO string of purchase date
 * @param duration - number (e.g., 1, 2, 4, 12)
 * @param durationUnit - 'weeks' or 'months'
 * @returns { startDate: string, endDate: string } in ISO format (yyyy-MM-dd)
 */
function calculateTemplateDates(purchaseDate: string, duration: number, durationUnit: 'weeks' | 'months'): { startDate: string; endDate: string } {
  const start = new Date(purchaseDate);
  const end = new Date(start);
  
  if (durationUnit === 'weeks') {
    end.setDate(end.getDate() + (duration * 7) - 1); // -1 so it ends the day before next cycle starts
  } else if (durationUnit === 'months') {
    end.setMonth(end.getMonth() + duration);
    end.setDate(end.getDate() - 1); // -1 so it ends the day before next cycle starts
  }
  
  // Format as yyyy-MM-dd
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

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
        } else {
          console.warn('[authMiddleware] Firebase Admin not initialized');
        }
      } catch (tokenError: any) {
        // Token verification failed, try fallback
        console.warn('[authMiddleware] Token verification failed:', tokenError.message);
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

  // AI Generate First Workout Endpoint
  app.post('/api/ai/generate-first-workout', [
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

    // Sport-specific exercise pools — must match SPORT_EXERCISE_IDS in sportExercises.ts
    const sportPools: Record<string, string> = {
      'Musculação':     '1=Supino,16=SupinoInclinado,18=Crucifixo,6=Terra,3=Remada,8=Puxada,60=RemadaUnilateral,4=DevMilitar,28=ElevLateral,73=FacePull,2=Agachamento,7=LegPress,21=Stiff,25=Gemeos,5=Rosca,30=TricepsPulley,11=Prancha',
      'Natação':        '147=Flutuacao,148=Deslizamento,149=Pernadas,150=Crawl,151=Costas,152=Peito,153=Borboleta',
      'Corrida':        '36=Corrida,155=Trote,154=Caminhada,10=Afundo,140=ElevUnilateral,11=Prancha,110=PranchaLateral,9=Flexao',
      'Ciclismo':       '37=Ciclismo,36=Corrida,10=Afundo,140=ElevUnilateral,12=AlongIsquio,163=AlongPanturrilha',
      'Crossfit':       '2=Agachamento,6=Terra,4=DevMilitar,14=KBSwing,156=Arranco,157=PowerClean,9=Flexao,54=BarraFixa,3=Remada,11=Prancha,33=AbdSupra,38=PularCorda,36=Corrida,10=Afundo',
      'Yoga':           '161=Tadasana,142=Balasana,143=AdhoMukha,144=GuerreiroI,145=Arvore,146=Pombo,158=Triangulo,159=Cadeira,160=Cobra,162=MeioSenhor',
      'Triatlo':        '147=Flutuacao,150=Crawl,37=Ciclismo,10=Afundo,36=Corrida,11=Prancha,140=ElevUnilateral,155=Trote',
      'Halterofilismo': '156=Arranco,164=Arremesso,157=PowerClean,113=FrontSquat,2=Agachamento,6=Terra,4=DevMilitar,53=RemadaPendlay,26=Encolhimento,25=Gemeos',
    };
    const primarySport = (sports[0] || '').trim();
    const sportPoolStr = sportPools[primarySport] || sportPools['Musculação'];

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

    // Exercise IDs that use duration input (not reps)
    const durationExerciseIds = new Set(['36', '37', '38', '147', '148', '149', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159', '160', '161', '162', '163']);

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
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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

  // ── Stripe Endpoints ───────────────────────────────────────────────────────

  // POST /api/store/claim-free — claim a free item (price = 0)
  app.post('/api/store/claim-free', authMiddleware, [
    body('itemId').trim().isLength({ min: 1, max: 100 }).withMessage('itemId inválido'),
  ], async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const email = (req as any).userEmail;
    const { itemId } = req.body;

    try {
      const db = admin.firestore();
      const itemSnap = await db.collection('store_items').doc(itemId).get();
      if (!itemSnap.exists) return res.status(404).json({ error: 'Item não encontrado.' });
      const item = itemSnap.data()!;
      if (item.status !== 'published') return res.status(400).json({ error: 'Item não está disponível.' });

      // Verify item is actually free
      if (item.price !== 0) {
        return res.status(400).json({ error: 'Este item não é gratuito.' });
      }

      // Prevent claiming own items
      if (item.creatorEmail === email.toLowerCase()) {
        return res.status(400).json({ error: 'Você não pode reivindicar seu próprio item.' });
      }

      // Prevent duplicate claim
      const purchaseSnap = await db.collection('store_purchases')
        .where('buyerEmail', '==', email.toLowerCase())
        .where('itemId', '==', itemId)
        .limit(1)
        .get();
      if (!purchaseSnap.empty) {
        return res.status(400).json({ error: 'Você já possui este item.' });
      }

      // Record free "purchase"
      const buyerEmail = email.toLowerCase();
      const purchaseDate = new Date().toISOString();
      const purchaseRef = await db.collection('store_purchases').add({
        buyerEmail,
        itemId,
        itemType: item.type,
        stripeSessionId: '', // No Stripe session for free items
        purchasedAt: purchaseDate,
      });

      // Copy template(s) to buyer's templates collection
      const templateIds: string[] = item.type === 'workout'
        ? [item.templateId]
        : (item.templateIds || []);

      // Calculate dates based on purchase date and item duration
      const { startDate, endDate } = calculateTemplateDates(
        purchaseDate,
        item.duration,
        item.durationUnit
      );

      await Promise.all(templateIds.map(async (tId: string) => {
        const tSnap = await db.collection('templates').doc(tId).get();
        if (!tSnap.exists) return;
        const tData = tSnap.data()!;
        const newId = `purchased_${tId}_${buyerEmail.replace(/[@.]/g, '_')}`;
        await db.collection('templates').doc(newId).set({
          ...tData,
          id: newId,
          userId: buyerEmail,
          startDate,
          endDate,
          purchasedFrom: item.creatorEmail,
          purchasedItemId: itemId,
          purchasedAt: purchaseDate,
        });
      }));

      // Increment salesCount on item
      await db.collection('store_items').doc(itemId).update({
        salesCount: admin.firestore.FieldValue.increment(1),
      });

      res.json({ success: true, purchaseId: purchaseRef.id });
    } catch (error: any) {
      console.error('claim-free error:', error);
      res.status(500).json({ error: 'Erro ao reivindicar item gratuito.' });
    }
  });

  app.post('/api/checkout/session', authMiddleware, [
    body('itemId').trim().isLength({ min: 1, max: 100 }).withMessage('itemId inválido'),
  ], async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const email = (req as any).userEmail;
    const { itemId } = req.body;

    if (!stripe) {
      return res.status(500).json({ error: 'Stripe não está configurado. Adicione STRIPE_SECRET_KEY.' });
    }

    try {
      const db = admin.firestore();
      const itemSnap = await db.collection('store_items').doc(itemId).get();
      if (!itemSnap.exists) return res.status(404).json({ error: 'Item não encontrado.' });
      const item = itemSnap.data()!;
      if (item.status !== 'published') return res.status(400).json({ error: 'Item não está disponível para venda.' });

      // Prevent buying own items
      if (item.creatorEmail === email.toLowerCase()) {
        return res.status(400).json({ error: 'Você não pode comprar seu próprio item.' });
      }

      // Prevent duplicate purchase
      const purchaseSnap = await db.collection('store_purchases')
        .where('buyerEmail', '==', email.toLowerCase())
        .where('itemId', '==', itemId)
        .limit(1)
        .get();
      if (!purchaseSnap.empty) {
        return res.status(400).json({ error: 'Você já adquiriu este item.' });
      }

      const itemLabel = item.type === 'program'
        ? `Programa: ${item.title}`
        : `Treino: ${item.title}`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'brl',
            product_data: {
              name: itemLabel,
              description: item.description || undefined,
              images: item.coverImageUrl ? [item.coverImageUrl] : undefined,
            },
            unit_amount: item.price,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/?tab=store&success=true&session_id={CHECKOUT_SESSION_ID}&item_id=${itemId}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/?tab=store&canceled=true`,
        client_reference_id: email,
        metadata: { itemId, buyerEmail: email.toLowerCase() },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ error: 'Erro ao processar pagamento. Tente novamente.' });
    }
  });

  app.post('/api/checkout/verify', authMiddleware, [
    body('sessionId').trim().isLength({ min: 1, max: 200 }).withMessage('sessionId inválido'),
    body('itemId').trim().isLength({ min: 1, max: 100 }).withMessage('itemId inválido'),
  ], async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const email = (req as any).userEmail;
    const { sessionId, itemId } = req.body;

    if (!stripe) return res.status(500).json({ error: 'Stripe não está configurado.' });

    try {
      const db = admin.firestore();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'Pagamento não concluído.' });
      }

      // Idempotency: check if purchase already recorded
      const existingSnap = await db.collection('store_purchases')
        .where('stripeSessionId', '==', sessionId)
        .limit(1)
        .get();

      if (!existingSnap.empty) {
        return res.json({ success: true, verified: true, alreadyRecorded: true });
      }

      // Fetch item to copy templates to buyer
      const itemSnap = await db.collection('store_items').doc(itemId).get();
      if (!itemSnap.exists) return res.status(404).json({ error: 'Item não encontrado.' });
      const item = itemSnap.data()!;

      // Record purchase
      const buyerEmail = email.toLowerCase();
      const purchaseDate = new Date().toISOString();
      const purchaseRef = await db.collection('store_purchases').add({
        buyerEmail,
        itemId,
        itemType: item.type,
        stripeSessionId: sessionId,
        purchasedAt: purchaseDate,
      });

      // Copy template(s) to buyer's templates collection
      const templateIds: string[] = item.type === 'workout'
        ? [item.templateId]
        : (item.templateIds || []);

      // Calculate dates based on purchase date and item duration
      const { startDate, endDate } = calculateTemplateDates(
        purchaseDate,
        item.duration,
        item.durationUnit
      );

      await Promise.all(templateIds.map(async (tId: string) => {
        const tSnap = await db.collection('templates').doc(tId).get();
        if (!tSnap.exists) return;
        const tData = tSnap.data()!;
        const newId = `purchased_${tId}_${buyerEmail.replace(/[@.]/g, '_')}`;
        await db.collection('templates').doc(newId).set({
          ...tData,
          id: newId,
          userId: buyerEmail,
          startDate,
          endDate,
          purchasedFrom: item.creatorEmail,
          purchasedItemId: itemId,
          purchasedAt: purchaseDate,
        });
      }));

      // Increment salesCount on item
      await db.collection('store_items').doc(itemId).update({
        salesCount: admin.firestore.FieldValue.increment(1),
      });

      res.json({ success: true, verified: true, purchaseId: purchaseRef.id });
    } catch (error: any) {
      console.error('Verify error:', error);
      res.status(500).json({ error: 'Erro ao verificar pagamento. Tente novamente.' });
    }
  });

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
