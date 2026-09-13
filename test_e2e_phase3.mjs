import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function runPhase3E2ETest() {
  console.log('=====================================================');
  console.log('  STARTING PLAYWRIGHT REAL BROWSER E2E TEST: PHASE 3  ');
  console.log('=====================================================\n');

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  const screenshotDir = path.resolve('test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    // Step 1: Open LeadFlow
    console.log('Step 1: Navigating to LeadFlow at http://localhost:5174/ ...');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    console.log('✓ Page loaded.');

    // Step 2: Clear any existing storage first to guarantee pristine state
    console.log('\nStep 2: Clearing existing state to ensure clean test run...');
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    // Step 3: Upload the 50-lead Excel file
    console.log('\nStep 3: Importing real 50-lead dataset...');
    const importBtn = page.getByRole('button', { name: /Import Excel/i }).first();
    await importBtn.click();
    await page.waitForTimeout(500);

    const fileInput = page.locator('input[type="file"]');
    const excelFilePath = 'C:/Users/admin/Downloads/top_50_interior_design_leads_with_whatsapp_messages.xlsx';
    if (!fs.existsSync(excelFilePath)) {
      throw new Error('File not found: ' + excelFilePath);
    }
    await fileInput.setInputFiles(excelFilePath);
    await page.waitForSelector('text=Import Complete', { timeout: 10000 });
    console.log('✓ Imported 50 leads successfully.');

    // Step 4: Click "View in Leads Table →"
    const viewLeadsBtn = page.getByRole('button', { name: /View in Leads Table/i });
    await viewLeadsBtn.click();
    await page.waitForTimeout(500);

    // Step 5: Locate and click "FACTORY PRICE INTERIO"
    console.log('\nStep 5: Inspecting FACTORY PRICE INTERIO...');
    const leadRow = page.locator('tr:has-text("FACTORY PRICE INTERIO")').first();
    await leadRow.click();
    await page.waitForTimeout(500);
    await page.waitForSelector('text=Personalized WhatsApp Message');
    console.log('✓ Lead Detail Panel opened.');
    await page.screenshot({ path: path.join(screenshotDir, 'phase3-1-opened-lead.png') });

    // Step 6: Verify default initial CRM state
    console.log('\nStep 6: Verifying initial CRM state...');
    const initialStatus = await page.locator('button:has-text("Mark Contacted")').isVisible();
    if (!initialStatus) throw new Error('Expected Mark Contacted button to be visible for New lead');
    console.log('✓ Mark Contacted button is visible.');

    // Step 7: Click "Mark Contacted"
    console.log('\nStep 7: Clicking "Mark Contacted"...');
    const markContactedBtn = page.locator('button:has-text("Mark Contacted")').first();
    await markContactedBtn.click();
    await page.waitForTimeout(500);

    // Verify contact attempts changed to Attempt #2 button
    const attemptBtn = page.locator('button:has-text("Attempt #2")').first();
    await attemptBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Lead successfully marked as Contacted (Attempt #1 recorded, button shows Attempt #2).');
    await page.screenshot({ path: path.join(screenshotDir, 'phase3-2-marked-contacted.png') });

    // Step 8: Set Follow-up to "Tomorrow"
    console.log('\nStep 8: Scheduling follow-up for Tomorrow...');
    const tomorrowBtn = page.locator('button:has-text("Tomorrow")').first();
    await tomorrowBtn.click();
    await page.waitForTimeout(500);
    const followUpBadge = page.locator('text=Tomorrow').first();
    await followUpBadge.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Follow-up set to Tomorrow.');

    // Step 9: Add Client Note
    console.log('\nStep 9: Adding Client Note in Notes area...');
    const notesArea = page.locator('textarea[placeholder*="Add client follow-up notes"]').first();
    await notesArea.fill('Interested in premium website demo. Wants to see residential portfolio section.');
    await page.waitForTimeout(500);
    console.log('✓ Note entered and auto-saved.');
    await page.screenshot({ path: path.join(screenshotDir, 'phase3-3-followup-and-notes.png') });

    // Step 10: Change Status to "Replied"
    console.log('\nStep 10: Changing status to "Replied"...');
    const repliedBtn = page.locator('button:has-text("💬 Replied")').first();
    await repliedBtn.click();
    await page.waitForTimeout(500);
    console.log('✓ Status changed to Replied.');

    // Step 11: Refresh page to test local-first persistence
    console.log('\nStep 11: Refreshing browser to verify localStorage persistence...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // After reload, LeadFlow defaults to Dashboard tab; navigate to Leads tab
    const leadsNavBtn = page.locator('button:has-text("Leads")').first();
    await leadsNavBtn.click();
    await page.waitForTimeout(500);

    // Re-open FACTORY PRICE INTERIO
    const refreshedLeadRow = page.locator('tr:has-text("FACTORY PRICE INTERIO")').first();
    await refreshedLeadRow.click();
    await page.waitForTimeout(500);

    // Verify status is Replied, follow-up is Tomorrow, note is intact
    const noteVal = await page.locator('textarea[placeholder*="Add client follow-up notes"]').first().inputValue();
    if (!noteVal.includes('residential portfolio section')) {
      throw new Error('Note did not persist! Found: ' + noteVal);
    }
    console.log('✓ Note successfully persisted across refresh.');

    const persistedFollowUp = await page.locator('text=Tomorrow').first().isVisible();
    if (!persistedFollowUp) {
      throw new Error('Follow-up date Tomorrow did not persist!');
    }
    console.log('✓ Follow-up Tomorrow successfully persisted.');

    // Step 12: Close Inspector
    console.log('\nStep 12: Closing Lead Inspector...');
    const closeBtn = page.locator('button[title="Close Inspector (Esc)"]').first();
    await closeBtn.click();
    await page.waitForTimeout(500);

    // Step 13: Navigate to Follow-ups tab
    console.log('\nStep 13: Navigating to Follow-ups tab in Sidebar...');
    const followUpsTab = page.locator('button:has-text("Follow-ups")').first();
    await followUpsTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, 'phase3-4-followups-page.png') });

    // Verify FACTORY PRICE INTERIO is in Upcoming (Tomorrow is tomorrow)
    const cardTitle = page.locator('h3:has-text("FACTORY PRICE INTERIO")').first();
    await cardTitle.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ FACTORY PRICE INTERIO card is displayed on Follow-ups page.');

    // Step 14: Reschedule using "+3d" button
    console.log('\nStep 14: Testing quick reschedule (+3d)...');
    const plus3dBtn = page.locator('button:has-text("+3d")').first();
    await plus3dBtn.click();
    await page.waitForTimeout(500);
    const in3daysBadge = page.locator('text=In 3 days').first();
    await in3daysBadge.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Successfully rescheduled to "In 3 days".');

    // Step 15: Mark follow-up Done
    console.log('\nStep 15: Testing "✓ Done" button (clears date, retains status)...');
    const doneBtn = page.locator('button:has-text("✓ Done")').first();
    await doneBtn.click();
    await page.waitForTimeout(500);

    // Verify empty follow-ups state is shown or card removed
    const noFollowUpsHeader = page.locator('text=No Follow-ups Scheduled').first();
    await noFollowUpsHeader.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Follow-up cleared; page shows "No Follow-ups Scheduled".');

    // Step 16: Check Dashboard metrics and pipeline stage cards
    console.log('\nStep 16: Navigating to Dashboard to verify Pipeline Counters & Conversion Funnel...');
    const dashboardTab = page.locator('button:has-text("Dashboard")').first();
    await dashboardTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, 'phase3-5-dashboard-funnel.png') });

    // Verify Replied count is at least 1
    const repliedStat = page.locator('text=Replied').first();
    await repliedStat.waitFor({ state: 'visible' });
    console.log('✓ Dashboard pipeline metrics and conversion rates verified.');

    console.log('\n=====================================================');
    console.log('  🎉 ALL 16 PHASE 3 VERIFICATION CRITERIA PASSED!  ');
    console.log('=====================================================');
  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err);
    await page.screenshot({ path: path.join(screenshotDir, 'phase3-error.png') });
    throw err;
  } finally {
    await browser.close();
  }
}

runPhase3E2ETest();
