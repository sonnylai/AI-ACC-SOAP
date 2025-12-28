const OpenAI = require("openai");
const searchVector = require("../vector-db/vectorSearch");

const clientAI = new OpenAI();

function normalizeOperator(op, value) {
  if (op === "contains") return `contains(@FIELD, '${value}')`;
  return `@FIELD ${op} '${value}'`;
}

async function injectQuery(client, workflowId, conditions) {
  const where = [];

  for (const c of conditions) {
    const emb = await clientAI.embeddings.create({
      model: "text-embedding-3-large",
      input: c.field
    });

    const { field } = searchVector(
      emb.data[0].embedding,
      "nms:recipient"
    );

    const expr = normalizeOperator(c.operator, c.value)
      .replace("@FIELD", `@${field.field}`);

    where.push(`<condition expr="${expr}"/>`);
  }

  const xml = `
    <queryDef schema="nms:recipient">
      <where>${where.join("")}</where>
    </queryDef>
  `;

  await client.Write({ domDoc: xml });
}

module.exports = { injectQuery };
