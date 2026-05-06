import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import admin from 'firebase-admin';
import { GoogleGenAI } from "@google/genai";
import { body, validationResult } from 'express-validator';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any }) : null;

// Initialize Gemini AI (server-side only)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  const validateRecommendCommunities = [
    body('userProfile.name').optional().trim().isLength({ max: 100 }).escape(),
    body('userProfile.objective').optional().trim().isLength({ max: 200 }).escape(),
    body('userLevel').optional().isInt({ min: 1, max: 1000 }),
    body('userLeague').optional().isIn(['Bronze', 'Prata', 'Ouro', 'Platina', 'Esmeralda', 'Diamante']),
    body('communities').optional().isArray({ max: 200 }),
    body('userCommunityIds').optional().isArray({ max: 200 }),
  ];

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

  // AI Community Recommendations Endpoint
  app.post('/api/ai/recommend-communities', authMiddleware, validateRecommendCommunities, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!genAI) {
      return res.status(500).json({ error: 'AI não está configurado.' });
    }

    const { userProfile, userLevel, userLeague, communities, userCommunityIds } = req.body;

    try {
      const prompt = `
      Com base no perfil do atleta abaixo, sugira as 3 comunidades mais adequadas para ele entre as disponíveis.
      
      Perfil do Atleta:
      - Nome: ${userProfile?.name || 'Não informado'}
      - Objetivo: ${userProfile?.objective || 'Não informado'}
      - Nível: ${userLevel || 1}
      - Liga: ${userLeague || 'Iniciante'}
      
      Comunidades Disponíveis:
      ${(communities || []).map((c: any) => `- ID: ${c.id}, Nome: ${c.name}, Descrição: ${c.description}, Tags: ${c.tags}`).join('\n')}
      
      Comunidades que ele já participa: ${(userCommunityIds || []).join(', ')}
      
      Retorne APENAS um array JSON com os IDs das comunidades recomendadas. Exemplo: ["id1", "id2"]
      `;

      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      const text = response.text || "[]";
      const recommendedIds = JSON.parse(text.match(/\[.*\]/)?.[0] || '[]');
      res.json({ recommendations: recommendedIds });
    } catch (error: any) {
      console.error('AI Community Error:', error);
      res.status(500).json({ error: 'Erro ao gerar recomendações.' });
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
