/**
 * RefreshToken Entity
 * Domain model for Refresh Token
 */

/**
 * Map MongoDB document to RefreshToken entity
 */
function mapDocToRefreshTokenEntity(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    tokenHash: doc.tokenHash,
    createdAt: doc.createdAt,
    expiresAt: doc.expiresAt,
    revokedAt: doc.revokedAt || null,
    replacedByTokenId: doc.replacedByTokenId || null,
  };
}

/**
 * Map RefreshToken entity to MongoDB document
 */
function mapRefreshTokenEntityToDoc(entity) {
  return {
    userId: entity.userId,
    tokenHash: entity.tokenHash,
    createdAt: entity.createdAt || new Date(),
    expiresAt: entity.expiresAt,
    revokedAt: entity.revokedAt || null,
    replacedByTokenId: entity.replacedByTokenId || null,
  };
}

module.exports = {
  mapDocToRefreshTokenEntity,
  mapRefreshTokenEntityToDoc,
};

