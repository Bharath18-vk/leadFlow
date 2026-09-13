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
    console.warn(`  Warning: could not copy to artifact dir: ${err.message}`);
  }
}

async function run5Verifications() {
  console.log('===============================================================');
  console.log('  STARTING PLAYWRIGHT VERIFICATION OF 5 CRITICAL CRM EDGE CASES');
  console.log('===============================================================\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const excelFilePath = 'C:/Users/admin/Downloads/top_50_interior_design_leads_with_whatsapp_messages.xlsx';
  if (!fs.existsSync(excelFilePath)) {
    throw new Error('Excel file not found at: ' + excelFilePath);
  }

  try {
    // -------------------------------------------------------------
    // SETUP: Navigate to app and start clean
    // -------------------------------------------------------------
    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    console.log('✓ Clean slate initialized.\n');

    // -------------------------------------------------------------
    // VERIFICATION 2: Dashboard Conversion Formulas (Zero-Denominator)
    // -------------------------------------------------------------
    console.log('>>> [VERIFICATION 2] Testing Zero-Denominator Resilience on Dashboard...');
    // Initial state has 0 leads
    // First import 50 leads so total > 0, but contacted = 0
    const importBtn = page.getByRole('button', { name: /Import Excel/i }).first();
    await importBtn.click();
    await page.waitForTimeout(400);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(excelFilePath);
    await page.waitForSelector('text=Import Complete', { timeout: 10000 });
    
    // Close import summary to view dashboard
    const closeSummaryBtn = page.getByRole('button', { name: /Close/i }).first();
    await closeSummaryBtn.click();
    await page.waitForTimeout(500);

    // Verify all 5 conversion rates on Dashboard
    const dashboardContent = await page.content();
    if (dashboardContent.includes('NaN%') || dashboardContent.includes('Infinity%')) {
      throw new Error('FAIL: Found NaN% or Infinity% in Dashboard conversion metrics!');
    }

    // Check specific zero-denominator metric texts
    const replyRateText = await page.locator('text=Reply Rate').locator('..').locator('span.text-xl').innerText();
    const interestRateText = await page.locator('text=Interest Rate').locator('..').locator('span.text-xl').innerText();
    const demoRateText = await page.locator('text=Demo Rate').locator('..').locator('span.text-xl').innerText();
    const winRateText = await page.locator('text=Win Rate').locator('..').locator('span.text-xl').innerText();

    console.log(`  Funnel metrics with 0 contacted:`);
    console.log(`  - Reply Rate:    ${replyRateText} (Expected: 0%)`);
    console.log(`  - Interest Rate: ${interestRateText} (Expected: 0%)`);
    console.log(`  - Demo Rate:     ${demoRateText} (Expected: 0%)`);
    console.log(`  - Win Rate:      ${winRateText} (Expected: 0%)`);

    if (replyRateText !== '0%' || interestRateText !== '0%' || demoRateText !== '0%' || winRateText !== '0%') {
      throw new Error(`FAIL: Conversion rate did not equal 0% when denominator was 0!`);
    }

    const v2Path = path.join(SCREENSHOT_DIR, 'v2-zero-denominator-dashboard.png');
    await page.screenshot({ path: v2Path });
    saveScreenshot(v2Path, 'v2-zero-denominator-dashboard.png');
    console.log('✓ VERIFICATION 2 PASSED: All conversion rates safely handle zero denominators with 0% (no NaN / Infinity).\n');

    // -------------------------------------------------------------
    // VERIFICATION 1: contactAttempts After Second Contact
    // -------------------------------------------------------------
    console.log('>>> [VERIFICATION 1] Testing contactAttempts increment on second contact...');
    // Navigate to Leads page
    await page.locator('aside button:has-text("Leads")').click();
    await page.waitForTimeout(500);

    // Open first lead: "FACTORY PRICE INTERIO"
    const leadRow = page.locator('tr:has-text("FACTORY PRICE INTERIO")').first();
    await leadRow.click();
    await page.waitForTimeout(500);

    // Check initial button text: "Mark Contacted"
    const initialMarkBtn = page.locator('button:has-text("Mark Contacted")').first();
    await initialMarkBtn.waitFor({ state: 'visible' });
    console.log('  Initial button: "Mark Contacted" visible.');

    // 1st click: Mark Contacted -> Attempt #1
    await initialMarkBtn.click();
    await page.waitForTimeout(500);

    // Verify button changes to "Attempt #2"
    const attempt2Btn = page.locator('button:has-text("Attempt #2")').first();
    await attempt2Btn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  After 1st contact: button changed to "Attempt #2"');

    // 2nd click: Explicit second contact -> Attempt #2
    await attempt2Btn.click();
    await page.waitForTimeout(500);

    // Verify button changes to "Attempt #3"
    const attempt3Btn = page.locator('button:has-text("Attempt #3")').first();
    await attempt3Btn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  After 2nd contact: button changed to "Attempt #3"');

    // Check header text: "2 contact attempts"
    const attemptsText = await page.locator('text=2 contact attempts').first().innerText();
    console.log(`  Lead detail shows: "${attemptsText}"`);

    // Reload page to verify persistence of Attempt #2
    console.log('  Reloading page to verify persistence of Attempt #2...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Navigate back to Leads tab
    await page.locator('aside button:has-text("Leads")').click();
    await page.waitForTimeout(500);

    const reloadedLeadRow = page.locator('tr:has-text("FACTORY PRICE INTERIO")').first();
    await reloadedLeadRow.click();
    await page.waitForTimeout(500);

    const reloadedAttempt3Btn = page.locator('button:has-text("Attempt #3")').first();
    await reloadedAttempt3Btn.waitFor({ state: 'visible', timeout: 5000 });
    const reloadedAttemptsText = await page.locator('text=2 contact attempts').first().innerText();
    console.log(`  After reload: persists "${reloadedAttemptsText}" and button is "Attempt #3".`);

    const v1Path = path.join(SCREENSHOT_DIR, 'v1-second-contact-attempts.png');
    await page.screenshot({ path: v1Path });
    saveScreenshot(v1Path, 'v1-second-contact-attempts.png');
    console.log('✓ VERIFICATION 1 PASSED: contactAttempts increments cleanly to 2 without duplicates or resets.\n');

    // -------------------------------------------------------------
    // VERIFICATION 3: Import/CRM Preservation on Re-Import
    // -------------------------------------------------------------
    console.log('>>> [VERIFICATION 3] Testing CRM Preservation on Re-importing same Excel file...');
    // On FACTORY PRICE INTERIO, set:
    // status = Replied
    // notes = "Owner asked for portfolio."
    // followUpDate = 2026-09-15
    // customMessage = "Custom edited message for Factory Price Interio"
    
    // Set Status = Replied
    await page.click('button:has-text("💬 Replied")');
    await page.waitForTimeout(300);

    // Set custom followUpDate via input
    const dateInput = page.locator('input[type="date"]').first();
    await dateInput.fill('2026-09-15');
    await page.waitForTimeout(300);

    // Set Notes
    const notesTextarea = page.locator('textarea[placeholder*="Add client follow-up notes"]').first();
    await notesTextarea.fill('Owner asked for portfolio.');
    await page.waitForTimeout(300);

    // Set Custom Message
    const msgTextarea = page.locator('textarea[placeholder*="personalized message"]').first();
    await msgTextarea.fill('Custom edited message for Factory Price Interio');
    await page.waitForTimeout(500);

    console.log('  Configured FACTORY PRICE INTERIO with:');
    console.log('  - Status: Replied');
    console.log('  - Contact Attempts: 2');
    console.log('  - Notes: "Owner asked for portfolio."');
    console.log('  - Follow-up Date: 2026-09-15');
    console.log('  - Custom Message: "Custom edited message for Factory Price Interio"');

    // Close Inspector
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // Re-import the exact same Excel file!
    console.log('  Re-importing the same 50-lead Excel file...');
    const reImportBtn = page.getByRole('button', { name: /Import Excel/i }).first();
    await reImportBtn.click();
    await page.waitForTimeout(400);

    const reFileInput = page.locator('input[type="file"]');
    await reFileInput.setInputFiles(excelFilePath);
    await page.waitForSelector('text=Import Complete', { timeout: 10000 });

    // Verify summary dialog shows refreshed count
    const summaryText = await page.locator('div:has-text("Existing Leads Refreshed"), div:has-text("Refreshed")').first().innerText();
    console.log(`  Import Summary shows: "${summaryText.replace(/\n/g, ' ')}"`);

    // Close summary dialog
    const closeDialogBtn = page.getByRole('button', { name: /Close/i }).first();
    await closeDialogBtn.click();
    await page.waitForTimeout(500);

    // Re-open FACTORY PRICE INTERIO
    const targetLeadRow = page.locator('tr:has-text("FACTORY PRICE INTERIO")').first();
    await targetLeadRow.click();
    await page.waitForTimeout(500);

    // Verify all 5 CRM fields remain intact!
    const persistedNotes = await page.locator('textarea[placeholder*="Add client follow-up notes"]').first().inputValue();
    const persistedDate = await page.locator('input[type="date"]').first().inputValue();
    const persistedMsg = await page.locator('textarea[placeholder*="personalized message"]').first().inputValue();
    const persistedStatusVisible = await page.locator('button:has-text("💬 Replied").bg-slate-900').isVisible();
    const persistedAttemptsVisible = await page.locator('text=2 contact attempts').first().isVisible();

    console.log(`  Verification check after re-import:`);
    console.log(`  - Notes: "${persistedNotes}" (Matches expected: ${persistedNotes === 'Owner asked for portfolio.'})`);
    console.log(`  - Follow-up Date: "${persistedDate}" (Matches expected: ${persistedDate === '2026-09-15'})`);
    console.log(`  - Custom Message: "${persistedMsg}" (Matches expected: ${persistedMsg === 'Custom edited message for Factory Price Interio'})`);
    console.log(`  - Status is Replied: ${persistedStatusVisible}`);
    console.log(`  - Contact Attempts is 2: ${persistedAttemptsVisible}`);

    if (
      persistedNotes !== 'Owner asked for portfolio.' ||
      persistedDate !== '2026-09-15' ||
      persistedMsg !== 'Custom edited message for Factory Price Interio' ||
      !persistedStatusVisible ||
      !persistedAttemptsVisible
    ) {
      throw new Error('FAIL: Re-import wiped or modified CRM fields!');
    }

    const v3Path = path.join(SCREENSHOT_DIR, 'v3-reimport-crm-preservation.png');
    await page.screenshot({ path: v3Path });
    saveScreenshot(v3Path, 'v3-reimport-crm-preservation.png');
    console.log('✓ VERIFICATION 3 PASSED: Re-import fully preserved all CRM history and edited data.\n');

    // -------------------------------------------------------------
    // VERIFICATION 4: "Needs Attention" 4 distinct alert conditions
    // -------------------------------------------------------------
    console.log('>>> [VERIFICATION 4] Testing all 4 distinct "Needs Attention" conditions...');
    // We need 4 conditions:
    // 1. Overdue follow-up (yesterday)
    // 2. Today's follow-up (today)
    // 3. Interested with NO follow-up date
    // 4. Replied with NO follow-up date

    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    await page.evaluate(({ todayStr, yesterdayStr }) => {
      const stored = localStorage.getItem('leadflow_leads_v1');
      if (!stored) return;
      const leads = JSON.parse(stored);
      
      // Lead 0: Overdue follow-up
      leads[0].followUpDate = yesterdayStr;
      leads[0].status = 'Follow-up';

      // Lead 1: Today's follow-up
      leads[1].followUpDate = todayStr;
      leads[1].status = 'Follow-up';

      // Lead 2: Interested with NO follow-up date
      leads[2].status = 'Interested';
      leads[2].followUpDate = undefined;

      // Lead 3: Replied with NO follow-up date
      leads[3].status = 'Replied';
      leads[3].followUpDate = undefined;

      localStorage.setItem('leadflow_leads_v1', JSON.stringify(leads));
    }, { todayStr, yesterdayStr });

    // Reload page to reflect state on Dashboard
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // Verify all 4 cards appear under "Needs Attention"
    const needsAttentionHeading = page.locator('h2:has-text("Needs Attention")');
    await needsAttentionHeading.waitFor({ state: 'visible', timeout: 5000 });

    const overdueCard = page.locator('text=⚠️ Overdue Follow-ups');
    const dueTodayCard = page.locator('text=⏰ Due Today');
    const interestedNoDateCard = page.locator('text=⭐ Interested (No Date)');
    const repliedNoDateCard = page.locator('text=💬 Replied (No Date)');

    const hasOverdue = await overdueCard.isVisible();
    const hasDueToday = await dueTodayCard.isVisible();
    const hasInterested = await interestedNoDateCard.isVisible();
    const hasReplied = await repliedNoDateCard.isVisible();

    console.log(`  Needs Attention cards check:`);
    console.log(`  - ⚠️ Overdue Follow-ups visible: ${hasOverdue}`);
    console.log(`  - ⏰ Due Today visible:          ${hasDueToday}`);
    console.log(`  - ⭐ Interested (No Date) visible: ${hasInterested}`);
    console.log(`  - 💬 Replied (No Date) visible:    ${hasReplied}`);

    if (!hasOverdue || !hasDueToday || !hasInterested || !hasReplied) {
      throw new Error('FAIL: Not all 4 Needs Attention cards were displayed!');
    }

    const v4Path = path.join(SCREENSHOT_DIR, 'v4-needs-attention-4-cards.png');
    await page.screenshot({ path: v4Path });
    saveScreenshot(v4Path, 'v4-needs-attention-4-cards.png');
    console.log('✓ VERIFICATION 4 PASSED: All 4 distinct Needs Attention conditions render accurately.\n');

    // -------------------------------------------------------------
    // VERIFICATION 5: Mobile Viewport Verification (390x844)
    // -------------------------------------------------------------
    console.log('>>> [VERIFICATION 5] Testing Mobile Responsiveness on 390x844 (iPhone 14)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    // 1. Check Mobile Header
    const mobileHeaderVisible = await page.locator('header').first().isVisible();
    console.log(`  Mobile header visible: ${mobileHeaderVisible}`);

    // 2. Open Mobile Menu
    const menuBtn = page.locator('button[aria-label="Toggle Navigation"]').first();
    await menuBtn.click();
    await page.waitForTimeout(400);
    console.log('  Mobile menu opened.');

    // 3. Navigate to Leads via mobile drawer
    await page.locator('.fixed.inset-0.z-50 button:has-text("Leads")').first().click();
    await page.waitForTimeout(500);

    // 4. Verify responsive Lead Cards are rendered instead of wide table
    const cardTitle = page.locator('.md\\:hidden span:has-text("FACTORY PRICE INTERIO")').first();
    await cardTitle.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  Responsive lead cards list rendered on mobile.');

    // 5. Click lead card to open Mobile Drawer Lead Inspector
    await cardTitle.click();
    await page.waitForTimeout(600);

    // 6. Verify Lead Inspector elements on mobile
    const mobileWhatsAppBtn = page.locator('button:has-text("Open WhatsApp")').first();
    const mobileNotesArea = page.locator('textarea[placeholder*="Add client follow-up notes"]').first();
    const mobileDateInput = page.locator('input[type="date"]').first();

    const waVisible = await mobileWhatsAppBtn.isVisible();
    const notesVisible = await mobileNotesArea.isVisible();
    const dateVisible = await mobileDateInput.isVisible();

    console.log(`  Mobile Inspector elements:`);
    console.log(`  - 💬 Open WhatsApp CTA visible: ${waVisible}`);
    console.log(`  - Notes Textarea visible:      ${notesVisible}`);
    console.log(`  - Schedule Date Input visible: ${dateVisible}`);

    if (!waVisible || !notesVisible || !dateVisible) {
      throw new Error('FAIL: Critical CRM elements not accessible on mobile viewport!');
    }

    const v5Path = path.join(SCREENSHOT_DIR, 'v5-mobile-viewport-390x844.png');
    await page.screenshot({ path: v5Path });
    saveScreenshot(v5Path, 'v5-mobile-viewport-390x844.png');
    console.log('✓ VERIFICATION 5 PASSED: Full mobile layout, drawer, CTA buttons, and notes verified on 390x844.\n');

    console.log('===============================================================');
    console.log('  ALL 5 VERIFICATIONS PASSED WITH 100% SUCCESS!                ');
    console.log('===============================================================');

  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err);
    const errPath = path.join(SCREENSHOT_DIR, 'verification-error.png');
    await page.screenshot({ path: errPath });
    saveScreenshot(errPath, 'verification-error.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run5Verifications();
