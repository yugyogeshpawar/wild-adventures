import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("=== WILD ADVENTURES PDF EXTRACTION PIPELINE ===\n");

// Step 1: Execute Python image & metadata extractor
console.log("1. Running Python PDF extractor (pypdf + Pillow)...");
const result = execSync("python3 scripts/extract-pdf-data.py", {
  encoding: "utf-8",
  env: {
    ...process.env,
    PYTHONPATH: `${process.cwd()}/scripts:${process.env.PYTHONPATH || ""}`,
  },
});
console.log(result);

// Step 2: Read generated seed-products.json
const seedJsonPath = path.join(process.cwd(), "src/lib/data/seed-products.json");
if (!fs.existsSync(seedJsonPath)) {
  console.error("Error: seed-products.json was not created!");
  process.exit(1);
}

const seedData = JSON.parse(fs.readFileSync(seedJsonPath, "utf-8"));
console.log(`2. Parsed ${seedData.products.length} products across ${seedData.categories.length} categories.`);

// Step 3: Update src/lib/db/seed.ts
console.log("3. Updating src/lib/db/seed.ts with extracted products...");
const seedTsContent = `import { Category, Product } from "../types";

export const initialCategories: Category[] = ${JSON.stringify(seedData.categories, null, 2)};

export const initialProducts: Product[] = ${JSON.stringify(seedData.products, null, 2)};
`;

fs.writeFileSync(path.join(process.cwd(), "src/lib/db/seed.ts"), seedTsContent, "utf-8");

// Step 4: Refresh .data/store.json
console.log("4. Refreshing .data/store.json local database store...");
const storeDir = path.join(process.cwd(), ".data");
if (!fs.existsSync(storeDir)) {
  fs.mkdirSync(storeDir, { recursive: true });
}
fs.writeFileSync(
  path.join(storeDir, "store.json"),
  JSON.stringify({ categories: seedData.categories, products: seedData.products }, null, 2),
  "utf-8"
);

console.log("\nEXTRACTION & SEEDING COMPLETE!");
console.log(`- Assets in public/images/products/handbags/`);
console.log(`- Data in src/lib/data/seed-products.json`);
console.log(`- Database active in .data/store.json (${seedData.products.length} products)\n`);
