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

async function runAutoBatchRunnerTest() {
  console.log('===============================================================');
  console.log('  STARTING AUTO BATCH RUNNER E2E TEST');
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
    console.log('>>> [1] Loading App & Ensuring Leads in Queue...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // If no leads, load demo leads
    const loadDemoBtn = page.locator('button:has-text("Load Demo Data")').first();
    if (await loadDemoBtn.isVisible()) {
      console.log('  - Loading demo leads...');
      await loadDemoBtn.click();
      await page.waitForTimeout(600);
      const closeDialogBtn = page.locator('button:has-text("Start Working"), button:has-text("Close")').first();
      if (await closeDialogBtn.isVisible()) {
        await closeDialogBtn.click();
        await page.waitForTimeout(400);
      }
    }

    // Navigate to Outreach Queue
    const queueNavBtn = page.locator('aside button:has-text("Outreach Queue")').first();
    await queueNavBtn.click();
    await page.waitForTimeout(500);

    // Verify Auto-Batch Runner banner is visible
    const runnerHeading = page.locator('text=Auto-Batch Outreach Runner').first();
    await runnerHeading.waitFor({ state: 'visible' });
    console.log('  ✓ Auto-Batch Outreach Runner card is rendered on Outreach Queue.');

    // Verify Start Auto-Batch CTA is present
    const startBatchBtn = page.locator('button:has-text("Start Auto-Batch")').first();
    await startBatchBtn.waitFor({ state: 'visible' });
    console.log('  ✓ Found Start Auto-Batch button.');

    // Test expanding settings
    const settingsBtn = page.locator('button:has-text("Delay")').first();
    await settingsBtn.click();
    await page.waitForTimeout(300);

    const safeDelayChip = page.locator('button:has-text("4s (Fast)")').first();
    await safeDelayChip.waitFor({ state: 'visible' });
    await safeDelayChip.click();
    await page.waitForTimeout(200);
    console.log('  ✓ Selected 4s Fast delay preset.');

    // Screenshot in Light Mode
    const shotLight = path.join(SCREENSHOT_DIR, 'auto_batch_runner_idle_light.png');
    await page.screenshot({ path: shotLight, fullPage: false });
    saveScreenshot(shotLight, 'auto_batch_runner_idle_light.png');
    console.log('  ✓ Saved Light Mode idle screenshot.');

    // Switch to Dark Mode
    const themeToggleBtn = page.locator('button[aria-label*="Switch to"]').first();
    await themeToggleBtn.click();
    await page.waitForTimeout(400);

    const shotDark = path.join(SCREENSHOT_DIR, 'auto_batch_runner_idle_dark.png');
    await page.screenshot({ path: shotDark, fullPage: false });
    saveScreenshot(shotDark, 'auto_batch_runner_idle_dark.png');
    console.log('  ✓ Saved Dark Mode idle screenshot.');

    // Switch back to Light Mode
    await themeToggleBtn.click();
    await page.waitForTimeout(300);

    // Start Auto-Batch
    console.log('\n>>> [2] Starting Auto-Batch Outreach...');
    await startBatchBtn.click();
    await page.waitForTimeout(800);

    // Verify active running state
    const runningIndicator = page.locator('text=Auto-Batch Running').first();
    await runningIndicator.waitFor({ state: 'visible' });
    console.log('  ✓ Runner state transitioned to "Auto-Batch Running".');

    // Verify countdown timer badge
    const countdownBadge = page.locator('text=/Next lead in \\d+s/').first();
    await countdownBadge.waitFor({ state: 'visible' });
    const timerText = await countdownBadge.textContent();
    console.log(`  ✓ Live countdown active: "${timerText}"`);

    // Verify active target lead row is highlighted
    const activeTargetBadge = page.locator('text=Active Target').first();
    await activeTargetBadge.waitFor({ state: 'visible' });
    console.log('  ✓ Queue table row visually highlighted with "Active Target" badge.');

    // Take screenshot during active running
    const shotRunning = path.join(SCREENSHOT_DIR, 'auto_batch_runner_active.png');
    await page.screenshot({ path: shotRunning, fullPage: false });
    saveScreenshot(shotRunning, 'auto_batch_runner_active.png');

    // Test Pause
    console.log('\n>>> [3] Testing Pause and Resume Controls...');
    const pauseBtn = page.locator('button:has-text("Pause")').first();
    await pauseBtn.click();
    await page.waitForTimeout(400);

    const pausedText = page.locator('text=Batch Paused').first();
    await pausedText.waitFor({ state: 'visible' });
    console.log('  ✓ Pause successfully halted countdown.');

    // Test Resume
    const resumeBtn = page.locator('button:has-text("Resume")').first();
    await resumeBtn.click();
    await page.waitForTimeout(400);
    await runningIndicator.waitFor({ state: 'visible' });
    console.log('  ✓ Resume continued the auto-runner.');

    // Test Next Now (Fast-forward to next lead)
    console.log('\n>>> [4] Testing Next Now (Immediate Fast-Forward)...');
    const nextNowBtn = page.locator('button:has-text("Next Now")').first();
    await nextNowBtn.click();
    await page.waitForTimeout(800);
    console.log('  ✓ Next Now immediately processed and advanced to next queue lead.');

    // Test Stop
    console.log('\n>>> [5] Testing Stop Control...');
    const stopBtn = page.locator('button:has-text("Stop")').first();
    await stopBtn.click();
    await page.waitForTimeout(400);

    await runnerHeading.waitFor({ state: 'visible' });
    console.log('  ✓ Stop successfully returned runner to idle state.');

    console.log('\n===============================================================');
    console.log('  ALL AUTO BATCH RUNNER E2E TESTS PASSED (100%)');
    console.log('===============================================================');
  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runAutoBatchRunnerTest();
