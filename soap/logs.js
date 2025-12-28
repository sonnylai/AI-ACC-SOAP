async function waitForWorkflow(client, workflowId) {
  let status = "running";

  while (status === "running") {
    await new Promise(r => setTimeout(r, 3000));

    const res = await client.Query({
      queryDef: `
        <queryDef schema="xtk:workflowLog">
          <where>
            <condition expr="@workflowId=${workflowId}"/>
          </where>
        </queryDef>
      `
    });

    status = res.status || "finished";
  }

  return { status };
}

module.exports = { waitForWorkflow };
