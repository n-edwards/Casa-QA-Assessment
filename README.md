# Casa QA Assessment — Vault Health Dashboard

Playwright test suite for the Casa QA hire staging dashboard.

## Part 1 — Automated Tests

### Setup

```bash
npm install
npx playwright install
npm test
```

View tests in browser: `npm run test:headed`  
Interactive UI mode: `npm run test:ui`  
HTML report: `npm run report`

# Debugging
Run one script: `npx playwright test tests/01-vault-summary.spec.ts`
Grep for one test to run: `npx playwright test -g "displays vault name"` (or use `test.only` within scripts)
Run one script in UI mode: `npx playwright test tests/01-vault-summary.spec.ts --ui`
Pause in scripts: `await page.pause();`

### Test Structure

```
tests/
  01-vault-summary.spec.ts    Vault name, type, balance, key health status
  02-transactions.spec.ts     Transaction list, sorting, expand details, data integrity
  03-devices.spec.ts          Connected devices, status variants, firmware info
  04-addresses.spec.ts        Receiving addresses, copy to clipboard, QR code modal
  05-api-and-security.spec.ts API response validation, auth, security observations

pages/
  vault-dashboard.ts          Page Object Model with test ID-based locators
```

### Approach

- **Locators** use `data-testid` attributes found in the staging DOM, centralized in the Page Object
- **Bug detection tests** are written as assertions that will fail against the current data, clearly documenting what the expected behavior should be
- **API tests** intercept real network calls made during page load rather than mocking
- **Security tests** check for sensitive data exposure relevant to a self-custody wallet product

## Part 2 — Bug Documentation

- **Critical Functional Bug:** `tx-1` (Feb 18)
  - **Description:** A transaction with 0 confirmations and a "Pending" block height incorrectly displays a green "Confirmed" status badge.
  - **Steps to Reproduce:** Locate the `tx-1` (Feb 18) transaction in the transaction list and observe its status badge, then expand the details to see the confirmation count and block height.
  - **Expected Behavior:** It should display "Pending" or "Unconfirmed".
  - **Actual Behavior:** It displays a green "Confirmed" status badge.
  - **Severity Reasoning:** This is the most critical functional bug because in a self-custody wallet, falsely indicating a transaction is confirmed could lead a user to prematurely release goods or funds, causing irreversible financial loss.

- **Critical Addresses Bug:**
  - **Description:** Addresses listed under "Receiving Addresses" do not match what is entered into the clipboard when clicking "Copy" buttons.
  - **Steps to Reproduce:** Click a "Copy" button in the "Receiving Addresses" section of the dashboard. Pasted the copied content and compare it to the address listed in its row.
  - **Expected Behavior:** Listed and copied addresses should match.
  - **Actual Behavior:** Copied address is truncated, and full address is not pasted.
  - **Severity Reasoning:** Could be critical if this leads to user sending funds to wrong address. Otherwise not very critical if truncated addresses are invalid, and can't be used at all.

- **Critical UX Bug:** `tx-8` (Jan 10) Timezone/Date Localization Mismatch
  - **Description:** The list view date is hardcoded to "Jan 10, 2026", but the expanded detail view localizes the timestamp to "Jan 9, 2026, 10:48 PM".
  - **Steps to Reproduce:** View the date for transaction `tx-8` in the main list, then expand the detail view and compare the timestamps.
  - **Expected Behavior:** Dates should be consistent and correctly localized across both views.
  - **Actual Behavior:** The list view shows a different date than the localized detail view.
  - **Severity Reasoning:** This is the most critical UX bug because financial ledgers require absolute clarity, and seeing two different dates for a single transaction immediately degrades user trust.

- **Additional Findings:**
  - **`tx-5` fee anomaly:** Astronomical 0.1 BTC fee on a 0.005 BTC send.
  - **Confirmation math inconsistencies:** The total confirmation count on older transactions (like Jan 28) does not mathematically align with the current block height implied by newer transactions.
  - **Amount of keys:** There are six keys for an "of 5" vault.
  - **Transaction History UX:** Only one row can be expanded at a time. Other apps usually allow multiple.
  - **Key dates mismatch:** Office key health was last checked Jan 5 (yellow), but last connected Feb 10 (green). Is health checked on connection?
  Home key dates are also off by one day.
  Safe key also has dates and colors mismatch.
  - **Receiving Addresses:** Overall shape and validity of addresses could be double-checked.
  Feb 8 and Jan 28 "Receive" actions are to addresses not listed in "Receiving Addresses".

## Part 3 — AI Tooling

Claude and Google Gemini were utilized during the assessment. 
Claude to scaffold the initial Playwright Page Object Model, helper functions, test descriptions, test steps and locators. 
Fed to Claude: testing requirements, the dashboard and its URL, the page's outer HTML, and console output upon initial load up of dashboard.

Gemini (larger context, more tokens) to iterate on testing errors, and research Plawright best practices (ex: using regex with sequential `data-testid`s), 
Fed to Gemini: errors and code snippents. Screenshots of the dashboard's dynamic and collapsible elements.

Lessons: Starting smaller might be better. Initial scaffold from Claude was quite broad, and took extra time to walk through, understand, debug and simplify. Something simpler based on expanded requirements and some initial exploratory testing may have been easier to build on.
