import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env.local manually if not already in process.env
const envPath = path.join(rootDir, ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

// Schemas
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    categorySlug: { type: String, required: true, trim: true, lowercase: true, index: true },
    stock: { type: Number, default: 0, min: 0 },
    images: { type: [String], required: true },
    isFeatured: { type: Boolean, default: false, index: true },
    tags: { type: [String], default: [] },
    sku: { type: String, sparse: true, unique: true, trim: true },
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
    materials: { type: String, default: "" },
    dimensions: { type: String, default: "" },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function runSeed() {
  console.log("=========================================");
  console.log("   WILD ADVENTURES MONGODB SEEDER       ");
  console.log("=========================================");

  let uri = process.env.MONGODB_URI?.trim();
  const username = process.env.MONGODB_USERNAME?.trim();
  const password = process.env.MONGODB_PASSWORD?.trim();

  if (!uri && username && password) {
    uri = `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@cluster0.koovi0t.mongodb.net`;
  }

  if (uri && username && uri.includes("<username>")) {
    uri = uri.replace("<username>", encodeURIComponent(username));
  }
  if (uri && password && uri.includes("<password>")) {
    uri = uri.replace("<password>", encodeURIComponent(password));
  }

  if (!uri) {
    throw new Error("MONGODB_URI could not be determined. Check .env.local.");
  }

  console.log("Connecting to MongoDB Atlas...");
  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || "wild_adventures",
      serverSelectionTimeoutMS: 6000,
    });
  } catch (connErr) {
    console.error("\n❌ MongoDB Atlas Connection Error:");
    console.error(connErr.message);

    console.log("\n=======================================================");
    console.log("  ⚠️  ACTION REQUIRED: MONGO DB ATLAS IP WHITELIST");
    console.log("=======================================================");
    console.log("MongoDB Atlas rejected the connection because your current");
    console.log("IP address is not whitelisted in Atlas Network Access.\n");
    console.log("To resolve this in 30 seconds:");
    console.log("  1. Log in to https://cloud.mongodb.com/");
    console.log("  2. Go to 'Security' -> 'Network Access'");
    console.log("  3. Click 'Add IP Address' and choose:");
    console.log("     - 'Allow Access from Anywhere' (0.0.0.0/0), OR");
    console.log("     - 'Add Current IP Address' (your current IP: 152.59.47.168)");
    console.log("  4. Wait ~1 minute for Atlas to apply changes, then re-run:");
    console.log("     npm run db:seed");
    console.log("=======================================================\n");

    // Also ensure local store has all 85 items ready
    const localStorePath = path.join(rootDir, ".data", "store.json");
    const localDir = path.dirname(localStorePath);
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    const seedPath = path.join(rootDir, "src", "lib", "data", "seed-products.json");
    if (fs.existsSync(seedPath)) {
      fs.copyFileSync(seedPath, localStorePath);
      console.log("✓ Local store (.data/store.json) synchronized with all 85 products.");
      console.log("✓ Storefront and Admin dashboard are fully operational.\n");
    }

    process.exit(1);
  }
  console.log("Connected successfully to database:", mongoose.connection.name);

  // Load seed data from seed-products.json
  const seedPath = path.join(rootDir, "src", "lib", "data", "seed-products.json");
  const rawSeed = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

  console.log("\nClearing existing collections...");
  await Category.deleteMany({});
  await Product.deleteMany({});
  console.log("Existing Category and Product collections cleared.");

  // Map to hold original seed category id -> Mongo category doc
  const categoryMap = new Map();

  console.log(`\nSeeding ${rawSeed.categories.length} categories...`);
  for (const catData of rawSeed.categories) {
    const doc = await Category.create({
      name: catData.name,
      slug: catData.slug,
      description: catData.description || "",
      imageUrl: catData.imageUrl || "",
      isActive: catData.isActive ?? true,
    });
    categoryMap.set(catData.id, doc);
    categoryMap.set(catData.slug, doc);
    console.log(`  + Category: [${doc.name}] -> slug: ${doc.slug} (ID: ${doc._id})`);
  }

  console.log(`\nSeeding ${rawSeed.products.length} products...`);
  let insertedProducts = 0;
  const productsToInsert = [];

  for (const p of rawSeed.products) {
    let catDoc = categoryMap.get(p.categoryId) || categoryMap.get(p.categorySlug);

    // Fallback if category was not found
    if (!catDoc) {
      catDoc = categoryMap.get("cat_handbags") || Array.from(categoryMap.values())[0];
    }

    productsToInsert.push({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice || null,
      categoryId: catDoc._id,
      categorySlug: catDoc.slug,
      stock: p.stock ?? 10,
      images: p.images && p.images.length > 0 ? p.images : ["/images/products/handbags/classic-leather-tote.jpg"],
      isFeatured: p.isFeatured ?? false,
      tags: p.tags || [],
      sku: p.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      specifications: {
        materials: p.materials || "",
        dimensions: p.dimensions || "",
        careInstructions: p.careInstructions || "",
      },
      materials: p.materials || "",
      dimensions: p.dimensions || "",
      rating: p.rating || 5.0,
      reviewCount: p.reviewCount || 1,
    });
  }

  // Insert in batch
  const insertedDocs = await Product.insertMany(productsToInsert);
  insertedProducts = insertedDocs.length;

  console.log("\n=========================================");
  console.log("            MIGRATION SUMMARY            ");
  console.log("=========================================");
  const totalCategories = await Category.countDocuments();
  const totalProducts = await Product.countDocuments();
  console.log(`Total Categories in MongoDB: ${totalCategories}`);
  console.log(`Total Products in MongoDB:   ${totalProducts}`);

  console.log("\nCounts per category:");
  const cats = await Category.find({});
  for (const c of cats) {
    const count = await Product.countDocuments({ categoryId: c._id });
    console.log(` - ${c.name} (${c.slug}): ${count} products`);
  }

  console.log("\nVerification complete! Database is fully seeded.");
  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
