import { test, expect } from '@playwright/test';
import { VaultDashboardPage } from '../pages/vault-dashboard';

test.describe('Transaction History', () => {
  let dashboard: VaultDashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new VaultDashboardPage(page);
    await dashboard.goto();
  });

  test('displays all 8 transactions', async () => {
    await expect(dashboard.getAllTransactionRows().first()).toBeVisible(); // wait before counting
    const count = await dashboard.getAllTransactionRows().count();
    expect(count).toBe(8);
  });

  test('sort toggle changes transaction order', async () => {
    const firstRowBefore = await dashboard.getAllTransactionRows().first().innerText();
    await dashboard.toggleSort();
    const firstRowAfter = await dashboard.getAllTransactionRows().first().innerText();
    expect(firstRowAfter).not.toBe(firstRowBefore);
  });

  test('toggling sort twice restores original order', async () => {
    const firstRowOriginal = await dashboard.getAllTransactionRows().first().innerText();
    await dashboard.toggleSort();
    await dashboard.toggleSort();
    const firstRowRestored = await dashboard.getAllTransactionRows().first().innerText();
    expect(firstRowRestored).toBe(firstRowOriginal);
  });

  test('transaction count preserved after sorting', async () => {
    await dashboard.toggleSort();
    const count = await dashboard.getAllTransactionRows().count();
    expect(count).toBe(8);
  });

  test('all transactions show Confirmed status', async () => {
    const txIds = ['tx-1', 'tx-2', 'tx-3', 'tx-4', 'tx-5', 'tx-6', 'tx-7', 'tx-8'];
    for (const txId of txIds) {
      await expect(dashboard.getTxStatus(txId)).toHaveText('Confirmed');
    }
  });
});

test.describe('Transaction Expanded Details', () => {
  let dashboard: VaultDashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new VaultDashboardPage(page);
    await dashboard.goto();
  });

  test('expanding a transaction reveals detail fields', async () => {
    await dashboard.expandTransaction('tx-8');
    const expandedContent = await dashboard.page.locator('body').innerText();

    expect(expandedContent).toContain('Full Address');
    expect(expandedContent).toContain('Transaction Hash');
    expect(expandedContent).toContain('Block Height');
    expect(expandedContent).toContain('Timestamp');
    expect(expandedContent).toContain('Fee (sats)');
  });

  test('expanded view has a Close button', async () => {
    await dashboard.expandTransaction('tx-8');
    const closeBtn = dashboard.page.getByRole('button', { name: 'Close' });
    await expect(closeBtn).toBeVisible();
  });

  test('block heights increase chronologically', async () => {
    // Newer transactions should have higher block heights.
    await dashboard.expandTransaction('tx-8');
    const content = await dashboard.page.locator('body').innerText();
    const blockMatch = content.match(/Block Height\n([\d,]+)/);
    const olderBlock = blockMatch ? parseInt(blockMatch[1].replace(/,/g, '')) : 0;

    await dashboard.page.getByRole('button', { name: 'Close' }).click();
    await dashboard.page.waitForTimeout(300);

    await dashboard.expandTransaction('tx-3');
    const content2 = await dashboard.page.locator('body').innerText();
    const blockMatch2 = content2.match(/Block Height\n([\d,]+)/);
    const newerBlock = blockMatch2 ? parseInt(blockMatch2[1].replace(/,/g, '')) : 0;

    expect(newerBlock).toBeGreaterThan(olderBlock);
  });
});

test.describe('Transaction Data Integrity — Bugs', () => {
  let dashboard: VaultDashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new VaultDashboardPage(page);
    await dashboard.goto();
  });

  test('BUG: tx-1 has 0 confirmations but shows Confirmed status', async () => {
    // 0 confirmations = transaction is still in the mempool, not yet mined into a block.
    // Status should be "Pending" or "Unconfirmed".
    const confirmations = await dashboard.getTxConfirmations('tx-1').innerText();
    const status = await dashboard.getTxStatus('tx-1').innerText();

    expect(confirmations).toBe('0');
    expect(status).not.toBe('Confirmed'); // Expected to FAIL
  });

  test('BUG: tx-5 fee (0.1 BTC) is 20x the send amount (0.005 BTC)', async () => {
    // Fee of ~$5,000 on a ~$250 send. Typical fees: 0.00001–0.0005 BTC.
    const fee = await dashboard.getTxFee('tx-5').innerText();
    const feeValue = parseFloat(fee);
    expect(feeValue).toBeLessThan(0.001); // Expected to FAIL
  });

  test('BUG: tx-8 expanded timestamp does not match row date', async () => {
    // Row date: "Jan 10, 2026". Expanded timestamp: "Jan 9, 2026, 10:48 PM".
    // Likely a timezone rendering issue — UTC timestamp falls on Jan 9 but
    // row displays Jan 10 in local time. Dates should be consistent,
    // or timezone context should be explicit.
    await dashboard.expandTransaction('tx-8');

    // Scope the locator strictly to the expanded details container
    const detailsPane = dashboard.page.getByTestId('transaction-detail-tx-8');

    // Wait for the detail pane to actually render and become visible 
    await expect(detailsPane).toBeVisible();

    const expandedContent = await detailsPane.innerText();
    expect(expandedContent).toContain('Jan 10'); // Expected to FAIL if timestamp shows Jan 9
  });

  // TODO: All transaction hashes use repeating hex patterns (e.g., b8c9d0e1f2a7...)
  //       rather than realistic SHA-256 output. Acceptable for staging test data
  //       but worth flagging if this data feeds into any verification logic.
  //
  // TODO: Receive transactions show fee as 0 — technically correct (receiver doesn't
  //       pay fees) but consider "—" or "N/A" for clarity.
});
