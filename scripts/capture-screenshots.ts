import { chromium } from "playwright";
import path from "path";

const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(__dirname, "..", "public", "screenshots");

async function login(page: any, username: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill("#identifier", username);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  // Wait for the redirect off /login rather than a fixed delay — a cold
  // route compile can easily outlast a hardcoded timeout.
  await page.waitForURL((url: URL) => !url.pathname.startsWith("/login"), {
    timeout: 60000,
  });
  await page.waitForLoadState("networkidle");
}

async function screenshot(page: any, url: string, name: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  if (new URL(page.url()).pathname.startsWith("/login")) {
    throw new Error(`Not authenticated when capturing ${name} (bounced to /login)`);
  }
  await page.screenshot({ path: path.join(OUT_DIR, name) });
  console.log(`✓ ${name}`);
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // --- Admin screenshots ---
  await login(page, "admin", "admin");
  await screenshot(page, `${BASE_URL}/clinic`, "clinic-dashboard.png");
  await screenshot(page, `${BASE_URL}/clinic/appointments`, "clinic-appointments.png");
  await screenshot(page, `${BASE_URL}/clinic/patients`, "clinic-patients.png");
  await screenshot(page, `${BASE_URL}/clinic/doctors`, "clinic-doctors.png");

  // Clear session
  await context.clearCookies();

  // --- Doctor screenshots ---
  await login(page, "doctor", "doctor");
  await screenshot(page, `${BASE_URL}/doctor/dashboard`, "doctor-dashboard.png");
  await screenshot(page, `${BASE_URL}/doctor/schedule`, "doctor-schedule.png");
  await screenshot(page, `${BASE_URL}/doctor/patients`, "doctor-patients.png");

  // Clear session
  await context.clearCookies();

  // --- Patient screenshots ---
  await login(page, "patient", "patient");
  await screenshot(page, `${BASE_URL}/patient/dashboard`, "patient-dashboard.png");
  await screenshot(page, `${BASE_URL}/patient/appointments`, "patient-appointments.png");
  await screenshot(page, `${BASE_URL}/patient/records`, "patient-records.png");

  await browser.close();
  console.log("\nDone! All screenshots saved to public/screenshots/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
