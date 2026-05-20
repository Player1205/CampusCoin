const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("No MONGO_URI in .env");
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('test'); // wait, the atlas URL doesn't specify db, it says /?appName=CampusCoin. Usually it's 'test' by default in Atlas. I'll print the dbs first or just use client.db() which uses the default.
    // wait, I'll just use client.db() without name which uses the default from URI
    const defaultDb = client.db();
    const users = await defaultDb.collection('users').find({}).project({ email: 1, skills: 1, milestoneRewards: 1, coinBalance: 1 }).toArray();
    console.log("USERS:", JSON.stringify(users, null, 2));

    // Forcefully reset milestoneRewards.skills to false for all users
    const result = await defaultDb.collection('users').updateMany({}, { $set: { 'milestoneRewards.skills': false } });
    console.log(`Reset milestoneRewards.skills for ${result.modifiedCount} users`);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
