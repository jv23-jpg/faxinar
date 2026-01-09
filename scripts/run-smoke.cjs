const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = 'file://' + process.cwd() + '/index.html';
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 10000 });

    await page.fill('#service-price', '100');
    await page.fill('#service-quantity', '2');

    // Read total
    const total = await page.textContent('#total-value');
    console.log('Total exibido:', total);

    // Simulate payment (capture alert)
    page.once('dialog', async (dialog) => {
      console.log('Dialog pay:', dialog.message());
      await dialog.accept();
    });
    await page.click('#btn-pay');

    // Open admin (prompt) and respond
    page.once('dialog', async dialog => { console.log('Prompt shown:', dialog.message()); await dialog.accept('admin'); });
    await page.click('#open-admin');

    await page.fill('#admin-account-name', 'Empresa Demo');
    await page.fill('#admin-account-bank', '001 - Banco Demo');
    await page.fill('#admin-account-number', '1234-5');
    await page.click('#admin-save');

    await page.waitForFunction(() => document.getElementById('dest-flag') && document.getElementById('dest-flag').textContent === 'configurada');
    const destFlag = await page.textContent('#dest-flag');
    console.log('dest-flag:', destFlag);

    // Close admin modal first
    await page.click('#admin-close');
    await page.waitForFunction(() => !document.querySelector('#admin-modal').classList.contains('active'));

    // Confirm payment
    page.once('dialog', async (dialog) => { console.log('Dialog confirm:', dialog.message()); await dialog.accept(); });
    await page.click('#btn-confirm');

    console.log('Smoke run completed successfully');
  } catch (err) {
    console.error('Error during smoke run:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();