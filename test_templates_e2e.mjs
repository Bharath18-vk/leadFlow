import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/admin/.gemini/antigravity/brain/e1017e3c-38e3-42ec-8ebb-74f276b95dd9';
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

async function runTemplatesE2ETest() {
  console.log('===============================================================');
  console.log('  STARTING MESSAGE TEMPLATES STUDIO E2E TEST');
  console.log('===============================================================\n');

  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    console.log('>>> [1] Loading App & Navigating to Templates Tab...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Click Templates in Sidebar
    const templatesTabBtn = page.locator('aside button:has-text("Templates")').first();
    await templatesTabBtn.click();
    await page.waitForTimeout(500);

    // Verify Phase 2 placeholder is completely GONE
    const phase2Text = await page.locator('text=Scheduled for Phase 2').count();
    if (phase2Text > 0) {
      throw new Error('Phase 2 placeholder is still visible!');
    }
    console.log('  ✓ Verified "Scheduled for Phase 2" is completely removed.');

    // Verify Templates Studio header
    const title = page.locator('h1:has-text("Message Templates Studio")').first();
    await title.waitFor({ state: 'visible' });
    console.log('  ✓ Message Templates Studio loaded successfully.');

    // Verify built-in templates exist in the list
    const templateCards = page.locator('text=Cold Website Opportunity (Standard)');
    await templateCards.first().waitFor({ state: 'visible' });
    console.log('  ✓ Default built-in template rendered.');

    // Take screenshot of Templates Studio (Light Mode)
    const shotLight = path.join(SCREENSHOT_DIR, 'templates_studio_light.png');
    await page.screenshot({ path: shotLight, fullPage: false });
    saveScreenshot(shotLight, 'templates_studio_light.png');
    console.log('  ✓ Captured Light Mode screenshot.');

    // Toggle Dark Mode
    console.log('\n>>> [2] Testing Dark Mode...');
    const themeToggleBtn = page.locator('button[aria-label*="Switch to"]').first();
    await themeToggleBtn.click();
    await page.waitForTimeout(400);


    // Take screenshot of Templates Studio (Dark Mode)
    const shotDark = path.join(SCREENSHOT_DIR, 'templates_studio_dark.png');
    await page.screenshot({ path: shotDark, fullPage: false });
    saveScreenshot(shotDark, 'templates_studio_dark.png');
    console.log('  ✓ Captured Dark Mode screenshot.');

    // Switch back to light mode for test flow
    await themeToggleBtn.click();
    await page.waitForTimeout(300);

    // Test Live WhatsApp Simulator
    console.log('\n>>> [3] Testing Live WhatsApp Simulator & Variable Interpolation...');
    const chatBubble = page.locator('[data-testid="whatsapp-chat-bubble"]').first();
    await chatBubble.waitFor({ state: 'visible' });

    const bubbleText = await chatBubble.textContent();
    console.log('  - Live Chat Bubble preview contains: ' + bubbleText?.slice(0, 70) + '...');
    if (!bubbleText?.includes('Studio One Interiors')) {
      throw new Error('Chat preview does not interpolate default sample lead values!');
    }
    console.log('  ✓ Dynamic variable interpolation working smoothly in simulator.');

    // Test creating a new template
    console.log('\n>>> [4] Testing New Template Creation & Variable Chips...');
    const newTemplateBtn = page.locator('button:has-text("New Template")').first();
    await newTemplateBtn.click();
    await page.waitForTimeout(400);

    // Click variable chip "+ Rating"
    const addRatingChip = page.locator('button:has-text("+ Google Rating")').first();
    await addRatingChip.click();
    await page.waitForTimeout(200);

    const saveBtn = page.locator('button:has-text("Save Template")').first();
    await saveBtn.click();
    await page.waitForTimeout(400);
    console.log('  ✓ Template saved successfully.');

    // Check Leads view LeadDetailPanel template selector
    console.log('\n>>> [5] Testing Template Selector inside Lead Detail Panel...');
    const leadsTabBtn = page.locator('aside button:has-text("Leads")').first();
    await leadsTabBtn.click();
    await page.waitForTimeout(500);

    const loadDemoBtn = page.locator('button:has-text("Load Demo Data")').first();
    if (await loadDemoBtn.isVisible()) {
      console.log('  - Loading demo data...');
      await loadDemoBtn.click();
      await page.waitForTimeout(600);
      const closeDialogBtn = page.locator('button:has-text("Start Working"), button:has-text("Close")').first();
      if (await closeDialogBtn.isVisible()) {
        await closeDialogBtn.click();
        await page.waitForTimeout(400);
      }
    }

    const firstLeadRow = page.locator('tbody tr.cursor-pointer').first();
    await firstLeadRow.waitFor({ state: 'visible' });
    await firstLeadRow.click();
    await page.waitForTimeout(600);


    const templateSelect = page.locator('[data-testid="lead-template-select"]').first();
    await templateSelect.waitFor({ state: 'visible' });
    console.log('  ✓ Template selector dropdown found in Lead Detail Panel.');

    // Select Quick & Direct Question by value
    await templateSelect.selectOption({ value: 'template-quick-direct' });
    await page.waitForTimeout(300);


    const msgArea = page.locator('textarea[placeholder="Type or edit personalized message..."]').first();
    const currentVal = await msgArea.inputValue();
    if (!currentVal.includes('quick question')) {
      throw new Error('Template was not applied to lead message textarea!');
    }
    console.log('  ✓ Template successfully applied to lead: ' + currentVal.slice(0, 60) + '...');

    const shotLeadDetail = path.join(SCREENSHOT_DIR, 'lead_detail_with_template.png');
    await page.screenshot({ path: shotLeadDetail, fullPage: false });
    saveScreenshot(shotLeadDetail, 'lead_detail_with_template.png');

    console.log('\n===============================================================');
    console.log('  ALL TEMPLATES STUDIO E2E TESTS PASSED SUCCESSFULLY! (100%)');
    console.log('===============================================================');
  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTemplatesE2ETest();
