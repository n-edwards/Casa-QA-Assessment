import { test, expect } from '@playwright/test';
import { VaultDashboardPage } from '../pages/vault-dashboard';

test.describe('Receiving Addresses', () => {
  let dashboard: VaultDashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new VaultDashboardPage(page);
    await dashboard.goto();
  });

  test('displays 4 receiving addresses', async () => {
    for (let i = 0; i < 4; i++) {
      await expect(dashboard.getAddressText(i)).toBeVisible();
    }
  });

  test('each address has Copy and Receive buttons', async () => {
    for (let i = 0; i < 4; i++) {
      await expect(dashboard.getCopyButton(i)).toBeVisible();
      await expect(dashboard.getReceiveButton(i)).toBeVisible();
    }
  });

  test('addresses are valid Bitcoin format', async () => {
    // Valid prefixes: bc1q (native segwit), bc1p (taproot), 3 (P2SH), tb1q (testnet)
    const validPrefixes = /^(bc1[qp]|3[0-9A-Za-z]|tb1q)/;
    for (let i = 0; i < 4; i++) {
      const address = await dashboard.getAddressText(i).innerText();
      expect(address).toMatch(validPrefixes);
    }
  });

  test('BUG: copy button copies address to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await dashboard.getCopyButton(0).click();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    const displayedAddress = await dashboard.getAddressText(0).innerText();
    expect(clipboard).toBe(displayedAddress); // Failing because copied addresses are being truncated
  });

  test('Receive button opens QR code modal', async () => {
    await dashboard.getReceiveButton(0).click();
    const modal = dashboard.getQRModal();
    await expect(modal).toBeVisible({ timeout: 3000 });
  });

  // TODO: Verify QR code encodes the same address displayed in the row
  // TODO: Verify QR modal can be dismissed via close button or Escape key
  // TODO: Investigate mixing of testnet (tb1q...) and mainnet (3..., bc1p...) addresses —
  //       on a staging environment this may be intentional, but in production
  //       mixing network types would be a critical bug
});
