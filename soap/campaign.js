const sendSoap = require("./transport");

async function createCampaign({ campaignName, startDate, endDate }) {
  const xml = `
    <element xtkschema="nms:operation">
      <label>${campaignName}</label>
      <startDate>${startDate}</startDate>
      <endDate>${endDate}</endDate>
    </element>
  `;

  const res = await sendSoap("Write", xml);
  return { id: res.id };
}

async function createWorkflow(campaignId) {
  const xml = `
    <element xtkschema="xtk:workflow">
      <label>Auto workflow</label>
      <operationId>${campaignId}</operationId>
    </element>
  `;

  const res = await sendSoap("Write", xml);
  return { id: res.id };
}

async function startWorkflow(workflowId) {
  return sendSoap("Start", `<workflow id="${workflowId}"/>`);
}

module.exports = {
  createCampaign,
  createWorkflow,
  startWorkflow
};
