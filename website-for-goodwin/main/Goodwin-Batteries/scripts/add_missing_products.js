const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/goodwinProducts.json');
const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));

products.push({
  id: "prod-gold-erickshaw",
  name: "GW-GOLD E-RICKSHAW",
  series: "Goodwin Gold",
  slug: "gw-gold-erickshaw",
  voltage: "12V",
  ah: "100Ah",
  cca: "N/A",
  category: "cat-e-rickshaw",
  technology: "Deep Cycle / Tubular",
  application: ["E-Rickshaw", "E-Vehicle"],
  warranty: "12 Months",
  warranty_options: ["6 Months", "12 Months"],
  image: "/assets/products/Gold Series.png",
  description: "Premium heavy-duty tubular battery specifically engineered for E-Rickshaws ensuring longer mileage.",
  dimensions: "410 x 175 x 280 mm",
  weight: "28.5 kg",
  terminalLayout: "L-Type",
  datasheet: "",
  is_published: true,
  features: ["Tubular Technology", "Extra Mileage", "Deep Discharge Recovery"]
});

products.push({
  id: "prod-inverter-tubular",
  name: "GW-INVERTER TUBULAR",
  series: "Goodwin Home",
  slug: "gw-inverter-tubular",
  voltage: "12V",
  ah: "150Ah",
  cca: "N/A",
  category: "cat-inverter",
  technology: "Tall Tubular",
  application: ["Home Inverter", "Solar", "UPS"],
  warranty: "60 Months",
  warranty_options: ["36 Months", "60 Months"],
  image: "/assets/products/Inverter Batteries.png",
  description: "High capacity tall tubular battery for uninterrupted power supply in homes and offices.",
  dimensions: "505 x 190 x 410 mm",
  weight: "58.0 kg",
  terminalLayout: "L-Type",
  datasheet: "",
  is_published: true,
  features: ["Tall Tubular", "Low Maintenance", "Long Life"]
});

fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
console.log("Added 2 missing products.");
