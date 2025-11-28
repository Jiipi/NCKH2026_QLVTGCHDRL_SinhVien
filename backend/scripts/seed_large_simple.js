// Simple wrapper to run the large Prisma seed with unified passwords
// Usage (from repo root, backend-dev container running):
//   docker exec dacn_backend_dev node scripts/seed_large_simple.js

const path = require('path');

// Just re-export/require the prisma-level seed so all logic stays in one place
require(path.join(__dirname, '..', 'prisma', 'seed_large'));
