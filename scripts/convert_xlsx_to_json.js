const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

function normalizeString(s) {
  return s == null ? '' : String(s).trim();
}

function toInteger(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toNumber(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node convert_xlsx_to_json.js <input.xlsx> <output.json>');
  process.exit(2);
}

const [inputXlsx, outputJson] = args;
if (!fs.existsSync(inputXlsx)) {
  console.error('Input file not found:', inputXlsx);
  process.exit(2);
}

const wb = xlsx.readFile(inputXlsx);
const sheetName = wb.SheetNames[0];
const rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

const products = [];
const seenSku = new Set();
const errors = [];

rows.forEach((r, idx) => {
  const rowNum = idx + 2; // assume header row 1
  const id = toInteger(r.id ?? r.ID ?? r.Id);
  const sku = normalizeString(r.sku ?? r.SKU);
  const name = normalizeString(r.name ?? r.Name);
  const brand = normalizeString(r.brand ?? r.Brand);
  const category = normalizeString(r.category ?? r.Category);
  const price = toNumber(r.price ?? r.Price);
  const stock = toInteger(r.stock ?? r.Stock);
  const description = normalizeString(r.description ?? r.Description);

  if (!id) errors.push(`Row ${rowNum}: invalid/missing id`);
  if (!sku) errors.push(`Row ${rowNum}: invalid/missing sku`);
  if (!name) errors.push(`Row ${rowNum}: invalid/missing name`);
  if (price === null) errors.push(`Row ${rowNum}: invalid/missing price`);
  if (stock === null) errors.push(`Row ${rowNum}: invalid/missing stock`);

  if (seenSku.has(sku)) errors.push(`Row ${rowNum}: duplicate sku ${sku}`);
  seenSku.add(sku);

  products.push({
    id: id || null,
    sku,
    name,
    brand,
    category,
    price,
    stock,
    description,
  });
});

if (errors.length) {
  console.warn('Validation found issues:');
  errors.slice(0, 50).forEach(e => console.warn('-', e));
  if (errors.length > 50) console.warn(`...and ${errors.length - 50} more`);
}

// Write backup if target exists
if (fs.existsSync(outputJson)) {
  const bak = outputJson + '.bak.' + Date.now();
  fs.copyFileSync(outputJson, bak);
  console.log('Backed up existing', outputJson, '->', bak);
}

fs.writeFileSync(outputJson, JSON.stringify(products, null, 2), 'utf8');
console.log('Wrote', products.length, 'products to', outputJson);
