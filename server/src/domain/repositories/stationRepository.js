const { ObjectId } = require('mongodb');
const { getDb } = require('../../infra/db/mongoClient');

const collectionName = 'stations';

async function findAll() {
  const db = getDb();
  const docs = await db.collection(collectionName).find({}).toArray();
  return docs;
}

async function findById(id) {
  const db = getDb();
  const doc = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
  return doc;
}

async function findNearest({ lat, lng, limit = 10 }) {
  const db = getDb();
  const docs = await db
    .collection(collectionName)
    .find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
        },
      },
    })
    .limit(parseInt(limit, 10))
    .toArray();
  return docs;
}

async function findInRange({ lat, lng, radiusKm = 50 }) {
  const db = getDb();
  const radiusMeters = parseFloat(radiusKm) * 1000;

  const docs = await db
    .collection(collectionName)
    .find({
      location: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)],
            radiusMeters / 6378100, // radius in radians
          ],
        },
      },
    })
    .toArray();

  return docs;
}

async function findManyWithFilters({ page, limit, search, minPowerKw, open247 }) {
  const db = getDb();
  const filter = {};

  if (search) {
    filter.$text = { $search: String(search) };
  }
  if (minPowerKw !== undefined) {
    filter.maxPowerKw = { $gte: Number(minPowerKw) };
  }
  if (typeof open247 === 'boolean') {
    filter.operatingHours = open247 ? '24/7' : { $ne: '24/7' };
  }

  const collection = db.collection(collectionName);

  const cursor = collection
    .find(filter)
    .skip((page - 1) * limit)
    .limit(limit);

  const [docs, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

  return { docs, total };
}

async function create(stationData) {
  const db = getDb();
  const doc = {
    ...stationData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await db.collection(collectionName).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

async function update(id, updates) {
  const db = getDb();
  const result = await db
    .collection(collectionName)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
  return result.value;
}

async function deleteById(id) {
  const db = getDb();
  await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
  stationRepository: {
    findAll,
    findById,
    findNearest,
    findInRange,
    findManyWithFilters,
    create,
    update,
    deleteById,
  },
};


