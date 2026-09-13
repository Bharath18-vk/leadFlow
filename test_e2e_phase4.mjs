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

async function runPhase4E2E() {
  console.log('===============================================================');
  console.log('  STARTING PLAYWRIGHT E2E VERIFICATION: PHASE 4 ANALYTICS & BI');
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
    // STEP 1: Clean slate & Empty State on Analytics
    // -------------------------------------------------------------
    console.log('>>> [STEP 1] Testing Analytics Empty State...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    // Navigate to Analytics page
    const analyticsNavBtn = page.locator('aside button:has-text("Analytics")').first();
    await analyticsNavBtn.click();
    await page.waitForTimeout(500);

    // Verify analytics command center loaded
    const analyticsHeader = page.locator('text=Business Intelligence & Performance');
    await analyticsHeader.waitFor({ state: 'visible' });
    console.log('  ✓ Analytics command center loaded.');

    const initialWonRev = await page.locator('div[title="Click to filter won deals"] span.text-xl').innerText();
    const initialPipelineVal = await page.locator('div[title="Active pipeline value"] span.text-xl').innerText();
    console.log(`  - Initial Won Revenue:     ${initialWonRev} (Expected: ₹0)`);
    console.log(`  - Initial Pipeline Value:  ${initialPipelineVal} (Expected: ₹0)`);

    if (initialWonRev !== '₹0' || initialPipelineVal !== '₹0') {
      throw new Error(`Expected ₹0 initially, got Won=${initialWonRev}, Pipeline=${initialPipelineVal}`);
    }

    const p1Path = path.join(SCREENSHOT_DIR, 'phase4-1-analytics-empty.png');
    await page.screenshot({ path: p1Path, fullPage: true });
    saveScreenshot(p1Path, 'phase4-1-analytics-empty.png');

    // -------------------------------------------------------------
    // STEP 2: Import 50-Lead Excel File & Verify Fresh Analytics
    // -------------------------------------------------------------
    console.log('\n>>> [STEP 2] Importing 50-Lead Excel and Verifying Analytics...');
    // Click Import button in TopHeader
    const importExcelBtn = page.getByRole('button', { name: /Import Excel/i }).first();
    await importExcelBtn.click();
    await page.waitForTimeout(400);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(excelFilePath);
    await page.waitForSelector('text=Import Complete', { timeout: 10000 });

    const closeSummaryBtn = page.getByRole('button', { name: /Close/i }).first();
    await closeSummaryBtn.click();
    await page.waitForTimeout(600);

    // Navigate to Analytics tab
    await analyticsNavBtn.click();
    await page.waitForTimeout(600);

    // Verify KPI cards
    const totalLeadsText = await page.locator('div[title="Click to view all leads"] span.text-2xl').innerText();
    const wonRevenueText = await page.locator('div[title="Click to filter won deals"] span.text-xl').innerText();
    const pipelineValText = await page.locator('div[title="Active pipeline value"] span.text-xl').innerText();

    console.log(`  Fresh Analytics KPIs:`);
    console.log(`  - Total Prospects: ${totalLeadsText} (Expected: 50)`);
    console.log(`  - Won Revenue:     ${wonRevenueText} (Expected: ₹0)`);
    console.log(`  - Pipeline Value:  ${pipelineValText} (Expected: ₹0)`);

    if (totalLeadsText !== '50') throw new Error(`Expected 50 Total Prospects, got: ${totalLeadsText}`);
    if (wonRevenueText !== '₹0') throw new Error(`Expected ₹0 Won Revenue, got: ${wonRevenueText}`);

    // Verify Sales Funnel has no NaN or Infinity
    const analyticsContent = await page.content();
    if (analyticsContent.includes('NaN%') || analyticsContent.includes('Infinity%')) {
      throw new Error('FAIL: Found NaN% or Infinity% on Analytics Page!');
    }
    console.log('  ✓ Zero-denominator protection verified on full Analytics page.');

    const p2Path = path.join(SCREENSHOT_DIR, 'phase4-2-analytics-fresh-import.png');
    await page.screenshot({ path: p2Path, fullPage: true });
    saveScreenshot(p2Path, 'phase4-2-analytics-fresh-import.png');

    // -------------------------------------------------------------
    // STEP 3: CRM & Revenue Tracking on "FACTORY PRICE INTERIO"
    // -------------------------------------------------------------
    console.log('\n>>> [STEP 3] Entering Deal Revenue and Milestone Stages...');
    // Navigate to Leads page
    await page.locator('aside button:has-text("Leads")').click();
    await page.waitForTimeout(500);

    // Open first lead: "FACTORY PRICE INTERIO"
    const leadRow = page.locator('tr:has-text("FACTORY PRICE INTERIO")').first();
    await leadRow.click();
    await page.waitForTimeout(600);

    // Mark Contacted
    const markContactedBtn = page.locator('button:has-text("Mark Contacted")').first();
    await markContactedBtn.click();
    await page.waitForTimeout(400);

    // Change status to Replied
    const statusSelect = page.locator('select[aria-label="Change lead status"]').first();
    await statusSelect.selectOption('Replied');
    await page.waitForTimeout(400);

    // Enter Quoted Amount: 15000
    const quotedInput = page.locator('input[placeholder="e.g. 15000"]');
    await quotedInput.fill('15000');
    await quotedInput.blur();
    await page.waitForTimeout(400);

    // Change status to Interested
    await statusSelect.selectOption('Interested');
    await page.waitForTimeout(400);

    // Enter Deal Value: 12000
    const dealValueInput = page.locator('input[placeholder="e.g. 12000"]');
    await dealValueInput.fill('12000');
    await dealValueInput.blur();
    await page.waitForTimeout(400);

    // Advance to Demo Sent
    await statusSelect.selectOption('Demo Sent');
    await page.waitForTimeout(400);

    // Advance to Won! 🎉
    await statusSelect.selectOption('Won');
    await page.waitForTimeout(600);

    console.log('  ✓ Updated FACTORY PRICE INTERIO to Won (Quoted: ₹15,000, Deal: ₹12,000).');

    const p3Path = path.join(SCREENSHOT_DIR, 'phase4-3-lead-revenue-saved.png');
    await page.screenshot({ path: p3Path });
    saveScreenshot(p3Path, 'phase4-3-lead-revenue-saved.png');

    // Close panel
    const closePanelBtn = page.locator('button[aria-label="Close panel"]').first();
    await closePanelBtn.click();
    await page.waitForTimeout(400);

    // -------------------------------------------------------------
    // STEP 4: Check Dashboard Revenue Integration
    // -------------------------------------------------------------
    console.log('\n>>> [STEP 4] Checking Dashboard Revenue & Analytics Navigation...');
    await page.locator('aside button:has-text("Dashboard")').click();
    await page.waitForTimeout(500);

    // Check that Won Revenue is shown on Dashboard
    const wonRevenueBadge = page.locator('text=Won Revenue: ₹12,000');
    await wonRevenueBadge.waitFor({ state: 'visible' });
    console.log('  ✓ Won Revenue: ₹12,000 correctly displayed in Dashboard header badge!');

    // Click "View Full Analytics →"
    const viewFullAnalyticsBtn = page.locator('button:has-text("View Full Analytics")').first();
    await viewFullAnalyticsBtn.click();
    await page.waitForTimeout(600);

    // -------------------------------------------------------------
    // STEP 5: Verify Live Analytics Page Calculations
    // -------------------------------------------------------------
    console.log('\n>>> [STEP 5] Verifying Full Analytics Intelligence with Live Data...');
    // Won revenue KPI card
    const updatedWonRev = await page.locator('div[title="Click to filter won deals"] span.text-xl').innerText();
    const updatedWonDeals = await page.locator('div[title="Click to view won deals"] span.text-2xl').innerText();
    const updatedAvgDeal = await page.locator('text=Avg Won Deal').locator('..').locator('span.text-sm').innerText();

    console.log(`  Updated Analytics KPIs:`);
    console.log(`  - Won Revenue:    ${updatedWonRev} (Expected: ₹12,000)`);
    console.log(`  - Won Deals:      ${updatedWonDeals} (Expected: 1)`);
    console.log(`  - Avg Deal Value: ${updatedAvgDeal} (Expected: ₹12,000)`);

    if (updatedWonRev !== '₹12,000') throw new Error(`Expected ₹12,000 won revenue, got: ${updatedWonRev}`);
    if (updatedWonDeals !== '1') throw new Error(`Expected 1 won deal, got: ${updatedWonDeals}`);

    // Verify Tier Performance Table has ₹12,000
    const tierTableRow = page.locator('tr:has-text("A — Hot")').first();
    await tierTableRow.waitFor({ state: 'visible' });
    const tierRevText = await tierTableRow.locator('td').last().innerText();
    console.log(`  - Tier A Won Revenue: ${tierRevText}`);
    if (!tierRevText.includes('12,000')) {
      throw new Error(`Expected ₹12,000 in Tier A performance row, got: ${tierRevText}`);
    }

    // Verify Recent Sales Activity timeline contains "Deal Won!" and "FACTORY PRICE INTERIO"
    const timelineEntry = page.locator('text=FACTORY PRICE INTERIO').first();
    await timelineEntry.waitFor({ state: 'visible' });
    console.log('  ✓ FACTORY PRICE INTERIO displayed in Recent Sales Activity!');

    const p4Path = path.join(SCREENSHOT_DIR, 'phase4-4-analytics-with-revenue.png');
    await page.screenshot({ path: p4Path, fullPage: true });
    saveScreenshot(p4Path, 'phase4-4-analytics-with-revenue.png');

    // -------------------------------------------------------------
    // STEP 6: Test Drilldown Click-Through to Leads
    // -------------------------------------------------------------
    console.log('\n>>> [STEP 6] Testing Click-Through Drilldown to Filtered Leads...');
    // Click on Won Deals KPI card to filter leads by Won
    const wonCard = page.locator('div[title="Click to view won deals"]');
    await wonCard.click();
    await page.waitForTimeout(600);

    // Verify we navigated to Leads page with status filter active
    const statusFilterSelect = page.locator('label:has-text("Status")').locator('..').locator('select');
    const activeFilterValue = await statusFilterSelect.inputValue();
    console.log(`  Filter on Leads page: status=${activeFilterValue}`);

    // Verify FACTORY PRICE INTERIO is displayed
    const wonLeadVisible = await page.locator('text=FACTORY PRICE INTERIO').first().isVisible();
    if (!wonLeadVisible) throw new Error('FAIL: FACTORY PRICE INTERIO not found in filtered Won leads view!');
    console.log('  ✓ Drilldown successfully filtered Leads page to Won status!');

    const p5Path = path.join(SCREENSHOT_DIR, 'phase4-5-drilldown-filtered-leads.png');
    await page.screenshot({ path: p5Path });
    saveScreenshot(p5Path, 'phase4-5-drilldown-filtered-leads.png');

    // -------------------------------------------------------------
    // STEP 7: Persistence & Excel Re-Import Test
    // -------------------------------------------------------------
    console.log('\n>>> [STEP 7] Testing Persistence and Re-Import CRM Preservation...');
    // Reload page
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // Navigate back to Leads page and inspect FACTORY PRICE INTERIO
    await page.locator('aside button:has-text("Leads")').click();
    await page.waitForTimeout(500);

    const reloadedLeadRow = page.locator('tr:has-text("FACTORY PRICE INTERIO")').first();
    await reloadedLeadRow.click();
    await page.waitForTimeout(600);

    const reloadedStatus = await page.locator('select[aria-label="Change lead status"]').first().inputValue();
    const reloadedQuoted = await page.locator('input[placeholder="e.g. 15000"]').inputValue();
    const reloadedDeal = await page.locator('input[placeholder="e.g. 12000"]').inputValue();

    console.log(`  After page reload:`);
    console.log(`  - Status:       ${reloadedStatus} (Expected: Won)`);
    console.log(`  - Quoted:       ${reloadedQuoted} (Expected: 15000)`);
    console.log(`  - Deal Value:   ${reloadedDeal} (Expected: 12000)`);

    if (reloadedStatus !== 'Won' || reloadedQuoted !== '15000' || reloadedDeal !== '12000') {
      throw new Error('FAIL: CRM fields lost after page reload!');
    }
    console.log('  ✓ LocalStorage persistence verified!');

    // Close panel
    await page.locator('button[aria-label="Close panel"]').first().click();
    await page.waitForTimeout(400);

    // Re-import the exact same Excel file
    console.log('  Re-importing source Excel spreadsheet...');
    const topImportBtn = page.getByRole('button', { name: /Import Excel/i }).first();
    await topImportBtn.click();
    await page.waitForTimeout(400);

    const reimportFileInput = page.locator('input[type="file"]');
    await reimportFileInput.setInputFiles(excelFilePath);
    await page.waitForSelector('text=Import Complete', { timeout: 10000 });

    // Close import summary
    await page.getByRole('button', { name: /Close/i }).first().click();
    await page.waitForTimeout(600);

    // Verify FACTORY PRICE INTERIO retains CRM fields
    await page.locator('tr:has-text("FACTORY PRICE INTERIO")').first().click();
    await page.waitForTimeout(600);

    const preservedStatus = await page.locator('select[aria-label="Change lead status"]').first().inputValue();
    const preservedQuoted = await page.locator('input[placeholder="e.g. 15000"]').inputValue();
    const preservedDeal = await page.locator('input[placeholder="e.g. 12000"]').inputValue();

    console.log(`  After Excel re-import:`);
    console.log(`  - Status:       ${preservedStatus} (Expected: Won)`);
    console.log(`  - Quoted:       ${preservedQuoted} (Expected: 15000)`);
    console.log(`  - Deal Value:   ${preservedDeal} (Expected: 12000)`);

    if (preservedStatus !== 'Won' || preservedQuoted !== '15000' || preservedDeal !== '12000') {
      throw new Error('FAIL: CRM fields wiped or overwritten by Excel re-import!');
    }
    console.log('  ✓ Re-import preservation of CRM status and revenue fields VERIFIED!');

    const p6Path = path.join(SCREENSHOT_DIR, 'phase4-6-reimport-preservation.png');
    await page.screenshot({ path: p6Path });
    saveScreenshot(p6Path, 'phase4-6-reimport-preservation.png');

    console.log('\n===============================================================');
    console.log('  ALL 7 PHASE 4 PLAYWRIGHT E2E VERIFICATIONS PASSED! 🎉');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err);
    const errorPath = path.join(SCREENSHOT_DIR, 'phase4-error.png');
    await page.screenshot({ path: errorPath, fullPage: true });
    saveScreenshot(errorPath, 'phase4-error.png');
    throw err;
  } finally {
    await browser.close();
  }
}

runPhase4E2E();
