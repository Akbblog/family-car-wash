#!/usr/bin/env node
// Usage:
//   node scripts/find-users.js exactEmail@example.com
//   node scripts/find-users.js --q partial
// If no arg provided, lists the latest 20 users.

const { MongoClient } = require('mongodb');

async function main() {
  const arg = process.argv[2];
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI environment variable');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI, {});
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');

    let cursor;
    if (!arg) {
      cursor = users.find().sort({ createdAt: -1 }).limit(20);
    } else if (arg === '--q' && process.argv[3]) {
      const q = process.argv[3];
      cursor = users.find({ email: { $regex: q, $options: 'i' } }).limit(50);
    } else if (arg.startsWith('--q=')) {
      const q = arg.slice(4);
      cursor = users.find({ email: { $regex: q, $options: 'i' } }).limit(50);
    } else {
      // exact match
      const email = String(arg).toLowerCase().trim();
      cursor = users.find({ email }).limit(10);
    }

    const results = await cursor.toArray();
    if (!results || results.length === 0) {
      console.log('No users found');
      return;
    }

    console.log(`Found ${results.length} user(s):`);
    for (const u of results) {
      console.log('---');
      console.log('id:', u._id?.toString());
      console.log('email:', u.email);
      console.log('name:', u.name || '');
      console.log('createdAt:', u.createdAt || u.created_at || '');
    }
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 2;
  } finally {
    await client.close();
  }
}

main();
