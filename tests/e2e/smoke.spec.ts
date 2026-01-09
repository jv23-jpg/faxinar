import { test, expect } from '@playwright/test';

const URL = 'http://localhost:5000/index.html';

test('smoke: calcular, simular e configurar conta admin', async ({ page }) => {
  await page.goto(URL);

  // Definir preço e quantidade
  await page.fill('#service-price', '100');
  await page.fill('#service-quantity', '2');

  // Verifica total exibido (R$ 210,00)
  const total = await page.textContent('#total-value');
  expect(total).toContain('R$');
  expect(total).toContain('210');

  // Capturar diálogo de simulação de pagamento
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Pagamento simulado');
    await dialog.accept();
  });
  await page.click('#btn-pay');

  // Abrir modal admin e inserir senha via prompt
  page.once('dialog', async (dialog) => {
    // prompt() -> enviar 'admin'
    await dialog.accept('admin');
  });
  await page.click('#open-admin');

  // preencher conta admin
  await page.fill('#admin-account-name', 'Empresa Demo');
  await page.fill('#admin-account-bank', '001 - Banco Demo');
  await page.fill('#admin-account-number', '1234-5');
  await page.click('#admin-save');

  // Verificar destino configurado e botão habilitado
  await expect(page.locator('#dest-flag')).toHaveText('configurada');
  await expect(page.locator('#btn-confirm')).toBeEnabled();

  // Confirmar pagamento e capturar diálogo final
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Pagamento confirmado');
    await dialog.accept();
  });
  await page.click('#btn-confirm');
});