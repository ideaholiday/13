const fs = require('fs');
const path = require('path');

// Load airports data
const airports = require('./airports.json');

// Extract cities from airports - prioritize major cities
const cityMap = new Map();

airports.forEach(airport => {
  const cityKey = `${airport.city}|${airport.country}`;
  if (!cityMap.has(cityKey)) {
    cityMap.set(cityKey, {
      name: airport.city,
      country: airport.country,
      airportCode: airport.code,
      airportName: airport.name,
      type: 'city'
    });
  }
});

// Major Indian cities (ensure they're at the top)
const majorIndianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad',
  'Pune', 'Ahmedabad', 'Jaipur', 'Goa', 'Kochi', 'Thiruvananthapuram',
  'Guwahati', 'Lucknow', 'Chandigarh', 'Indore', 'Coimbatore', 'Varanasi',
  'Udaipur', 'Amritsar', 'Agra', 'Srinagar', 'Leh', 'Manali'
];

// Major international cities
const majorInternationalCities = [
  'Dubai', 'Singapore', 'Bangkok', 'Kuala Lumpur', 'London', 'Paris',
  'New York', 'Tokyo', 'Hong Kong', 'Istanbul', 'Barcelona', 'Amsterdam',
  'Sydney', 'Maldives', 'Bali', 'Phuket', 'Kathmandu', 'Colombo'
];

const cities = [];

// Add major Indian cities first
majorIndianCities.forEach(cityName => {
  const cityData = Array.from(cityMap.values()).find(
    c => c.name.toLowerCase() === cityName.toLowerCase() && c.country === 'India'
  );
  if (cityData) {
    cities.push(cityData);
  }
});

// Add major international cities
majorInternationalCities.forEach(cityName => {
  const cityData = Array.from(cityMap.values()).find(
    c => c.name.toLowerCase() === cityName.toLowerCase()
  );
  if (cityData) {
    cities.push(cityData);
  }
});

// Add remaining Indian cities
Array.from(cityMap.values())
  .filter(c => c.country === 'India' && !cities.find(city => city.name === c.name))
  .forEach(c => cities.push(c));

// Add remaining international cities (limit to avoid huge file)
Array.from(cityMap.values())
  .filter(c => c.country !== 'India' && !cities.find(city => city.name === c.name))
  .slice(0, 500)
  .forEach(c => cities.push(c));

// Write to file
fs.writeFileSync(
  path.join(__dirname, 'cities.json'),
  JSON.stringify(cities, null, 2)
);

console.log(`✓ Generated cities.json with ${cities.length} cities`);
console.log(`  - Indian cities: ${cities.filter(c => c.country === 'India').length}`);
console.log(`  - International cities: ${cities.filter(c => c.country !== 'India').length}`);
