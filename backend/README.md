# DSAlytics Backend

## Run

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## cURL

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "sarthak",
    "email": "sarthak@example.com",
    "password": "StrongPass123",
    "display_name": "Sarthak"
  }'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "sarthak@example.com",
    "password": "StrongPass123"
  }'

# Add handle
curl -X POST http://localhost:5000/handles \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "platform_id": 1,
    "handle": "tourist"
  }'

# Get handles
curl http://localhost:5000/handles \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Update handle
curl -X PATCH http://localhost:5000/handles/<HANDLE_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "handle": "tourist_v2",
    "is_active": true,
    "sync_cursor": "page_2"
  }'

# Delete handle
curl -X DELETE http://localhost:5000/handles/<HANDLE_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Manual sync
curl -X POST http://localhost:5000/sync/<HANDLE_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Heatmap
curl "http://localhost:5000/heatmap?days=365" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Platform breakdown for date
curl "http://localhost:5000/heatmap/2026-03-03/platforms" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Submission history for date
curl "http://localhost:5000/history/2026-03-03" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```
