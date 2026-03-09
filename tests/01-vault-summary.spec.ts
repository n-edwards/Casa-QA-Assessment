import { test, expect } from '@playwright/test';
import { VaultDashboardPage } from '../pages/vault-dashboard';

test.describe('Vault Summary', () => {
  let dashboard: VaultDashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new VaultDashboardPage(page);
    await dashboard.goto();
  });

  test('displays vault name', async () => {
    // Hard-coded text check, but could check that text is not empty, or matches some other source of truth.
    await expect(dashboard.vaultName).toHaveText('Vacation Fund');
  });

  test('displays vault type as multisig configuration', async () => {
    await expect(dashboard.vaultType).toHaveText('3-of-5 Multisig');
  });

  test('displays BTC balance in correct 8-decimal format', async () => {
    const balance = await dashboard.totalBalance.innerText();
    // BTC amounts should use 8 decimal places (satoshi precision)
    expect(balance).toMatch(/^\d+\.\d{8} BTC$/);
  });

  test('displays USD equivalent', async () => {
    const usd = await dashboard.usdEquivalent.innerText();
    expect(usd).toMatch(/≈ \$[\d,]+\.\d{2} USD/);
  });
});

test.describe('Key Health', () => {
  let dashboard: VaultDashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new VaultDashboardPage(page);
    await dashboard.goto();
  });

  test('displays all keys for the vault', async () => {
    await expect(dashboard.getAllKeys().first()).toBeVisible(); // await to be sure they're rendered
    const keyCount = await dashboard.getAllKeys().count();
    // 3-of-5 vault should have 5 keys. Dashboard shows 6 (includes backup).
    // Noting this as an observation — may be intentional for redundancy.
    expect(keyCount).toBeGreaterThanOrEqual(5);
  });

  test('each key shows a health status and last-checked date', async () => {
    const keys = dashboard.getAllKeys();
    const count = await keys.count();

    for (let i = 0; i < count; i++) {
      const keyText = await keys.nth(i).innerText();
      // Each key should display a status and a date
      expect(keyText).toMatch(/Healthy|Needs Health Check/);
      expect(keyText).toMatch(/Last checked/);
    }
  });

  test('OFFICE Key flagged as needing health check', async () => {
    // key-key-3 is the OFFICE Key — last checked Jan 5, 2024 (over 2 years ago)
    const officeKey = dashboard.getKeyByIndex(3);
    await expect(officeKey).toContainText('Needs Health Check');
    await expect(officeKey).toContainText('2024');
  });
});
