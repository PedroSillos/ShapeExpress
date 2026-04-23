import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import admin from 'firebase-admin';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any }) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware to get user email (simplified, relies on client sending the email in headers since Admin SDK cross-project won't work automatically)
  const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const xEmail = req.headers['x-user-email'] as string;
    
    if (!xEmail) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    (req as any).userEmail = xEmail;
    next();
  };

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Stripe Endpoints
  // Note: For fully secure external Firebase admin integration, a service account JSON is needed.
  app.post('/api/checkout/session', authMiddleware, async (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/checkout/verify', authMiddleware, async (req, res) => {
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
      res.status(500).json({ error: error.message });
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
