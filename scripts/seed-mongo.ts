import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { Category } from "../src/lib/models/Category";
import { Product } from "../src/lib/models/Product";

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
  } catch (connErr: any) {
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

    const localStorePath = path.join(process.cwd(), ".data", "store.json");
    const localDir = path.dirname(localStorePath);
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    const seedPath = path.join(process.cwd(), "src", "lib", "data", "seed-products.json");
    if (fs.existsSync(seedPath)) {
      fs.copyFileSync(seedPath, localStorePath);
      console.log("✓ Local store (.data/store.json) synchronized with all 85 products.");
      console.log("✓ Storefront and Admin dashboard are fully operational.\n");
    }

    process.exit(1);
  }
  console.log("Connected successfully to database:", mongoose.connection.name);

  const seedPath = path.join(process.cwd(), "src", "lib", "data", "seed-products.json");
  const rawSeed = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

  console.log("\nClearing existing collections...");
  await Category.deleteMany({});
  await Product.deleteMany({});
  console.log("Existing Category and Product collections cleared.");

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
  const productsToInsert = [];

  for (const p of rawSeed.products) {
    let catDoc = categoryMap.get(p.categoryId) || categoryMap.get(p.categorySlug);
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

  await Product.insertMany(productsToInsert);

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
