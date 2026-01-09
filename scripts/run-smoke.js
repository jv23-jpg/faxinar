const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = 'http://localhost:5000/index.html';
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 10000 });

    await page.fill('#service-price', '100');
    await page.fill('#service-quantity', '2');

    // Read total
    const total = await page.textContent('#total-value');
    console.log('Total exibido:', total);

    page.on('dialog', async (dialog) => {
      console.log('Dialog:', dialog.message());
      await dialog.accept();
    });

    await page.click('#btn-pay');

    // Open admin (prompt)
    page.once('dialog', async dialog => { console.log('Prompt shown:', dialog.message()); await dialog.accept('admin'); });
    await page.click('#open-admin');

    await page.fill('#admin-account-name', 'Empresa Demo');
    await page.fill('#admin-account-bank', '001 - Banco Demo');
    await page.fill('#admin-account-number', '1234-5');
    await page.click('#admin-save');

    const destFlag = await page.textContent('#dest-flag');
    console.log('dest-flag:', destFlag);

    await page.click('#btn-confirm');

    console.log('Smoke run completed successfully');
  } catch (err) {
    console.error('Error during smoke run:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();