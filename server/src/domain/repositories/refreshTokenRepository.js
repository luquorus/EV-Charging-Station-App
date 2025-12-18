/**
 * RefreshToken Repository
 * Data access layer for RefreshToken
 */

const { ObjectId } = require('mongodb');
const { getDb } = require('../../infra/db/mongoClient');
const {
  mapDocToRefreshTokenEntity,
  mapRefreshTokenEntityToDoc,
} = require('../entities/refreshTokenEntity');

const collectionName = 'refresh_tokens';

const refreshTokenRepository = {
  /**
   * Create refresh token
   */
  async create(tokenEntity) {
    const db = getDb();
    const doc = mapRefreshTokenEntityToDoc({
      ...tokenEntity,
      userId: new ObjectId(tokenEntity.userId),
    });
    const result = await db.collection(collectionName).insertOne(doc);
    return mapDocToRefreshTokenEntity({ ...doc, _id: result.insertedId });
  },

  /**
   * Find token by hash
   */
  async findByTokenHash(tokenHash) {
    const db = getDb();
    const doc = await db.collection(collectionName).findOne({ tokenHash });
    return doc ? mapDocToRefreshTokenEntity(doc) : null;
  },

  /**
   * Revoke token
   */
  async revoke(tokenId, replacedByTokenId = null) {
    const db = getDb();
    await db.collection(collectionName).updateOne(
      { _id: new ObjectId(tokenId) },
      {
        $set: {
          revokedAt: new Date(),
          replacedByTokenId: replacedByTokenId ? new ObjectId(replacedByTokenId) : null,
        },
      },
    );
  },

  /**
   * Revoke all tokens for a user
   */
  async revokeAllForUser(userId) {
    const db = getDb();
    await db.collection(collectionName).updateMany(
      { userId: new ObjectId(userId), revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  },

  /**
   * Delete expired tokens (cleanup)
   */
  async deleteExpired() {
    const db = getDb();
    await db.collection(collectionName).deleteMany({
      expiresAt: { $lt: new Date() },
    });
  },
};

module.exports = { refreshTokenRepository };

