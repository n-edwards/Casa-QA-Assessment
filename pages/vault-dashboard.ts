import { Page, Locator } from '@playwright/test';

export class VaultDashboardPage {
  readonly page: Page;
  readonly baseUrl = 'https://app-stg.keys.casa/qa_hire_q1_2026';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.baseUrl);
    //await this.page.waitForLoadState('networkidle'); // Trying to wait for dynamic elements to load, but active React apps are never really idle. Just rely on config timeout for now.
  }

  // --- Vault Summary ---

  get vaultName(): Locator { return this.page.getByTestId('vault-name'); }
  get vaultType(): Locator { return this.page.getByTestId('vault-type'); }
  get totalBalance(): Locator { return this.page.getByTestId('total-balance'); }
  get usdEquivalent(): Locator { return this.page.getByTestId('usd-equivalent'); }

  // --- Key Health (inside vault summary card) ---

  getKeyByIndex(index: number): Locator {
    return this.page.getByTestId(`key-key-${index}`);
  }

  getAllKeys(): Locator {
    return this.page.getByTestId(/key-key-\d+/); // Should start with key-key, and have a digit after.
  }

  // --- Transaction History ---

  get sortToggle(): Locator { return this.page.getByTestId('sort-toggle'); }
  get transactionTable(): Locator { return this.page.getByTestId('transaction-table'); }

  getAllTransactionRows(): Locator {
    return this.page.locator('[data-testid^="transaction-row-"]');
  }

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

  async toggleSort() {
    await this.sortToggle.click();
    await this.page.waitForTimeout(400);
  }

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
