# GateKeeperX Backend

node.js + MySQL backend for GateKeeperX.

## Setup

1. Create `.env` from `.env.example`
2. Ensure your MySQL database `gatekeeperx` is already present
3. Run backend:

```bash
npm run server
```

Or with auto-reload:

```bash
npm run server:dev
```

## Implemented APIs

- `POST /login`
- `GET /resources`
- `POST /booking`
- `GET /bookings`
- `DELETE /booking/:id`
- `PUT /booking/approve/:id`
- `PUT /booking/reject/:id`
- `GET /permissions`
- `GET /health`
