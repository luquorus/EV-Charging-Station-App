/**
 * User Repository
 * Data access layer for User
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../infra/db/mongoClient');
const { mapDocToUserEntity, mapUserEntityToDoc } = require('../entities/userEntity');

const collectionName = 'users';

const userRepository = {
  /**
   * Find user by email
   */
  async findByEmail(email) {
    const db = getDb();
    const doc = await db.collection(collectionName).findOne({ email });
    return doc ? mapDocToUserEntity(doc) : null;
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const db = getDb();
    const doc = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
    return doc ? mapDocToUserEntity(doc) : null;
  },

  /**
   * Create new user
   */
  async create(userEntity) {
    const db = getDb();
    const doc = mapUserEntityToDoc(userEntity);
    const result = await db.collection(collectionName).insertOne(doc);
    return mapDocToUserEntity({ ...doc, _id: result.insertedId });
  },

  /**
   * Update user
   */
  async update(id, updates) {
    const db = getDb();
    const result = await db.collection(collectionName).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    return result.value ? mapDocToUserEntity(result.value) : null;
  },

  /**
   * Find all users (for admin)
   */
  async findAll({ page = 1, limit = 20, search = '' }) {
    const db = getDb();
    const filter = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
      ];
    }

    const cursor = db
      .collection(collectionName)
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const [docs, total] = await Promise.all([
      cursor.toArray(),
      db.collection(collectionName).countDocuments(filter),
    ]);

    return {
      items: docs.map(mapDocToUserEntity),
      total,
    };
  },
};

module.exports = { userRepository };

