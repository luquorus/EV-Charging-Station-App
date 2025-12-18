const { MongoClient } = require('mongodb');
const { logger } = require('../../config/logger');

let client;
let db;

async function connectMongo() {
  if (db) return db;

  const uri =
    process.env.MONGODB_URI ||
    'mongodb+srv://luquoruswork_db_user:luquorus@cluster0.i4bwlfm.mongodb.net/?appName=Cluster0';
  const dbName = process.env.MONGODB_DB_NAME || 'ev_charging';

  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment');
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  logger.info({ dbName }, 'Connected to MongoDB (mongoClient)');
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('MongoDB not initialized. Call connectMongo() first.');
  }
  return db;
}

module.exports = {
  connectMongo,
  getDb,
};
