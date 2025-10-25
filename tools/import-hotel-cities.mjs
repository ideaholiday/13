#!/usr/bin/env node
/**
 * import-hotel-cities.mjs
 * Convert CSV/TSV/TXT city lists into the JSON map used by HotelCityLookup.
 *
 * Usage:
 *   node tools/import-hotel-cities.mjs <input-file> [--out <output-json>] [--preview N]
 *
 * Output JSON shape:
 *   { "byCode": { "BOM": "394629", ... }, "byName": { "mumbai": "394629", ... } }
 */

import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = [...argv];
  const out = { input: null, out: null, preview: 0 };
  if (args.length < 3) return out;
  out.input = args[2];
  for (let i = 3; i < args.length; i++) {
    const a = args[i];
    if (a === '--out') { out.out = args[++i]; }
    else if (a === '--preview') { out.preview = parseInt(args[++i] || '0', 10) || 0; }
  }
  return out;
}

function readFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  return raw.replace(/\r\n?|\r/g, '\n');
}

function detectDelimiter(headerLine) {
  const cands = [',', '\t', ';', '|'];
  let best = ','; let bestN = -1;
  for (const d of cands) {
    const n = (headerLine.match(new RegExp(escapeReg(d), 'g')) || []).length;
    if (n > bestN) { bestN = n; best = d; }
  }
  return best;
}

function escapeReg(ch) {
  return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitLine(line, delim) {
  const out = [];
  let buf = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; continue; }
    if (!inQ && ch === delim) { out.push(buf.trim()); buf = ''; }
    else { buf += ch; }
  }
  out.push(buf.trim());
  return out;
}

function normalizeHeaders(headers) {
  const norm = headers.map(h => h.toLowerCase().trim());
  const pick = (cands) => {
    const idx = [];
    for (const c of cands) {
      const pos = norm.indexOf(c);
      if (pos !== -1) idx.push(pos);
    }
    return idx;
  };
  return {
    cityId: pick(['cityid','code','city code','tbo city id','tbo cityid','tbo code','city id','id']),
    cityName: pick(['name','cityname','city name']),
    iata3: pick(['citycode','iata','iata code','iata_code','code3','iata3']),
  };
}

function rowAssoc(row, headers) {
  const o = {};
  headers.forEach((h, i) => { o[h] = row[i] ?? ''; });
  return o;
}

function pick(row, indices, headers) {
  for (const i of indices) {
    const key = headers[i];
    const val = row[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
  }
  return null;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.input) {
    console.error('Usage: node tools/import-hotel-cities.mjs <input-file> [--out <output-json>] [--preview N]');
    process.exit(2);
  }
  if (!fs.existsSync(args.input)) {
    console.error('Input file not found:', args.input);
    process.exit(2);
  }

  const text = readFile(args.input);
  const lines = text.split('\n').filter(l => l.trim() !== '');
  if (lines.length < 2) {
    console.error('No rows found in input');
    process.exit(2);
  }
  const delim = detectDelimiter(lines[0]);
  const headers = splitLine(lines[0], delim);
  const mapIdx = normalizeHeaders(headers);
  const rows = lines.slice(1).map(l => splitLine(l, delim)).map(r => rowAssoc(r, headers));

  const byCode = {};
  const byName = {};
  for (const r of rows) {
    const cityId = pick(r, mapIdx.cityId, headers);
    const cityName = pick(r, mapIdx.cityName, headers);
    const iata3 = pick(r, mapIdx.iata3, headers);
    if (cityId) {
      if (iata3) byCode[iata3.toUpperCase()] = cityId;
      if (cityName) byName[cityName.toLowerCase()] = cityId;
    }
  }

  const outJson = { byCode, byName };
  const defaultOut = path.join(process.cwd(), 'ih-backend', 'data', 'tbo_hotel_cities.json');
  const outPath = args.out || process.env.TBO_HOTEL_CITY_MAP_FILE || defaultOut;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(outJson, null, 2), 'utf8');
  console.log('Wrote city map:', outPath);
  console.log('byCode=%d | byName=%d', Object.keys(byCode).length, Object.keys(byName).length);

  if (args.preview && args.preview > 0) {
    const sampleCodes = Object.entries(byCode).slice(0, args.preview);
    const sampleNames = Object.entries(byName).slice(0, args.preview);
    console.log('Sample byCode:', sampleCodes);
    console.log('Sample byName:', sampleNames);
  }
}

main();
