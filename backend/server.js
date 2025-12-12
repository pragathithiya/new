/**
 * Product Chatbot Backend (Express)
 * ----------------------------------
 * Endpoints:
 *  GET /products?names=true         → Only product names
 *  GET /products?q=term             → Search products
 *  POST /chat                       → Chatbot with Gemini integration
 *
 * How to run:
 *  npm install express cors dotenv node-fetch@2
 *  node server.js
 */

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Load product database
const PRODUCTS_FILE = path.join(__dirname, "products.json");
let products = [];
if (fs.existsSync(PRODUCTS_FILE)) {
  try {
    products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
  } catch (e) {
    console.error("Failed to parse products.json:", e);
    products = [];
  }
}

/* -----------------------------------------------------
   GET /products — return product list or names only
----------------------------------------------------- */
app.get("/products", (req, res) => {
  const namesOnly = req.query.names === "true";
  const search = req.query.q;

  let result = products;

  if (search) {
    const s = search.toLowerCase();
    result = result.filter(
      p =>
        p.name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s)
    );
  }

  if (namesOnly) {
    return res.json(result.map(p => p.name));
  }
  res.json(result);
});

/* -----------------------------------------------------
   POST /chat — chatbot logic + Gemini API integration
----------------------------------------------------- */
app.post("/chat", async (req, res) => {
  const message = req.body.message || "";

  if (!message)
    return res.status(400).json({ error: "Message is required" });

  const m = message.toLowerCase();

  // Local response if user asks about products
  if (
    m.includes("list") ||
    m.includes("names") ||
    m.includes("show products") ||
    m.includes("product list") ||
    m.includes("give the list") ||
    m.includes("give list") ||
    m.includes("give the list product") ||
    m.includes("product names")
  ) {
    return res.json({
      reply: "Here are the product names:",
      // Return all product names (caller should paginate if needed)
      products: products.map(p => p.name),
    });
  }

  // Local product lookup: if the user references an SKU, id, exact name or brand,
  // return matching product details without calling Gemini.
  const skuMatch = message.match(/(sku[-_ ]?\d{1,6}|product\s*\d{1,6})/i);
  const idMatch = message.match(/\b(\d{1,6})\b/);
  let localMatches = [];
  if (skuMatch) {
    const s = skuMatch[0].replace(/[^0-9]/g, "");
    localMatches = products.filter(p => String(p.id) === s || (p.sku && p.sku.toLowerCase().includes(s)));
  }
  // try id or name/brand search when no SKU
  if (!localMatches.length && idMatch) {
    const id = idMatch[1];
    localMatches = products.filter(p => String(p.id) === id);
  }
  if (!localMatches.length) {
    // fuzzy search by words in message against name/brand/description
    const words = m.split(/\s+/).filter(Boolean).map(w => w.replace(/[^a-z0-9]/gi, ''));
    // also look for SKU-like alphanumeric tokens (e.g., TXJ001 or TXJ 001)
    const alphaTokens = m.split(/\s+/).map(t => t.replace(/[^a-z0-9]/gi, '')).filter(t => t.length >= 3);
    localMatches = products.filter(p => {
      const hay = (p.name + ' ' + (p.brand||'') + ' ' + (p.description||'') + ' ' + (p.category||'')).toLowerCase();
      // match if any word or token appears in product fields
      const anyWord = words.some(w => w && hay.includes(w));
      const anyToken = alphaTokens.some(t => t && hay.includes(t.toLowerCase()));
      // also allow matching if the whole message is substring
      const whole = m && hay.includes(m.replace(/[^a-z0-9 ]/gi, ''));
      return anyWord || anyToken || whole;
    });
  }

  if (localMatches && localMatches.length) {
    // return concise product details
    const limited = localMatches.slice(0, 20).map(p => ({ id: p.id, sku: p.sku, name: p.name, brand: p.brand, category: p.category, price: p.price, stock: p.stock, description: p.description }));
    return res.json({ reply: `Found ${localMatches.length} matching product(s).`, products: limited });
  }

  // ---------- Gemini Integration ----------
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_KEY) {
    return res.status(500).json({
      error: "Gemini API key missing. Add GEMINI_API_KEY in .env file.",
    });
  }

  try {
    // Make request to Gemini. Send API key both as query param (legacy) and
    // Authorization header. Also check for non-OK responses and surface errors.
    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
      GEMINI_KEY;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + GEMINI_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Gemini request failed:", response.status, text);
      return res.status(502).json({ error: "Gemini request failed.", details: text });
    }

    const data = await response.json();
    const aiText =
      (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) ||
      "No response.";

    res.json({ reply: aiText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini request failed." });
  }
});

/* ----------------------------------------------------- */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
