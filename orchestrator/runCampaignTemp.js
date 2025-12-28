const createSession = require("../soap/session");
const { createCampaign } = require("../soap/campaign");
const { createWorkflow, startWorkflow } = require("../soap/workflow");
const { injectQuery } = require("../soap/query");
const { waitForWorkflow } = require("../soap/logs");
const OpenAI = require("openai");
const searchVector = require("../vector-db/vectorSearch");

function normalizeOperator(op, value) {
  if (op === "contains") return `contains(@FIELD, '${value}')`;
  return `@FIELD ${op} '${value}'`;
}

// Temporary version for testing
async function injectQueryTemp(workflowId, conditions) {
  const where = [];
  const clientAI = new OpenAI();

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

  //await client.Write({ domDoc: xml });
  return  xml;
}

// Temporary version for testing
async function runCampaignTemp(intent) {
  const xml = await injectQueryTemp('123', intent.conditions);
  return xml;
}

async function runCampaign(intent) {
  const client = await createSession();

  const campaign = await createCampaign(client, intent);
  const workflow = await createWorkflow(client, campaign.id);

  await injectQuery(client, workflow.id, intent.conditions);
  await startWorkflow(client, workflow.id);

  const logs = await waitForWorkflow(client, workflow.id);

  return {
    campaignId: campaign.id,
    workflowId: workflow.id,
    execution: logs
  };
}

module.exports = runCampaignTemp;
