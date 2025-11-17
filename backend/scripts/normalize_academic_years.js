/**
 * Normalize HoatDong.nam_hoc values from academic year ranges (e.g. '2025-2026', '2025 - 2026')
 * to a single base year '2025'. Keeps existing single year values unchanged.
 * Supports dry-run via env DRY_RUN=1.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function extractBaseYear(value) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  // Match forms: '2025-2026' or '2025 - 2026'
  const m = trimmed.match(/^(\d{4})\s*-\s*\d{4}$/);
  if (m) return m[1];
  // If already single year
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  return null; // Unknown format -> skip
}

async function run() {
  const dryRun = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');
  const activities = await prisma.hoatDong.findMany({
    select: { id: true, nam_hoc: true }
  });

  let total = activities.length;
  let needsChange = 0;
  const changes = [];

  for (const act of activities) {
    const base = extractBaseYear(act.nam_hoc);
    if (!base) continue; // skip unknown
    if (act.nam_hoc !== base) {
      needsChange++;
      changes.push({ id: act.id, from: act.nam_hoc, to: base });
    }
  }

  console.log(`Total activities scanned: ${total}`);
  console.log(`Activities needing normalization: ${needsChange}`);

  if (dryRun) {
    console.log('DRY-RUN MODE: No updates performed. Sample changes:');
    console.log(changes.slice(0, 10));
  } else {
    let updated = 0;
    for (const ch of changes) {
      await prisma.hoatDong.update({
        where: { id: ch.id },
        data: { nam_hoc: ch.to }
      });
      updated++;
      if (updated % 100 === 0) {
        console.log(`Updated ${updated}/${needsChange}...`);
      }
    }
    console.log(`Normalization complete. Updated ${updated} records.`);
  }

  // Summary JSON output for automation
  console.log(JSON.stringify({
    dryRun,
    scanned: total,
    willChange: needsChange,
    performedUpdates: dryRun ? 0 : needsChange
  }, null, 2));

  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
