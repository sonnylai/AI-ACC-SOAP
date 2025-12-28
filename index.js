require("dotenv").config();
const parseCampaign = require("./llm/parseCampaign");
const runCampaign = require("./orchestrator/runCampaign");

(async () => {
  const input =
    "Create campaign Holiday Sale targeting users in Singapore older than 25 with gmail";

  const intent = await parseCampaign(input);
  console.log("🎉 Campaign infor:", intent);

  const result = await runCampaign(intent);

  console.log("🎉 Campaign finished:", result);
})();
