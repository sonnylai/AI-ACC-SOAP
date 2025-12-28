/**
 * Build vector database for Adobe Campaign schema
 * Run ONLY when schema.json changes
 */

require("dotenv").config(); // MUST be first

const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

const client = new OpenAI();

// ---- Paths ------------------------------------------------
const SCHEMA_PATH = path.join(__dirname, "..", "data", "schema.json");
const VECTOR_DB_PATH = path.join(
  __dirname,
  "..",
  "vector-db",
  "schema.vector.json"
);

// ---- Safety checks ---------------------------------------
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY not found in environment");
}

if (!fs.existsSync(SCHEMA_PATH)) {
  throw new Error("schema.json not found");
}

// ---- Load schema -----------------------------------------
const rawSchema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));

if (!Array.isArray(rawSchema.schemas)) {
  throw new Error("Invalid schema.json format: schemas[] missing");
}

// ---- Helper: build rich embedding text -------------------
function buildEmbeddingText(schemaName, field) {
  return `
Schema: ${schemaName}
Field name: ${field.name}
Label: ${field.label || ""}
Description: ${field.description || ""}
Business name: ${field.businessName || ""}
Tags: ${(field.tags || []).join(", ")}
Examples: ${(field.examples || []).join(", ")}
Usage: ${(field.usage || []).join(", ")}
Data type: ${field.type}
`.trim();
}

// ---- Main -------------------------------------------------
(async () => {
  console.log("🔨 Building vector database...");

  const documents = [];
  let counter = 0;

  for (const schema of rawSchema.schemas) {
    if (!Array.isArray(schema.fields)) continue;

    for (const field of schema.fields) {
      counter++;

      const text = buildEmbeddingText(schema.name, field);

      // Defensive: skip empty fields
      if (!text || text.length < 20) continue;

      const embeddingResponse = await client.embeddings.create({
        model: "text-embedding-3-large",
        input: text
      });

      documents.push({
        id: `${schema.name}.${field.name}`,
        schema: schema.name,
        field: field.name,
        type: field.type,
        embedding: embeddingResponse.data[0].embedding
      });

      if (counter % 10 === 0) {
        console.log(`  → Embedded ${counter} fields`);
      }

      // Soft rate-limit protection
      await new Promise(r => setTimeout(r, 50));
    }
  }

  fs.writeFileSync(
    VECTOR_DB_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        model: "text-embedding-3-small",
        count: documents.length,
        documents
      },
      null,
      2
    )
  );

  console.log(`✅ Vector DB created with ${documents.length} fields`);
})();
