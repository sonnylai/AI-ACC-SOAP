const sendSoap = require("./transport");

/**
 * Create workflow linked to a campaign (operation)
 */
async function createWorkflow(client, campaignId) {
  const xml = `
    <element xtkschema="xtk:workflow">
      <label>AI Generated Workflow</label>
      <operationId>${campaignId}</operationId>
      <status>0</status>
    </element>
  `;

  const res = await sendSoap(client, "Write", { domDoc: xml });

  return {
    id: res?.pdomElement?.["@id"] || res?.id
  };
}

/**
 * Start workflow execution
 */
async function startWorkflow(client, workflowId) {
  return sendSoap(client, "Start", {
    workflowId
  });
}

module.exports = {
  createWorkflow,
  startWorkflow
};
