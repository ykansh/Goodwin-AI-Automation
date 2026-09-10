const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  try {
    await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded', timeout: 5000 });
    // wait 2 more seconds for react to render
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Page loaded successfully.');
  } catch (err) {
    console.log('Navigation Error:', err.message);
  }

  await browser.close();
})();
