# 🔌 API Reference

Complete documentation of Shape Express backend endpoints and integrations.

---

## 🚀 Server

The Express backend runs on port **3000** and handles:
- Stripe payment processing
- WebSocket connections (real-time chat)
- Authentication middleware
- API endpoints

**Base URL**: `http://localhost:3000`

---

## 🏥 Health Check

### GET `/api/health`

Check if the server is running.

**Response:**
```json
{
  "status": "ok"
}
```

---

## 💳 Stripe Endpoints

### POST `/api/checkout/session`

Create a Stripe checkout session for purchasing training protocols.

**Headers:**
```
x-user-email: user@example.com
Content-Type: application/json
```

**Body:**
```json
{
  "protocolId": "protocol_123"
}
```

**Response (Success):**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_..."
}
```

**Response (Error):**
```json
{
  "error": "Stripe não está configurado. Adicione STRIPE_SECRET_KEY nas variáveis de ambiente."
}
```

**Status Codes:**
- `200`: Checkout session created successfully
- `401`: Missing `x-user-email` header
- `500`: Stripe not configured or API error

---

### POST `/api/checkout/verify`

Verify payment completion after checkout.

**Headers:**
```
x-user-email: user@example.com
Content-Type: application/json
```

**Body:**
```json
{
  "sessionId": "cs_...",
  "protocolId": "protocol_123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "verified": true
}
```

**Response (Pending):**
```json
{
  "error": "Pagamento não concluído."
}
```

**Status Codes:**
- `200`: Payment verified
- `400`: Payment not completed
- `401`: Missing `x-user-email` header
- `500`: Stripe error

---

## 💬 WebSocket

Real-time messaging for chat functionality.

**Endpoint**: `ws://localhost:3000`

### Message Format

```json
{
  "type": "message|typing|seen",
  "roomId": "chat_123",
  "userId": "user_123",
  "message": "Hello!",
  "timestamp": 1234567890
}
```

### Example Usage (Client)

```typescript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  // Send message
  ws.send(JSON.stringify({
    type: 'message',
    roomId: 'chat_123',
    userId: 'user_123',
    message: 'Hello, trainer!',
    timestamp: Date.now()
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

---

## 🔐 Authentication

All API endpoints (except `/api/health`) require authentication via the `x-user-email` header.

**Example:**
```bash
curl -H "x-user-email: user@example.com" \
     -X POST http://localhost:3000/api/checkout/session \
     -H "Content-Type: application/json" \
     -d '{"protocolId":"123"}'
```

### Firebase Authentication

Client-side uses Firebase Authentication. After user signs in:

```typescript
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    const email = user.email;
    // Send email in request headers to backend
    const response = await fetch('/api/checkout/session', {
      method: 'POST',
      headers: {
        'x-user-email': email,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ protocolId })
    });
  }
});
```

---

## 🔄 Stripe Integration

### Test Cards

| Use Case | Card Number | CVC | Expiry |
|----------|------------|-----|--------|
| Successful payment | 4242 4242 4242 4242 | Any | Future |
| Payment declined | 4000 0000 0000 0002 | Any | Future |
| 3D Secure | 4000 0025 0000 3155 | Any | Future |

### Webhook Events

To listen for Stripe events locally:

```bash
stripe login
stripe listen --forward-to localhost:3000/webhooks
```

**Expected Events:**
- `payment_intent.succeeded` - Payment completed
- `charge.refunded` - Refund processed
- `customer.subscription.created` - Subscription started

### Implementation Notes

⚠️ **Current Limitation**: Full server-side verification requires Firebase Admin SDK with cross-project support. Current implementation verifies via Stripe Session API only.

For production:
1. Set up Firebase Admin SDK service account
2. Implement complete payment verification
3. Update Firestore user documents on successful payment
4. Add webhook handlers for async events

---

## 🤖 Google GenAI (AI Service)

Integrated via Google GenAI library for workout analysis and recommendations.

**Configuration:**
```env
GEMINI_API_KEY=AIzaSyBCWv2iGReQHXim42B6BzpOpjYcW5jXJuY
```

**Client-side Usage:**
```typescript
import { aiService } from '@/services';

const analysis = await aiService.analyzeWorkout({
  exercises: [...],
  metrics: {...}
});
```

**Features:**
- Workout progress analysis
- Exercise form feedback
- Personalized recommendations
- Natural language responses

---

## 🔗 Cross-Origin (CORS)

CORS is configured to allow:
- Local development (`http://localhost:3000`, `http://localhost:5173`)
- Production domain (set via `APP_URL`)

**Configuration** (in server.ts):
```typescript
app.use(cors({
  origin: process.env.APP_URL,
  credentials: true
}));
```

---

## 🐛 Error Handling

All endpoints follow consistent error format:

```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE" // optional
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad request |
| `401` | Unauthorized |
| `404` | Not found |
| `500` | Server error |

---

## 📊 Environment Variables

Required environment variables for API functionality:

```env
# Server
APP_URL=http://localhost:3000
NODE_ENV=development

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...

# AI
GEMINI_API_KEY=AIzaSyBCWv2iGReQHXim42B6BzpOpjYcW5jXJuY

# Firebase (client-side, prefixed with VITE_)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```

See [.env.example](.env.example) for all variables.

---

## 🚀 Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy
```

### Environment Variables (Production)

Set environment variables in Firebase Console:
1. Go to Cloud Functions settings
2. Set all required env vars
3. Redeploy

### Security Checklist

- [ ] Use production Stripe keys
- [ ] Enable Firestore security rules
- [ ] Configure CORS properly
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Rate limit API endpoints
- [ ] Monitor error logs

---

## 📚 Related Documentation

- [README.md](README.md) - Project overview
- [DEVELOPMENT.md](DEVELOPMENT.md) - Setup guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [ARCHITECTURE.md](src/ARCHITECTURE.md) - Code structure

---

## 🆘 Troubleshooting

### "Stripe not configured" error
- Verify `STRIPE_SECRET_KEY` is set in `.env.local`
- Use test key (`sk_test_...`) for development

### Checkout session not created
- Check server logs for errors
- Verify `protocolId` is provided in request body
- Ensure `x-user-email` header is included

### Payment verification fails
- Confirm payment completed on Stripe
- Check session ID is correct
- Verify user email matches

### WebSocket connection fails
- Ensure server is running on port 3000
- Check browser console for network errors
- Verify firewall isn't blocking WebSocket

---

**Need help?** Check [DEVELOPMENT.md](DEVELOPMENT.md) or open an issue in the repository.
