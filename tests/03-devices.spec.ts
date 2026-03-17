import { test, expect } from '@playwright/test';
import { VaultDashboardPage } from '../pages/vault-dashboard';

test.describe('Connected Devices', () => {
  let dashboard: VaultDashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new VaultDashboardPage(page);
    await dashboard.goto();
  });

  test('displays 3 connected devices', async () => {
    // Assert each device card is present and visible by its unique device ID
    // Hard-coded to our mock dashboard expectations, could be more dynamic.
    await expect(dashboard.getDevice('device-1')).toBeVisible();
    await expect(dashboard.getDevice('device-2')).toBeVisible();
    await expect(dashboard.getDevice('device-3')).toBeVisible();
  });

  // Checking states that we expect to see on our mock dashboard.
  test('Ledger Nano X shows Active status', async () => {
    await expect(dashboard.getDeviceStatusText('device-1')).toHaveText('Active');
  });

  test('Trezor Model T shows firmware update required', async () => {
    await expect(dashboard.getDeviceStatusText('device-2')).toHaveText('Firmware Update Required');
  });

  test('Coldcard Q shows Not Connected', async () => {
    await expect(dashboard.getDeviceStatusText('device-3')).toHaveText('Not Connected');
  });

  test('each device displays firmware version and last connected date', async () => {
    // Same data-testid values used above, collected into an array so we can loop
    // instead of repeating the same two assertions three times.
    const devices = ['device-1', 'device-2', 'device-3']; // Test IDs
    for (const id of devices) {
      const deviceText = await dashboard.getDevice(id).innerText();
      // Checks for a version number in "v2.1.3" format (e.g. "Firmware: v2.1.3").
      // \d+ = one or more digits, \. = literal dot.
      expect(deviceText).toMatch(/Firmware: v\d+\.\d+\.\d+/);
      expect(deviceText).toMatch(/Last Connected:/);
    }
  });

  // TODO: Verify device status dot colors differentiate Active vs Warning vs Disconnected
  // (css-ktljz3 for Active/Warning, css-17lxdwy for Not Connected — visual regression candidate)

  // TODO: Verify device key labels map to Key Health key names
  // (device-1 "HOME Key" should correspond to key-key-2 "HOME Key")
});
