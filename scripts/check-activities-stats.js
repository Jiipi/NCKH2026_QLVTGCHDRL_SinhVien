#!/usr/bin/env node
/**
 * Quick diagnostic script to inspect activity data by scope.
 *
 * Usage:
 *   API_BASE_URL=http://localhost:3000/api API_TOKEN=xxx node scripts/check-activities-stats.js
 *
 * Optional CLI args override envs:
 *   node scripts/check-activities-stats.js --baseUrl=http://localhost:3000/api --token=xxx
 */

const axios = require('axios');

function parseArgs() {
  const args = process.argv.slice(2);
  return args.reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    if (!key) return acc;
    const normalized = key.replace(/^--/, '');
    acc[normalized] = value;
    return acc;
  }, {});
}

function buildClient(baseURL, token) {
  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${token}`
    },
    timeout: 30000
  });
}

function summarizeBy(items, keyGetter) {
  return items.reduce((acc, item) => {
    const key = keyGetter(item) || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

async function main() {
  const args = parseArgs();
  const baseUrl = args.baseUrl || process.env.API_BASE_URL || 'http://localhost:3000/api';
  const token = args.token || process.env.API_TOKEN;

  if (!token) {
    console.error('Missing API token. Provide via --token= or API_TOKEN env variable.');
    process.exit(1);
  }

  const client = buildClient(baseUrl, token);

  console.log('Fetching data from', baseUrl);
  const [activitiesRes, classesRes] = await Promise.all([
    client.get('/core/activities', { params: { limit: 'all' } }),
    client.get('/core/classes', { params: { limit: 500 } })
  ]);

  const classesPayload = classesRes.data?.data;
  const classItems = Array.isArray(classesPayload?.data)
    ? classesPayload.data
    : Array.isArray(classesPayload?.items)
      ? classesPayload.items
      : Array.isArray(classesPayload)
        ? classesPayload
        : [];

  const classMap = classItems.reduce((acc, item) => {
    acc[item.id] = item.ten_lop || item.name || `Lớp ${item.id}`;
    return acc;
  }, {});

  const activitiesEnvelope = activitiesRes.data?.data;
  const activityItems = activitiesEnvelope?.items || activitiesEnvelope?.data || activitiesEnvelope || [];
  const activities = Array.isArray(activityItems) ? activityItems : [];

  console.log(`\nTổng hoạt động: ${activities.length}`);

  const bySemester = summarizeBy(activities, (a) => a.semester_value || a.semester);
  console.log('\nThống kê theo học kỳ:');
  console.table(
    Object.entries(bySemester).map(([semester, total]) => ({
      semester: semester || '(chưa xác định)',
      total
    }))
  );

  const byClass = summarizeBy(activities, (a) => {
    const lopId = a.lop_id || a.class_id;
    return lopId ? classMap[lopId] || `Lớp #${lopId}` : null;
  });
  console.log('\nThống kê theo lớp:');
  console.table(
    Object.entries(byClass).map(([cls, total]) => ({
      class: cls || '(không thuộc lớp)',
      total
    }))
  );

  const combined = activities.reduce((acc, activity) => {
    const semesterKey = activity.semester_value || activity.semester || 'unknown';
    const classKey = activity.lop_id || activity.class_id || 'system';
    const clsLabel = classKey === 'system' ? 'Hệ thống' : classMap[classKey] || `Lớp #${classKey}`;
    const key = `${clsLabel} | ${semesterKey}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  console.log('\nThống kê theo lớp + học kỳ:');
  console.table(
    Object.entries(combined).map(([combo, total]) => {
      const [cls, sem] = combo.split(' | ');
      return { class: cls, semester: sem, total };
    })
  );
}

main().catch((err) => {
  console.error('Script thất bại:', err?.response?.data || err.message || err);
  process.exit(1);
});

