#!/usr/bin/env node
/*
  Usage:
    node scripts/set-password.js user@example.com NewP@ssw0rd

  This script connects to MongoDB using MONGODB_URI env var and updates the user's
  `password` field with a bcrypt-hashed value. It lowercases the email before lookup.
*/

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function main() {
  const [,, emailArg, newPassword] = process.argv;
  if (!emailArg || !newPassword) {
    console.error('Usage: node scripts/set-password.js email@example.com NewPassword');
    process.exit(1);
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI environment variable');
    process.exit(1);
  }

  const email = String(emailArg).toLowerCase().trim();

  const client = new MongoClient(MONGODB_URI, {});
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');

    console.log('Connected to DB:', db.databaseName || '(default)');

    // helper to escape regex
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    // 1) Try exact match first
    let existing = await users.findOne({ email });

    // 2) If not found, try case-insensitive exact-match via regex
    if (!existing) {
      existing = await users.findOne({ email: { $regex: `^${escapeRegExp(email)}$`, $options: 'i' } });
      if (existing) {
        console.log('Found user by case-insensitive match, id:', existing._id?.toString(), 'stored email:', existing.email);
      }
    } else {
      console.log('Found user by exact match, id:', existing._id?.toString(), 'stored email:', existing.email);
    }

    if (!existing) {
      // Provide some helpful context: list users with the same domain
      const domain = email.split('@')[1];
      if (domain) {
        const nearby = await users.find({ email: { $regex: escapeRegExp(domain) + '$', $options: 'i' } }).limit(10).toArray();
        console.log('No exact user found. Users with same domain:');
        for (const u of nearby) {
          console.log('-', u._id?.toString(), u.email);
        }
      }
      console.error('No user found with email:', email);
      process.exitCode = 2;
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    const upd = await users.updateOne({ _id: existing._id }, { $set: { password: hashed } });
    if (upd.modifiedCount === 1) {
      console.log('Password updated for user:', existing.email);
    } else {
      console.warn('Update ran but modifiedCount !== 1, result:', upd);
    }
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 3;
  } finally {
    await client.close();
  }
}

main();
