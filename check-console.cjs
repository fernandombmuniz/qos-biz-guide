const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:8080/security-assessment', { waitUntil: 'networkidle0' }).catch(e => console.log('Nav error:', e));

  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
