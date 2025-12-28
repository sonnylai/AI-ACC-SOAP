const cosine = require("compute-cosine-similarity");
const db = require("./schema.vector.json");

function searchVector(queryEmbedding, schemaName) {
  let best = null;
  let bestScore = -1;

  for (const doc of db.documents) {
    if (doc.schema !== schemaName) continue;

    const score = cosine(queryEmbedding, doc.embedding);
    if (score > bestScore) {
      bestScore = score;
      best = doc;
    }
  }

  return { field: best, confidence: bestScore };
}

module.exports = searchVector;
