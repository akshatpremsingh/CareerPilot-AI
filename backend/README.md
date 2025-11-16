# CareerPilot Backend (Single-server)
This package contains a ready-to-run Node.js + Express backend that **serves your existing frontend** from `public/`
and provides API endpoints for authentication and a chatbot proxy.

## Quick start (dev)
1. Unzip the package and place it on your machine.
2. Copy `.env.example` to `.env` and update values (especially `JWT_SECRET` and `MONGODB_URI`).
3. Put your frontend files in the `public/` folder (already included in this package).
4. Install dependencies:
   ```bash
   cd CareerPilot-backend
   npm install
   ```
5. Run locally:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:5000` to view your frontend and use the APIs under `/api/...`.

## API endpoints
- `POST /api/auth/signup`  — body: {name,email,password,role}
- `POST /api/auth/login`   — body: {email,password}
- `GET  /api/auth/me`      — headers: Authorization: Bearer <token>
- `POST /api/chat`         — headers: Authorization: Bearer <token>, body: {message}

## Notes
- If `OPENAI_API_KEY` is not set, the chat endpoint returns an echo reply for testing.
- For production, use MongoDB Atlas and set `MONGODB_URI` accordingly.
- Remember to set `CLIENT_URL` to your frontend domain when deploying.
