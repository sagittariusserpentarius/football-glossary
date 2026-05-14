import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';
import { formations } from '../src/data/formations';
import { coverages } from '../src/data/coverages';
// Import your data types
import type { Formation } from '../src/types/formations';
import type { Coverage } from '../src/types/coverages';

const OUTPUT_DIR = join(process.cwd(), 'public', 'embed-images');
const BASE_URL = 'http://localhost:3000'; // Will be served by Vite in test mode

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

async function captureFormationImage(
  browser: Browser,
  formation: Formation,
  page: Page
): Promise<string> {
  const filename = `formation-${formation.id}.png`;
  const filepath = join(OUTPUT_DIR, filename);
  
  console.log(`Capturing formation: ${formation.name}...`);
  
  await page.goto(`${BASE_URL}/formation/${formation.id}`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });
  
  // Wait for the field container to be rendered
  await page.waitForSelector('#field-container', { timeout: 10000 });
  
  // Wait a bit for animations to settle
  await page.waitForTimeout(500);
  
  // Get the field container element
  const fieldContainer = await page.$('#field-container');
  if (!fieldContainer) {
    throw new Error(`Field container not found for formation ${formation.id}`);
  }
  
  // Capture screenshot of just the field container
  const screenshot = await fieldContainer.screenshot({
    type: 'png',
    quality: 85,
  }) as Buffer;
  
  writeFileSync(filepath, screenshot);
  console.log(`  Saved: ${filename}`);
  
  return filename;
}

async function captureCoverageImage(
  browser: Browser,
  coverage: Coverage,
  page: Page
): Promise<string> {
  const filename = `coverage-${coverage.id}.png`;
  const filepath = join(OUTPUT_DIR, filename);
  
  console.log(`Capturing coverage: ${coverage.name}...`);
  
  await page.goto(`${BASE_URL}/coverage/${coverage.id}`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });
  
  // Wait for the coverage container to be rendered
  await page.waitForSelector('#coverage-container', { timeout: 10000 });
  
  // Wait a bit for animations to settle
  await page.waitForTimeout(500);
  
  // Get the coverage container element
  const coverageContainer = await page.$('#coverage-container');
  if (!coverageContainer) {
    throw new Error(`Coverage container not found for coverage ${coverage.id}`);
  }
  
  // Capture screenshot of just the coverage container
  const screenshot = await coverageContainer.screenshot({
    type: 'png',
    quality: 85,
  }) as Buffer;
  
  writeFileSync(filepath, screenshot);
  console.log(`  Saved: ${filename}`);
  
  return filename;
}

async function main() {
  console.log('Starting embed image generation...\n');
  
  ensureOutputDir();
  
  // Launch Puppeteer in headless mode
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport size for consistent captures
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 2, // 2x for better quality
    });
    
    const results = {
      formations: [] as string[],
      coverages: [] as string[],
      total: 0,
    };
    
    // Generate formation images
    console.log('Generating formation images...\n');
    for (const formation of formations) {
      try {
        const filename = await captureFormationImage(browser, formation, page);
        results.formations.push(filename);
      } catch (error) {
        console.error(`  Error capturing ${formation.name}:`, error);
      }
    }
    
    // Generate coverage images
    console.log('\nGenerating coverage images...\n');
    for (const coverage of coverages) {
      try {
        const filename = await captureCoverageImage(browser, coverage, page);
        results.coverages.push(filename);
      } catch (error) {
        console.error(`  Error capturing ${coverage.name}:`, error);
      }
    }
    
    results.total = results.formations.length + results.coverages.length;
    
    console.log('\n✅ Image generation complete!');
    console.log(`Generated ${results.formations.length} formation images`);
    console.log(`Generated ${results.coverages.length} coverage images`);
    console.log(`Total: ${results.total} images\n`);
    
    // Write a manifest file for easy lookup
    const manifest = {
      formations: Object.fromEntries(
        formations.map((f, i) => [f.id, results.formations[i] || null])
      ),
      coverages: Object.fromEntries(
        coverages.map((c, i) => [c.id, results.coverages[i] || null])
      ),
      generatedAt: new Date().toISOString(),
    };
    
    writeFileSync(
      join(OUTPUT_DIR, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    console.log('Manifest saved to embed-images/manifest.json');
    
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error('❌ Fatal error during image generation:', error);
  process.exit(1);
});