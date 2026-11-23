/**
 * Script untuk Seed Data Cameras dan Lenses ke Supabase Database
 */
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://pvwsllkimmscfyqshass.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3NsbGtpbW1zY2Z5cXNoYXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0NDIwNTYsImV4cCI6MjExMTAxODA1Nn0._e9KPNnMzIwTyDT9ZKREHI0HtVfD7X06mnMcg6sVjm4';

async function seedTable(tableName, jsonFileName) {
  const filePath = path.join(__dirname, '..', 'data', jsonFileName);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  console.log(`\n⏳ Mengunggah ${data.length} item ke tabel '${tableName}' di Supabase...`);

  // Insert in batches of 20 to avoid large payload
  const batchSize = 20;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(batch)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ Gagal upload batch ${i + 1}-${i + batch.length}:`, errText);
      return false;
    } else {
      console.log(`✅ Berhasil batch ${i + 1} - ${Math.min(i + batchSize, data.length)} / ${data.length}`);
    }
  }

  console.log(`🎉 Sukses mengunggah seluruh data ke tabel '${tableName}'!`);
  return true;
}

async function run() {
  console.log('🚀 Memulai proses seeding data ke Supabase...');
  console.log('Target URL:', SUPABASE_URL);

  const camerasSuccess = await seedTable('cameras', 'cameras.json');
  if (camerasSuccess) {
    await seedTable('lenses', 'lenses.json');
  } else {
    console.log('\n⚠️ Tips: Pastikan Anda sudah menjalankan SQL Table Creation di SQL Editor Supabase terlebih dahulu.');
  }
}

run();
