import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Resolves the MongoDB connection string, dynamically handling
 * placeholder interpolation or individual credentials if needed.
 */
function getMongoUri(): string {
  let uri = process.env.MONGODB_URI?.trim() || "";
  const username = process.env.MONGODB_USERNAME?.trim();
  const password = process.env.MONGODB_PASSWORD?.trim();

  if (uri) {
    if (username && uri.includes("<username>")) {
      uri = uri.replace("<username>", encodeURIComponent(username));
    }
    if (password && uri.includes("<password>")) {
      uri = uri.replace("<password>", encodeURIComponent(password));
    }
    return uri;
  }

  if (username && password) {
    return `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@cluster0.koovi0t.mongodb.net`;
  }

  throw new Error(
    "Please define MONGODB_URI in .env.local (or provide MONGODB_USERNAME and MONGODB_PASSWORD)"
  );
}

/**
 * Cached singleton database connection to avoid creating multiple
 * connections across Next.js API routes and Server Actions in development.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = getMongoUri();
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB_NAME || "wild_adventures",
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
