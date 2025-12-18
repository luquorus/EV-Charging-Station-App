/**
 * User Entity
 * Domain model for User
 */

const UserRoles = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  USER: 'USER',
};

const UserStatus = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
};

/**
 * Map MongoDB document to User entity
 */
function mapDocToUserEntity(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    email: doc.email,
    passwordHash: doc.passwordHash, // Only for internal use, never expose
    role: doc.role || UserRoles.USER,
    fullName: doc.fullName || null,
    status: doc.status || UserStatus.ACTIVE,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Map User entity to MongoDB document (for insert/update)
 */
function mapUserEntityToDoc(entity) {
  return {
    email: entity.email,
    passwordHash: entity.passwordHash,
    role: entity.role || UserRoles.USER,
    fullName: entity.fullName || null,
    status: entity.status || UserStatus.ACTIVE,
    createdAt: entity.createdAt || new Date(),
    updatedAt: entity.updatedAt || new Date(),
  };
}

/**
 * Create User DTO for API response (exclude sensitive fields)
 */
function toUserDto(entity) {
  return {
    id: entity.id,
    email: entity.email,
    role: entity.role,
    fullName: entity.fullName,
    status: entity.status,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

module.exports = {
  UserRoles,
  UserStatus,
  mapDocToUserEntity,
  mapUserEntityToDoc,
  toUserDto,
};

