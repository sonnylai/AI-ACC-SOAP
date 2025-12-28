const OpenAI = require("openai");
const client = new OpenAI();

async function parseCampaign(text) {
  const out = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 1,
    messages: [
      {
        role: "system",
        content: `Extract campaign info as strict JSON:
{
  "campaignName": "",
  "startDate": "",
  "endDate": "",
  "conditions": [
    { "field": "", "op": "", "value": "" }
  ]
}`
      },
      { role: "user", content: text }
    ]
  });

  return JSON.parse(out.choices[0].message.content);
}

module.exports = parseCampaign;
