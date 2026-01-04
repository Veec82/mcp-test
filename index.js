const express = require("express");

const app = express();
app.use(express.json());

/**
 * CATEGORY NORMALIZATION
 */
function normalizeCategory(rawCategory = "") {
  const c = rawCategory.toLowerCase();

  if (["filtro", "filtri", "oil", "aria", "abitacolo"].some(k => c.includes(k)))
    return "FILTERS";

  if (["freno", "pastiglia", "disco"].some(k => c.includes(k)))
    return "BRAKES";

  if (["batteria", "battery"].some(k => c.includes(k)))
    return "BATTERIES";

  if (["sensore", "elettrico", "abs"].some(k => c.includes(k)))
    return "ELECTRICAL";

  if (["motore", "engine"].some(k => c.includes(k)))
    return "ENGINE";

  if (["frizione", "trasmissione"].some(k => c.includes(k)))
    return "TRANSMISSION";

  return "GENERIC";
}

/**
 * PRICING RULES (v0)
 */
const PRICING_RULES = {
  FILTERS: { level: "LOW", percentage: 25 },
  BRAKES: { level: "MEDIUM", percentage: 35 },
  BATTERIES: { level: "MEDIUM", percentage: 40 },
  ELECTRICAL: { level: "MEDIUM", percentage: 45 },
  ENGINE: { level: "HIGH", percentage: 60 },
  TRANSMISSION: { level: "HIGH", percentage: 55 },
  GENERIC: { level: "MEDIUM", percentage: 30 }
};

app.post("/mcp/authorize_auto_send", (req, res) => {
  const { category } = req.body;

  const normalizedCategory = normalizeCategory(category);
  const pricing = PRICING_RULES[normalizedCategory];

  res.json({
    decision: "ALLOW",
    reason: "deterministic_pricing_advisor_v0",
    suggested_markup: {
      level: pricing.level,
      percentage: pricing.percentage,
      basis: "normalized_category",
      category: normalizedCategory
    }
  });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`MCP Pricing Advisor attivo sulla porta ${PORT}`);
});
