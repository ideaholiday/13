/*
Simple import tool: drop Excel files into public/data/uploads/ and run:
  node tools/import-airports.js
It will scan the uploads folder for .xlsx files and create public/data/airports.json

Requires: npm i xlsx --save-dev (or dependency)
*/

const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')

const root = path.join(__dirname, '..')
const uploads = path.join(root, 'public', 'data', 'uploads')
const outFile = path.join(root, 'data', 'airports.json')

if (!fs.existsSync(uploads)) {
  console.error('No uploads dir:', uploads)
  process.exit(1)
}

const files = fs.readdirSync(uploads).filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'))
if (files.length === 0) {
  console.error('No Excel files in uploads')
  process.exit(1)
}

let rows = []
for (const f of files) {
  const wb = XLSX.readFile(path.join(uploads, f))
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const js = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  rows = rows.concat(js)
}

function extractAirports(rows) {
  const out = []
  for (const r of rows) {
    const keys = Object.keys(r)

    const getVal = (keyLikeArr) => {
      for (const k of keys) {
        const lk = String(k).toLowerCase()
        if (keyLikeArr.some(s => lk.includes(s))) return String(r[k]).trim()
      }
      return ''
    }

    // Try common headings
    let iata = getVal(['iata', 'code', 'airport code'])
    iata = iata.toUpperCase().slice(0, 3)
    if (!/^[A-Z]{3}$/.test(iata)) {
      // scan for any 3-letter cell
      for (const k of keys) {
        const v = String(r[k]).trim().toUpperCase()
        if (/^[A-Z]{3}$/.test(v)) { iata = v; break }
      }
    }

    const name = getVal(['name', 'airport name']) || getVal(['airport'])
    const city = getVal(['city']) || getVal(['location'])
    const country = getVal(['country']) || ''

    if (!iata || (!name && !city)) continue

    out.push({
      code: iata,
      iata,
      name: name || city,
      city: city || name,
      country: country || 'India',
      timezone: 'Asia/Kolkata'
    })
  }

  // de-duplicate by iata
  const seen = new Set()
  const dedup = []
  for (const a of out) {
    if (seen.has(a.iata)) continue
    seen.add(a.iata)
    dedup.push(a)
  }
  return dedup
}

const airports = extractAirports(rows)
fs.writeFileSync(outFile, JSON.stringify(airports, null, 2), 'utf-8')
console.log('Wrote', outFile, 'entries:', airports.length)
