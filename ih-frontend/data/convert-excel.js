const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Convert Airport List
try {
  console.log('Converting Airport List...');
  const airportWorkbook = XLSX.readFile(path.join(__dirname, 'New Airport List (1).xlsx'));
  const airportSheetName = airportWorkbook.SheetNames[0];
  const airportSheet = airportWorkbook.Sheets[airportSheetName];
  const airportData = XLSX.utils.sheet_to_json(airportSheet);
  
  console.log(`Found ${airportData.length} airports`);
  console.log('Sample airport data:', JSON.stringify(airportData[0], null, 2));
  
  // Transform to our format
  const airports = airportData.map(row => ({
    code: row.AIRPORTCODE || row.IATA || row.iata || row.Code || row.code || '',
    iata: row.AIRPORTCODE || row.IATA || row.iata || row.Code || row.code || '',
    icao: row.ICAO || row.icao || '',
    name: row.AIRPORTNAME || row.Name || row.name || row.Airport || row.airport || '',
    city: row.CITYNAME || row.City || row.city || '',
    country: row.COUNTRYNAME || row.Country || row.country || 'India',
    timezone: row.Timezone || row.timezone || 'Asia/Kolkata',
    terminal: row.Terminal || row.terminal || ''
  })).filter(a => a.code && a.name); // Filter out rows without essential data
  
  fs.writeFileSync(
    path.join(__dirname, 'airports.json'),
    JSON.stringify(airports, null, 2)
  );
  console.log(`✓ Wrote ${airports.length} airports to airports.json`);
} catch (error) {
  console.error('Error converting airport list:', error.message);
}

// Convert Airline Codes
try {
  console.log('\nConverting Airline Codes...');
  const airlineWorkbook = XLSX.readFile(path.join(__dirname, 'Airline Code (1) 2 (1).xlsx'));
  const airlineSheetName = airlineWorkbook.SheetNames[0];
  const airlineSheet = airlineWorkbook.Sheets[airlineSheetName];
  const airlineData = XLSX.utils.sheet_to_json(airlineSheet);
  
  console.log(`Found ${airlineData.length} airlines`);
  console.log('Sample airline data:', JSON.stringify(airlineData[0], null, 2));
  
  // Transform to our format
  const airlines = airlineData.map(row => ({
    code: row.AIRLINECODE || row.Code || row.code || row.IATA || row.iata || '',
    name: row.AIRLINENAME || row.Name || row.name || row.Airline || row.airline || '',
    logo: row.Logo || row.logo || `/airlines/${(row.AIRLINECODE || row.Code || row.code || '').toLowerCase()}.png`,
    rating: row.Rating || row.rating || 4.0
  })).filter(a => a.code && a.name);
  
  fs.writeFileSync(
    path.join(__dirname, 'airlines.json'),
    JSON.stringify(airlines, null, 2)
  );
  console.log(`✓ Wrote ${airlines.length} airlines to airlines.json`);
} catch (error) {
  console.error('Error converting airline codes:', error.message);
}

console.log('\n✓ Conversion complete!');
