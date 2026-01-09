const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = 'file://' + process.cwd() + '/index.html';
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 10000 });
    console.log('✓ Página carregada');

    // Open registration
    await page.click('#open-register');
    await page.waitForFunction(() => !document.getElementById('registration').classList.contains('hidden'));
    console.log('✓ Modal de cadastro aberto');

    // Step 1: Fill data
    await page.fill('#r-name', 'João Silva');
    await page.fill('#r-phone', '11987654321');
    await page.fill('#r-cpf', '123.456.789-09');
    await page.fill('#r-email', 'joao@email.com');
    await page.selectOption('#r-state', 'RS');
    await page.waitForFunction(() => {
      const opts = document.querySelectorAll('#r-city option');
      return opts.length > 1;
    });
    await page.selectOption('#r-city', 'Porto Alegre');
    console.log('✓ Formulário Step 1 preenchido');

    // Next to step 2
    await page.click('#reg-next');
    await page.waitForFunction(() => !document.getElementById('step-2').classList.contains('hidden'));
    console.log('✓ Step 2: Ganhos com limpezas visível');

    // Next to step 3
    await page.click('#reg-next');
    await page.waitForFunction(() => !document.getElementById('step-3').classList.contains('hidden'));
    console.log('✓ Step 3: Exemplo de ganhos visível');

    // Next to step 4
    await page.click('#reg-next');
    await page.waitForFunction(() => !document.getElementById('step-4').classList.contains('hidden'));
    console.log('✓ Step 4: Finalização visível');

    // Fill password and terms
    await page.fill('#r-pass', 'senha123');
    await page.fill('#r-pass-confirm', 'senha123');
    await page.check('#r-terms');
    console.log('✓ Senha e termos preenchidos');

    // Next to step 5 (training)
    page.once('dialog', async (dialog) => {
      console.log('✓ Dialog: ' + dialog.message());
      await dialog.accept();
    });
    await page.click('#reg-next');
    await page.waitForFunction(() => !document.getElementById('step-5').classList.contains('hidden'));
    console.log('✓ Step 5: Treinamento visível');

    // Verify saved data in localStorage
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('leidy.registration') || '{}'));
    if (saved.name === 'João Silva') {
      console.log('✓ Dados salvos corretamente em localStorage');
    }

    // Click "Começar alinhamento"
    await page.click('#btn-start-training');
    console.log('✓ Botão "Começar alinhamento" clicado');

    console.log('\n✅ Fluxo de cadastro (Leidy Cleaner) validado com sucesso!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();