const express = require("express");

const app = express();
app.use(express.json());

/**
 * CATEGORY NORMALIZATION (multi-match)
 */
function detectCategories(rawCategory = "") {
  if (typeof rawCategory !== "string") return ["GENERIC"];

  const c = rawCategory.toLowerCase();
  const matches = new Set();

  if (["filtro", "filtri", "oil", "aria", "abitacolo"].some(k => c.includes(k)))
    matches.add("FILTERS");

  if (["freno", "pastiglia", "disco"].some(k => c.includes(k)))
    matches.add("BRAKES");

  if (["batteria", "battery"].some(k => c.includes(k)))
    matches.add("BATTERIES");

  if (["sensore", "elettrico", "abs"].some(k => c.includes(k)))
    matches.add("ELECTRICAL");

  if (["motore", "engine"].some(k => c.includes(k)))
    matches.add("ENGINE");

  if (["frizione", "trasmissione", "volano"].some(k => c.includes(k)))
    matches.add("TRANSMISSION");

  if (matches.size === 0) matches.add("GENERIC");
  return Array.from(matches);
}

/**
 * PRICING RULES
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

  const categories = detectCategories(category);

  const suggested_markups = categories.map(cat => ({
    category: cat,
    level: PRICING_RULES[cat].level,
    percentage: PRICING_RULES[cat].percentage,
    basis: "normalized_category"
  }));

  res.json({
    decision: "ALLOW",
    reason: "deterministic_pricing_advisor_v0_2",
    suggested_markups
  });
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`MCP Pricing Advisor v0.2 attivo sulla porta ${PORT}`);
});
