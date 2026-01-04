const express = require("express");

const app = express();
app.use(express.json());

app.post("/mcp/authorize_auto_send", (req, res) => {
  const {
    customer_type,
    category,
    availability,
    bot_confidence
  } = req.body;

  let decision = "ALLOW";

  if (customer_type !== "storico") decision = "HUMAN";
  if (availability !== "immediata") decision = "HUMAN";
  if (bot_confidence < 0.9) decision = "HUMAN";
  if (["frizione", "motore", "trasmissione"].includes(category))
    decision = "HUMAN";

  res.json({
    decision,
    reason: "deterministic_rules_v0"
  });
});

app.listen(3333, () => {
  console.log("MCP Server attivo su http://localhost:3333");
});
