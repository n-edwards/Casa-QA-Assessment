import { test, expect } from '@playwright/test';

// Import the Page Object class so tests can use named methods and getters
import { VaultDashboardPage } from '../pages/vault-dashboard';

// test.describe groups related tests under a named suite.
test.describe('Vault Summary', () => {
  // dashboard declared at this scope so all tests in the block can access it, but can't be
  // assigned yet — 'page' doesn't exist until Playwright creates and injects it below.
  let dashboard: VaultDashboardPage;

  // Playwright creates a fresh 'page' object per test and injects it here.
  // This is the earliest point 'page' is available, so this is where dashboard is assigned.
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
    // innerText() resolves the Locator and reads the element's rendered text as a plain string
    const balance = await dashboard.totalBalance.innerText();
    // BTC amounts should use 8 decimal places (satoshi precision)
    // Regex breakdown: ^ = start of string, \d+ = one or more digits, \. = literal dot,
    // \d{8} = exactly 8 digits, " BTC" = literal suffix, $ = end of string
    expect(balance).toMatch(/^\d+\.\d{8} BTC$/);
  });

  test('displays USD equivalent', async () => {
    const usd = await dashboard.usdEquivalent.innerText();
    // Regex breakdown: ≈ = literal approximation symbol, \$ = escaped dollar sign,
    // [\d,]+ = one or more digits or commas (e.g. "1,234"), \.\d{2} = dot + 2 decimal places
    expect(usd).toMatch(/≈ \$[\d,]+\.\d{2} USD/);
  });
});

test.describe('Key Health', () => {
  let dashboard: VaultDashboardPage; // Same pattern as above, dashboard declared here, assigned in beforeEach.

  test.beforeEach(async ({ page }) => {
    dashboard = new VaultDashboardPage(page);
    await dashboard.goto();
  });

  test('displays all keys for the vault', async () => {
    await expect(dashboard.getAllKeys().first()).toBeVisible(); // await to be sure they're rendered. count() doesn't wait below.
    const keyCount = await dashboard.getAllKeys().count();
    // 3-of-5 vault should have at least 5 keys. Dashboard shows 6.
    expect(keyCount).toBeGreaterThanOrEqual(5);
  });

  test('each key shows a health status and last-checked date', async () => {
    const keys = dashboard.getAllKeys();
    const count = await keys.count();

    // Iterate over every key element and assert on its text content
    for (let i = 0; i < count; i++) {
      const keyText = await keys.nth(i).innerText(); // .nth(i) selects the i-th element in the Locator collection
      // Each key should display a status and a date
      // The | operator in a regex means "or". This matches either string
      expect(keyText).toMatch(/Healthy|Needs Health Check/);
      expect(keyText).toMatch(/Last checked/);
    }
  });

  test('OFFICE Key flagged as needing health check', async () => {
    // key-key-3 is the OFFICE Key.
    const officeKey = dashboard.getKeyByIndex(3);
    // toContainText checks that the element's text includes the substring anywhere —
    // less strict than toHaveText, which requires an exact full-string match
    await expect(officeKey).toContainText('Needs Health Check');
    await expect(officeKey).toContainText('2024');
  });
});
