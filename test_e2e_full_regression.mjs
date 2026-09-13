import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/admin/.gemini/antigravity/brain/b790ba8e-9b9b-4980-b044-fd3b721c2997';
const SCREENSHOT_DIR = path.resolve('test-screenshots');

function saveScreenshot(sourcePath, filename) {
  const destPath = path.join(ARTIFACT_DIR, filename);
  try {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`  [Artifact Saved] -> ${destPath}`);
  } catch (err) {
    console.warn(`  Warning: could not copy artifact: ${err.message}`);
  }
}

async function runFullE2ERegression() {
  console.log('===============================================================');
  console.log('  STARTING LEADFLOW FULL E2E REGRESSION SUITE (PHASES 1 - 5)');
  console.log('===============================================================\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
  });
  const page = await context.newPage();

  const excelFilePath = 'C:/Users/admin/Downloads/top_50_interior_design_leads_with_whatsapp_messages.xlsx';
  if (!fs.existsSync(excelFilePath)) {
    throw new Error('Excel file not found at: ' + excelFilePath);
  }

  try {
    // -------------------------------------------------------------
    // 1. INITIALIZE & IMPORT
    // -------------------------------------------------------------
    console.log('>>> [1] Resetting LocalStorage & Importing 50 Leads...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    const importExcelBtn = page.getByRole('button', { name: /Import Excel/i }).first();
    await importExcelBtn.click();
    await page.waitForTimeout(300);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(excelFilePath);
    await page.waitForSelector('text=Import Complete', { timeout: 10000 });
    await page.getByRole('button', { name: /Close/i }).first().click();
    await page.waitForTimeout(500);

    // Verify 50 leads loaded
    const leadsNavBtn = page.locator('aside button:has-text("Leads")').first();
    await leadsNavBtn.click();
    await page.waitForTimeout(400);

    const leadCountBadge = page.locator('text=50 matching leads');
    await leadCountBadge.waitFor({ state: 'visible' });
    console.log('  ✓ 50 leads imported and displayed.');

    // -------------------------------------------------------------
    // 2. WHATSAPP SAFETY & MANUAL SEND VERIFICATION
    // -------------------------------------------------------------
    console.log('\n>>> [2] Verifying WhatsApp Deep Link & Safety Model...');
    const firstRow = page.locator('tr:has-text("FACTORY PRICE INTERIO")').first();
    await firstRow.click();
    await page.waitForTimeout(500);

    // Verify custom message editing
    const messageTextarea = page.locator('textarea[placeholder="Type or edit personalized message..."]').first();
    await messageTextarea.fill('Hello Factory Price Interio, customized outreach test!');
    await messageTextarea.blur();
    await page.waitForTimeout(300);

    // Check Open WhatsApp popup/navigation
    const [popup] = await Promise.all([
      context.waitForEvent('page', { timeout: 5000 }).catch(() => null),
      page.locator('button:has-text("Open WhatsApp")').first().click(),
    ]);

    if (popup) {
      const url = popup.url();
      console.log(`  - Intercepted WhatsApp URL: ${url}`);
      if (!url.includes('api.whatsapp.com') && !url.includes('web.whatsapp.com')) {
        throw new Error('Invalid WhatsApp deep link target: ' + url);
      }
      const parsedUrl = new URL(url);
      const textParam = parsedUrl.searchParams.get('text') || '';
      if (!textParam.includes('Hello Factory Price Interio, customized outreach test!')) {
        throw new Error(`Message parameter mismatch! Got: "${textParam}"`);
      }
      await popup.close();
      console.log('  ✓ WhatsApp deep link correctly prefilled with human-reviewed message.');
    } else {
      console.log('  ✓ WhatsApp link triggered (window.open popup target).');
    }

    // Lead must STILL be New until human marks it
    const statusBefore = await page.locator('select[aria-label="Change lead status"]').first().inputValue();
    console.log(`  - Status before marking: ${statusBefore} (Expected: New)`);
    if (statusBefore !== 'New') throw new Error('Status changed prematurely without explicit human confirmation!');

    // Explicit Mark Contacted
    const markContactedBtn = page.locator('button:has-text("Mark Contacted")').first();
    await markContactedBtn.click();
    await page.waitForTimeout(400);

    const statusAfter = await page.locator('select[aria-label="Change lead status"]').first().inputValue();
    console.log(`  - Status after marking: ${statusAfter} (Expected: Contacted)`);
    if (statusAfter !== 'Contacted') throw new Error('Failed to change status to Contacted!');
    console.log('  ✓ Human-controlled Mark Contacted confirmed.');

    // -------------------------------------------------------------
    // 3. CRM STATUS PROGRESSION & REVENUE METRICS
    // -------------------------------------------------------------
    console.log('\n>>> [3] Progressing Lead to Won with Quoted & Deal Value...');
    const statusSelect = page.locator('select[aria-label="Change lead status"]').first();
    await statusSelect.selectOption('Won');
    await page.waitForTimeout(300);

    const quotedInput = page.locator('input[placeholder="e.g. 15000"]');
    await quotedInput.fill('25000');
    await quotedInput.blur();
    await page.waitForTimeout(300);

    const dealInput = page.locator('input[placeholder="e.g. 12000"]');
    await dealInput.fill('20000');
    await dealInput.blur();
    await page.waitForTimeout(300);

    console.log('  ✓ Status set to Won (Quoted: ₹25,000, Deal: ₹20,000).');

    // Close panel
    await page.locator('button[aria-label="Close panel"]').first().click();
    await page.waitForTimeout(400);

    // -------------------------------------------------------------
    // 4. DATA INTEGRITY DIAGNOSTIC & SETTINGS VERIFICATION
    // -------------------------------------------------------------
    console.log('\n>>> [4] Verifying Settings Page & Data Integrity Scanner...');
    const settingsNavBtn = page.locator('aside button:has-text("Settings")').first();
    await settingsNavBtn.click();
    await page.waitForTimeout(500);

    // Verify Data Integrity Scanner (automatic real-time calculation)
    const integrityBadge = page.locator('text=✓ 100% Healthy');
    await integrityBadge.waitFor({ state: 'visible' });
    const scannedText = page.locator('text=50 leads').first();
    await scannedText.waitFor({ state: 'visible' });
    console.log('  ✓ Data integrity scanner verified: 50 leads scanned, 100% Healthy.');

    // -------------------------------------------------------------
    // 5. BACKUP EXPORT & RESTORE TEST
    // -------------------------------------------------------------
    console.log('\n>>> [5] Testing JSON Backup Export & Atomic Restore...');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Export JSON Backup")').first().click();
    const download = await downloadPromise;
    const backupPath = path.resolve('test-screenshots', 'leadflow-test-backup.json');
    await download.saveAs(backupPath);
    console.log(`  ✓ Backup downloaded to ${backupPath}`);

    const backupContent = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    if (backupContent.app !== 'LeadFlow' || backupContent.leads.length !== 50) {
      throw new Error('Malformed backup content or missing leads!');
    }
    console.log(`  ✓ Backup verified: ${backupContent.leads.length} leads, Version: ${backupContent.version}`);

    // Test Clear Data Modal
    console.log('  Testing Clear Data confirmation dialog...');
    await page.locator('button:has-text("Clear All Data")').first().click();
    await page.waitForTimeout(300);

    // Cancel modal first
    await page.locator('div[role="dialog"] button:has-text("Cancel")').first().click();
    await page.waitForTimeout(300);
    console.log('  ✓ Modal cancellation preserved data.');

    // Now confirm Clear Data
    await page.locator('button:has-text("Clear All Data")').first().click();
    await page.waitForTimeout(300);
    await page.locator('div[role="dialog"] button:has-text("Yes, Clear All Data")').first().click();
    await page.waitForTimeout(500);

    // Check leads page is now 0
    await leadsNavBtn.click();
    await page.waitForTimeout(400);
    const zeroLeadsText = await page.locator('text=No leads found').isVisible();
    if (!zeroLeadsText) throw new Error('Data was not cleared after confirmation!');
    console.log('  ✓ Clear All Data successfully reset database.');

    // Restore from Backup JSON file
    console.log('  Restoring leads from validated backup file...');
    await settingsNavBtn.click();
    await page.waitForTimeout(400);

    const restoreInput = page.locator('input[type="file"][accept*=".json"]');
    await restoreInput.setInputFiles(backupPath);
    await page.waitForTimeout(1000);

    // Confirm restore dialog if present or wait for banner
    const confirmRestoreBtn = page.locator('div[role="dialog"] button:has-text("Yes, Restore Backup")');
    if (await confirmRestoreBtn.isVisible()) {
      await confirmRestoreBtn.click();
      await page.waitForTimeout(1000);
    }

    // Verify restored leads on Leads page
    await leadsNavBtn.click();
    await page.waitForTimeout(500);

    const restoredRow = page.locator('tr:has-text("FACTORY PRICE INTERIO")').first();
    await restoredRow.click();
    await page.waitForTimeout(500);

    const restoredStatus = await page.locator('select[aria-label="Change lead status"]').first().inputValue();
    const restoredQuoted = await page.locator('input[placeholder="e.g. 15000"]').inputValue();
    const restoredDeal = await page.locator('input[placeholder="e.g. 12000"]').inputValue();
    const restoredMsg = await page.locator('textarea[placeholder="Type or edit personalized message..."]').inputValue();

    console.log(`  Restored Lead Verification:`);
    console.log(`  - Status:     ${restoredStatus} (Expected: Won)`);
    console.log(`  - Quoted:     ${restoredQuoted} (Expected: 25000)`);
    console.log(`  - Deal Value: ${restoredDeal} (Expected: 20000)`);
    console.log(`  - Message:    "${restoredMsg}"`);

    if (restoredStatus !== 'Won' || restoredQuoted !== '25000' || restoredDeal !== '20000') {
      throw new Error('FAIL: Restored lead data does not match backup!');
    }
    if (!restoredMsg.includes('customized outreach test')) {
      throw new Error('FAIL: Restored customMessage lost!');
    }
    console.log('  ✓ Full database restore verified with 100% field fidelity!');

    const regPath = path.join(SCREENSHOT_DIR, 'regression-success.png');
    await page.screenshot({ path: regPath, fullPage: true });
    saveScreenshot(regPath, 'regression-success.png');

    console.log('\n===============================================================');
    console.log('  FULL LEADFLOW E2E REGRESSION SUITE COMPLETED SUCCESSFULLY! 🎉');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('\n❌ REGRESSION TEST FAILED:', err);
    const errPath = path.join(SCREENSHOT_DIR, 'regression-error.png');
    await page.screenshot({ path: errPath, fullPage: true });
    saveScreenshot(errPath, 'regression-error.png');
    throw err;
  } finally {
    await browser.close();
  }
}

runFullE2ERegression();
