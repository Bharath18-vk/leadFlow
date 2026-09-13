import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function runBrowserTest() {
  console.log('==============================================');
  console.log('   STARTING PLAYWRIGHT REAL BROWSER E2E TEST   ');
  console.log('==============================================\n');

  const browser = await chromium.launch({
    headless: true, // headless mode for automated execution
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
    // 1. Navigate to LeadFlow
    console.log('Step 1: Navigating to LeadFlow at http://localhost:5174/ ...');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    console.log('✓ Page loaded successfully.');

    // 2. Open Import Modal & Upload File
    console.log('\nStep 2: Uploading 50-lead Excel file...');
    // Click Import button
    const importBtn = page.getByRole('button', { name: /Import Excel/i }).first();
    await importBtn.click();
    await page.waitForTimeout(500);

    const fileInput = page.locator('input[type="file"]');
    const excelFilePath = 'C:/Users/admin/Downloads/top_50_interior_design_leads_with_whatsapp_messages.xlsx';
    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`File not found: ${excelFilePath}`);
    }

    await fileInput.setInputFiles(excelFilePath);
    console.log('✓ Uploaded file to input element.');

    // 3. Verify Import Summary Dialog
    console.log('\nStep 3: Verifying Import Summary Dialog...');
    await page.waitForSelector('text=Import Complete', { timeout: 10000 });
    const importedText = await page.locator('text=50').first().innerText();
    console.log(`✓ Import dialog appeared showing: ${importedText} leads.`);
    await page.screenshot({ path: path.join(screenshotDir, 'e2e-1-imported.png') });

    // Click "View in Leads Table →"
    const viewLeadsBtn = page.getByRole('button', { name: /View in Leads Table/i });
    await viewLeadsBtn.click();
    await page.waitForTimeout(500);

    // 4. Locate and Open "FACTORY PRICE INTERIO"
    console.log('\nStep 4: Opening FACTORY PRICE INTERIO in Leads Table...');
    const factoryPriceRow = page.locator('tr:has-text("FACTORY PRICE INTERIO")').first();
    await factoryPriceRow.scrollIntoViewIfNeeded();
    await factoryPriceRow.click();
    await page.waitForTimeout(500);

    // 5. Verify Lead Inspector details
    console.log('\nStep 5: Verifying Lead Inspector details...');
    await page.waitForSelector('h2:has-text("FACTORY PRICE INTERIO")');

    const phoneText = await page.locator('text=+91 77600 13979').first().innerText();
    console.log(`  - Verified Phone: ${phoneText}`);

    // Verify rating and reviews in drawer
    const ratingElement = await page.locator('text=4.9').first().innerText();
    console.log(`  - Verified Rating: ${ratingElement}`);

    // 6. Verify and edit personalized message
    console.log('\nStep 6: Editing personalized message in textarea...');
    const textarea = page.locator('textarea').first();
    const originalMsg = await textarea.inputValue();
    console.log(`  - Original message length: ${originalMsg.length} characters`);
    if (!originalMsg.includes('FACTORY PRICE INTERIO')) {
      throw new Error('Default message did not contain business name!');
    }

    const editAddition = '\n\nP.S. We also design 3D interactive portfolio catalogs!';
    const editedMsg = originalMsg + editAddition;
    await textarea.fill(editedMsg);
    await page.waitForTimeout(400); // allow auto-persistence
    console.log('✓ Message edited in textarea.');
    await page.screenshot({ path: path.join(screenshotDir, 'e2e-2-lead-inspector-edited.png') });

    // 7. Click "Open WhatsApp" and capture new tab
    console.log('\nStep 7: Clicking "Open WhatsApp" and capturing new browser tab...');
    const openWhatsAppBtn = page.getByRole('button', { name: /Open WhatsApp/i });

    // Setup listener for popup / new page
    const popupPromise = context.waitForEvent('page', { timeout: 8000 });
    await openWhatsAppBtn.click();

    const popupPage = await popupPromise;
    await popupPage.waitForLoadState('domcontentloaded');
    const popupUrl = popupPage.url();
    console.log(`✓ WhatsApp new tab opened with URL:\n  ${popupUrl.slice(0, 100)}...`);

    // Verify correct deep link / redirect URL format and prefilled message
    const hasCorrectPhone = popupUrl.includes('917760013979');
    const hasEditedText =
      popupUrl.includes(encodeURIComponent('3D interactive portfolio catalogs!')) ||
      popupUrl.includes('3D+interactive+portfolio+catalogs') ||
      popupUrl.includes('3D%20interactive%20portfolio%20catalogs');

    if (!hasCorrectPhone) {
      throw new Error(`WhatsApp URL did not target 917760013979. Got: ${popupUrl}`);
    }
    if (!hasEditedText) {
      throw new Error(`WhatsApp URL did not contain the edited message text! Got: ${popupUrl}`);
    }
    console.log('✓ Confirmed: WhatsApp URL correctly targets 917760013979 with prefilled edited message.');

    // Close the WhatsApp tab without sending
    await popupPage.close();
    console.log('✓ Closed WhatsApp tab without sending message.');

    // 8. Verify Status remains "New" in LeadFlow
    console.log('\nStep 8: Checking that lead status remains "New" after opening WhatsApp...');
    await page.bringToFront();
    await page.waitForTimeout(500);

    // Confirm the outreach confirmation banner is visible
    const confirmationBanner = page.locator('text=WhatsApp conversation opened in a new tab');
    const bannerVisible = await confirmationBanner.isVisible();
    console.log(`  - Confirmation banner visible: ${bannerVisible}`);
    if (!bannerVisible) {
      throw new Error('Expected confirmation banner to appear after opening WhatsApp!');
    }

    // Verify status dropdown inside drawer still shows New
    const drawerStatusSelect = page.locator('div:has(> span:has-text("Current Status")) select').first();
    const currentStatus = await drawerStatusSelect.inputValue();
    console.log(`  - Lead status in drawer: "${currentStatus}" (Must be "New")`);
    if (currentStatus !== 'New') {
      throw new Error(`Expected status to remain "New", but got "${currentStatus}"`);
    }
    console.log('✓ Confirmed: Opening WhatsApp did NOT automatically mark lead as contacted.');

    // 9. Click "Mark Contacted"
    console.log('\nStep 9: Clicking "Mark as Contacted"...');
    const markContactedBtn = page.getByRole('button', { name: /Mark as Contacted/i }).first();
    await markContactedBtn.click();
    await page.waitForTimeout(500);

    // Confirm status changed to Contacted
    const updatedStatus = await drawerStatusSelect.inputValue();
    console.log(`  - Lead status after clicking Mark Contacted: "${updatedStatus}"`);
    if (updatedStatus !== 'Contacted') {
      throw new Error(`Expected status to be "Contacted", but got "${updatedStatus}"`);
    }
    console.log('✓ Status successfully changed to "Contacted".');
    await page.screenshot({ path: path.join(screenshotDir, 'e2e-3-marked-contacted.png') });

    // 10. Refresh the browser and verify persistence
    console.log('\nStep 10: Refreshing browser to verify localStorage persistence...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Navigate to Leads tab from sidebar
    const leadsNavBtn = page.locator('nav button:has-text("Leads")');
    await leadsNavBtn.click();
    await page.waitForTimeout(500);

    // Find FACTORY PRICE INTERIO in table
    const refreshedRow = page.locator('tr:has-text("FACTORY PRICE INTERIO")').first();
    const rowText = await refreshedRow.innerText();
    console.log(`  - Table row after refresh contains Contacted: ${rowText.includes('Contacted')}`);
    if (!rowText.includes('Contacted')) {
      throw new Error('Contacted status was not persisted in table row after refresh!');
    }

    // Open inspector to verify customMessage was persisted
    await refreshedRow.click();
    await page.waitForTimeout(500);
    const refreshedTextarea = page.locator('textarea').first();
    const refreshedMsg = await refreshedTextarea.inputValue();
    console.log(`  - Persisted message contains edit addition: ${refreshedMsg.includes('3D interactive portfolio catalogs!')}`);
    if (!refreshedMsg.includes('3D interactive portfolio catalogs!')) {
      throw new Error('Custom edited message was not persisted across reload!');
    }
    console.log('✓ Contacted status & edited message successfully persisted across browser refresh.');
    await page.screenshot({ path: path.join(screenshotDir, 'e2e-4-persisted-after-refresh.png') });

    // 11. Click "Next Lead" and verify advancement
    console.log('\nStep 11: Testing "Next Lead" advancement...');
    const nextLeadBtn = page.getByRole('button', { name: /Next Lead/i });
    await nextLeadBtn.click();
    await page.waitForTimeout(500);

    const nextLeadTitle = await page.locator('div[class*="fixed inset-y-0 right-0"] h2').first().innerText();
    console.log(`  - Next Lead opened: "${nextLeadTitle}"`);
    if (nextLeadTitle.includes('FACTORY PRICE INTERIO')) {
      throw new Error('Next Lead failed: Still showing FACTORY PRICE INTERIO!');
    }
    console.log(`✓ "Next Lead" successfully loaded the next eligible prospect: "${nextLeadTitle}"`);
    await page.screenshot({ path: path.join(screenshotDir, 'e2e-5-next-lead.png') });

    console.log('\n==============================================');
    console.log('   ✓ ALL PLAYWRIGHT BROWSER E2E TESTS PASSED!   ');
    console.log('==============================================\n');
  } catch (err) {
    console.error('\n❌ Playwright Test Error:', err);
    await page.screenshot({ path: path.join(screenshotDir, 'e2e-error.png') });
    throw err;
  } finally {
    await browser.close();
  }
}

runBrowserTest().catch((_e) => {
  process.exit(1);
});
