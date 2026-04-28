# API Reference

Express backend on port **3000**.

## Authentication

All routes except `/api/health` require `authMiddleware` ([server.ts](server.ts)).

Preferred: `Authorization: Bearer <firebase-id-token>`  
Fallback: `x-user-email: user@example.com` (legacy)

## Endpoints

### `GET /api/health`
Returns `{ "status": "ok" }`.

---

### `POST /api/checkout/session` 🔒
Creates a Stripe checkout session.

Body: `{ "protocolId": "abc123" }`  
Response: `{ "url": "https://checkout.stripe.com/..." }`

---

### `POST /api/checkout/verify` 🔒
Verifies payment completion.

Body: `{ "sessionId": "cs_...", "protocolId": "abc123" }`  
Response: `{ "success": true, "verified": true }`

---

### `POST /api/ai/coach-advice` 🔒
Returns personalized AI coaching advice.

Body: `{ userProfile, sessions, stagnationReports, progressScore }`  
Response: `{ "advice": "..." }`

---

### `POST /api/ai/recommend-communities` 🔒
Returns recommended community IDs for a user.

Body: `{ userProfile, userLevel, userLeague, communities, userCommunityIds }`  
Response: `{ "recommendations": ["id1", "id2"] }`

## WebSocket

`ws://localhost:3000` — real-time chat.

Message format:
```json
{ "type": "message|typing|seen", "roomId": "...", "userId": "...", "message": "...", "timestamp": 0 }
```

## Stripe Test Cards

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0025 0000 3155 | 3D Secure |

Local webhook forwarding: `stripe listen --forward-to localhost:3000/webhooks`

## Production Notes

- Stripe: use webhook signature verification for purchase fulfillment
- Firebase Admin SDK required for server-side Firestore writes
- See [AGENTS.md](AGENTS.md) for full security guidelines
