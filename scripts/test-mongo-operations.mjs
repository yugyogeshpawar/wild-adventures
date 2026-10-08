import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env.local
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

// Schemas matching src/lib/models
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

async function runTests() {
  console.log("=========================================");
  console.log("   MONGODB DATA ACCESS LAYER TEST        ");
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

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || "wild_adventures",
  });
  console.log("Connected successfully to DB:", mongoose.connection.name);

  // 1. Categories Query
  console.log("\n[Test 1] Querying categories from MongoDB...");
  const categories = await Category.find({}).sort({ name: 1 }).lean();
  console.log(`Found ${categories.length} categories.`);
  if (categories.length === 0) throw new Error("No categories found");
  categories.forEach((c) => console.log(`  - ${c.name} (${c.slug}) [ID: ${c._id}]`));

  // 2. Products Query (All)
  console.log("\n[Test 2] Querying all products from MongoDB...");
  const allProducts = await Product.find({}).lean();
  console.log(`Found ${allProducts.length} total products in MongoDB.`);
  if (allProducts.length === 0) throw new Error("No products found");

  // 3. Products Filter by Category Slug (hand-bag)
  console.log("\n[Test 3] Filtering products by categorySlug='hand-bag'...");
  const handbags = await Product.find({ categorySlug: "hand-bag" }).lean();
  console.log(`Found ${handbags.length} Hand Bag products.`);
  if (handbags.length === 0) throw new Error("Expected Hand Bags");

  // 4. Products Filter by Category Slug (lunch-bags)
  console.log("\n[Test 4] Filtering products by categorySlug='lunch-bags'...");
  const lunchBags = await Product.find({ categorySlug: "lunch-bags" }).lean();
  console.log(`Found ${lunchBags.length} Special Lunch Bag products.`);
  if (lunchBags.length === 0) throw new Error("Expected Lunch Bags");

  // 5. Query Single Product by Slug
  console.log("\n[Test 5] Querying single product by slug ('classic-leather-tote')...");
  const tote = await Product.findOne({ slug: "classic-leather-tote" }).lean();
  if (!tote) throw new Error("Product classic-leather-tote not found");
  console.log(`Found: ${tote.name} ($${tote.price}) - SKU: ${tote.sku}`);
  console.log(`Materials: ${tote.materials || tote.specifications?.materials}`);
  console.log(`Dimensions: ${tote.dimensions || tote.specifications?.dimensions}`);

  // 6. Test Product CRUD Operations
  console.log("\n[Test 6] Testing Product CRUD cycle...");
  const testProd = await Product.create({
    name: "Automated Test Leather Clutch",
    slug: "automated-test-leather-clutch",
    description: "Temporary testing item for MongoDB integration.",
    price: 195,
    compareAtPrice: 240,
    categoryId: handbags[0].categoryId,
    categorySlug: "hand-bag",
    stock: 7,
    images: ["/images/products/handbags/monogram-clutch-wallet.jpg"],
    isFeatured: true,
    tags: ["Test", "Luxury"],
    sku: `TEST-CLUTCH-${Date.now().toString().slice(-4)}`,
    materials: "Italian Saffiano Leather",
    dimensions: '9" W x 5" H x 1" D',
    specifications: {
      materials: "Italian Saffiano Leather",
      dimensions: '9" W x 5" H x 1" D',
    },
  });
  console.log(`Created product ID: ${testProd._id}, slug: ${testProd.slug}`);

  // Verify created
  const fetchedAfterCreate = await Product.findById(testProd._id).lean();
  if (!fetchedAfterCreate) throw new Error("Failed to fetch created product");
  console.log(`Verified creation: ${fetchedAfterCreate.name}`);

  // Update
  console.log("Updating product price and stock...");
  const updatedProd = await Product.findByIdAndUpdate(
    testProd._id,
    { price: 215, stock: 12 },
    { new: true }
  ).lean();
  if (!updatedProd || updatedProd.price !== 215 || updatedProd.stock !== 12) {
    throw new Error("Update verification failed");
  }
  console.log(`Updated successfully: new price $${updatedProd.price}, stock ${updatedProd.stock}`);

  // Delete
  console.log("Deleting test product...");
  const deleteRes = await Product.deleteOne({ _id: testProd._id });
  if (deleteRes.deletedCount !== 1) throw new Error("Failed to delete test product");
  const fetchedAfterDelete = await Product.findById(testProd._id).lean();
  if (fetchedAfterDelete !== null) throw new Error("Product still exists after deletion");
  console.log("Test product cleanly deleted from MongoDB.");

  // 7. Dashboard Stats Aggregation
  console.log("\n[Test 7] Testing Dashboard Telemetry Aggregation...");
  const [
    totalProducts,
    activeCategories,
    lowStockCount,
    outOfStockCount,
    inventoryAgg,
  ] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments({ isActive: true }),
    Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
    Product.countDocuments({ stock: 0 }),
    Product.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: "$stock" },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
        },
      },
    ]),
  ]);

  console.log(`Total Products in DB:       ${totalProducts}`);
  console.log(`Active Categories in DB:    ${activeCategories}`);
  console.log(`Low Stock Alerts in DB:     ${lowStockCount}`);
  console.log(`Total Inventory Units:      ${inventoryAgg[0]?.totalCount || 0}`);
  console.log(`Total Inventory Valuation:  $${(inventoryAgg[0]?.totalValue || 0).toLocaleString()}`);

  console.log("\n=========================================");
  console.log("      ALL TESTS PASSED SUCCESSFULLY!     ");
  console.log("=========================================");

  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
