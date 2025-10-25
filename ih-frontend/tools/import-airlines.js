/*
Import airlines from Excel into data/airlines.json
Usage:
  node tools/import-airlines.js
Place .xlsx/.xls in public/data/uploads/
*/

const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')

const root = path.join(__dirname, '..')
const uploads = path.join(root, 'public', 'data', 'uploads')
const outFile = path.join(root, 'data', 'airlines.json')

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

function extractAirlines(rows) {
  const out = []
  for (const r of rows) {
    const keys = Object.keys(r)
    const getVal = (candidates) => {
      for (const k of keys) {
        const lk = String(k).toLowerCase()
        if (candidates.some(s => lk.includes(s))) return String(r[k]).trim()
      }
      return ''
    }

    let code = getVal(['iata', 'code', 'airline code'])
    code = code.toUpperCase().slice(0, 2)
    if (!/^[A-Z0-9]{2}$/.test(code)) continue

    const name = getVal(['airline', 'name']) || ''
    if (!name) continue

    out.push({ code, name, logo: `/airlines/${code}.png` })
  }

  // de-duplicate by code
  const seen = new Set()
  const dedup = []
  for (const a of out) {
    if (seen.has(a.code)) continue
    seen.add(a.code)
    dedup.push(a)
  }
  return dedup
}

const airlines = extractAirlines(rows)
fs.writeFileSync(outFile, JSON.stringify(airlines, null, 2), 'utf-8')
console.log('Wrote', outFile, 'entries:', airlines.length)
