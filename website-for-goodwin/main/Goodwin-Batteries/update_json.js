const fs = require('fs');

const path = './data/goodwinProducts.json';
const products = JSON.parse(fs.readFileSync(path, 'utf8'));

for (const p of products) {
  const warrantyStr = p.warranty || '';
  if (warrantyStr && !p.name.includes(warrantyStr) && !p.name.includes('Months')) {
    p.name = `${p.name} (${warrantyStr})`;
  }
}

fs.writeFileSync(path, JSON.stringify(products, null, 2));
console.log('Updated goodwinProducts.json');
