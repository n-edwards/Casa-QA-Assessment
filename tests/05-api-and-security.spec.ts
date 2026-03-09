import { test, expect } from '@playwright/test';

/**
 * API and security observations based on network activity observed during
 * initial page load (browser console inspection of staging environment).
 *
 * Observed endpoints:
 *   GET /vaultApi/api/application/geo    → { isUnitedStates: true }
 *   GET /vaultApi/api/application/status → { minimumAppVersion, maintenanceMode, useElectrum, ... }
 *   GET /vaultApi/api/users/me           → 401 (no auth token)
 *
 * External services detected: LaunchDarkly (feature flags), Datadog (monitoring), Stripe (payments)
 */

test.describe('API Observations', () => {

  test('status endpoint returns valid app metadata', async ({ page }) => {
    const statusResponse = page.waitForResponse(
      resp => resp.url().includes('/api/application/status') && resp.status() === 200
    );
    await page.goto('https://app-stg.keys.casa/qa_hire_q1_2026');
    const response = await statusResponse;
    const body = await response.json();

    expect(body).toHaveProperty('minimumAppVersion');
    expect(body.minimumAppVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(body).toHaveProperty('maintenanceMode');
    expect(typeof body.maintenanceMode).toBe('boolean');
  });

  test('unauthenticated request to /users/me returns 401', async ({ page }) => {
    const authResponse = page.waitForResponse(
      resp => resp.url().includes('/api/users/me')
    );
    await page.goto('https://app-stg.keys.casa/qa_hire_q1_2026');
    const response = await authResponse;

    expect(response.status()).toBe(401);
  });
});

test.describe('Security Observations', () => {

  test('page loads over HTTPS', async ({ page }) => {
    await page.goto('https://app-stg.keys.casa/qa_hire_q1_2026');
    expect(page.url()).toMatch(/^https:\/\//);
  });

  test('no private keys or xpubs exposed in page source', async ({ page }) => {
    // Casa's API documentation explicitly states xpubs are not revealed for privacy.
    // (Source: https://casa.io/api — "The Casa API does not reveal extended public keys
    //  (xpubs) for privacy reasons.")

    // This could be refactored to more directly listen to network payloads, but is fine for now.

    // Wait for the navigation AND the specific API response that loads the vault data
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/application/status') && resp.status() === 200),
      page.goto('https://app-stg.keys.casa/qa_hire_q1_2026')
    ]);

    // Now we know the data has arrived, so scraping the DOM is safe from false positives
    const content = await page.content();

    expect(content).not.toMatch(/xprv[0-9A-Za-z]{107}/);
    expect(content).not.toMatch(/xpub[0-9A-Za-z]{107}/);
  });


  // TODO: Add a check for sensitive data in console errors, a common leak vector. Terms: 'private key', 'mnemonic', 'xprv'
  // TODO: Verify Content-Security-Policy headers restrict script sources
  // TODO: Verify Strict-Transport-Security header is present
  // TODO: Audit LaunchDarkly client key exposure (visible in network stream URL) —
  //       client-side LD keys are expected to be public, but worth confirming
  //       no server-side SDK key is accidentally exposed
});
