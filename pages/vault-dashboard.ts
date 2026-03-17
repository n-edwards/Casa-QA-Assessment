// Page and Locator are core Playwright types.
// Page represents a single browser tab/context; Locator re-queries the live DOM when called.
import { Page, Locator } from '@playwright/test';

// Page Object Model (POM): encapsulates selectors for a page.
// Reusable code imported by other scripts. Edits here apply across the test suite's imports.
export class VaultDashboardPage {
  readonly baseUrl = 'https://app-stg.keys.casa/qa_hire_q1_2026'; // `readonly` prevents reassignment

  // Initialize our `page` Playwright test handle.
  constructor(readonly page: Page) { }

  // Navigates the browser to the vault dashboard URL
  async goto() {
    await this.page.goto(this.baseUrl);
  }

  // --- Vault Summary ---

  // TypeScript getter properties: accessing `dashboard.vaultName` returns a Locator 
  get vaultName(): Locator { return this.page.getByTestId('vault-name'); }
  get vaultType(): Locator { return this.page.getByTestId('vault-type'); }
  get totalBalance(): Locator { return this.page.getByTestId('total-balance'); }
  get usdEquivalent(): Locator { return this.page.getByTestId('usd-equivalent'); }

  // --- Key Health ---

  // Pass in a number to locate keys by test ID 1, 2, etc. $ is template literal.
  getKeyByIndex(index: number): Locator {
    return this.page.getByTestId(`key-key-${index}`);
  }


  // Get all keys that start with "key-key-" followed by one or more digits.
  getAllKeys(): Locator {
    return this.page.getByTestId(/key-key-\d+/); // Regex. Should start with key-key, and have a digit after.
  }

  // --- Transaction History ---

  get sortToggle(): Locator { return this.page.getByTestId('sort-toggle'); }
  get transactionTable(): Locator { return this.page.getByTestId('transaction-table'); }

  // Regex. Matches all transaction rows starting with "transaction-row-", same approach as getAllKeys().
  getAllTransactionRows(): Locator {
    return this.page.getByTestId(/^transaction-row-/);
  }

  // There are just 8 transactions on our test page. We can pass in numbers here to get at each row.
  // Would need something more complex for a large history.
  getTransactionRow(txId: string): Locator {
    return this.page.getByTestId(`transaction-row-${txId}`);
  }

  getExpandIcon(txId: string): Locator {
    return this.page.getByTestId(`tx-expand-icon-${txId}`);
  }

  getTxStatus(txId: string): Locator {
    return this.page.getByTestId(`tx-status-${txId}`);
  }

  getTxConfirmations(txId: string): Locator {
    return this.page.getByTestId(`tx-confirmations-${txId}`);
  }

  getTxFee(txId: string): Locator {
    return this.page.getByTestId(`tx-fee-${txId}`);
  }

  // Clicks the sort toggle and waits 400ms for the DOM re-render 
  async toggleSort() {
    await this.sortToggle.click();
    await this.page.waitForTimeout(400); // Could be an `expect` instead.
  }

  // Clicks the expand icon for a given transaction and waits for the
  // animation/render to complete before any assertions run
  async expandTransaction(txId: string) {
    await this.getExpandIcon(txId).click();
    await this.page.waitForTimeout(300);
  }

  // --- Connected Devices ---

  get connectedDevicesCard(): Locator { return this.page.getByTestId('connected-devices-card'); }

  getDevice(deviceId: string): Locator {
    return this.page.getByTestId(`device-${deviceId}`);
  }

  getDeviceStatusText(deviceId: string): Locator {
    return this.page.getByTestId(`device-status-text-${deviceId}`);
  }

  // --- Receiving Addresses ---

  get receivingAddressesCard(): Locator { return this.page.getByTestId('receiving-addresses-card'); }

  getAddressText(index: number): Locator {
    return this.page.getByTestId(`address-text-${index}`);
  }

  getCopyButton(index: number): Locator {
    return this.page.getByTestId(`copy-address-btn-${index}`);
  }

  getReceiveButton(index: number): Locator {
    return this.page.getByTestId(`receive-address-btn-${index}`);
  }

  // QR code is React modal
  getQRModal(): Locator {
    return this.page.getByTestId('receive-address-modal');
  }
}
