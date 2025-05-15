// Required dependencies for browser automation, file system, and OS operations
const puppeteer = require("puppeteer");
const os = require("os");
const path = require("path");
const fs = require("fs");

// Helper function to get Brave browser path based on operating system
function getBravePath() {
  const platform = os.platform();

  if (platform === "darwin") {
    return "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
  } else if (platform === "win32") {
    return "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
  } else if (platform === "linux") {
    return "/usr/bin/brave-browser"; // May vary
  }

  throw new Error("Unsupported OS");
}

// Get target URL from command line arguments
const targetURL = process.argv[2];

// Validate URL input
if (!targetURL) {
  console.error("❌ Please provide a website URL as an argument.");
  process.exit(1);
}

// Main function using IIFE to analyze page requests
(async () => {
  // Get and validate Brave browser path
  const bravePath = getBravePath();
  if (!fs.existsSync(bravePath)) {
    console.error("❌ Brave browser not found at expected location.");
    process.exit(1);
  }

  // Launch Brave browser in headless mode
  const browser = await puppeteer.launch({
    executablePath: bravePath,
    headless: true,
    args: ["--no-sandbox"],
  });

  // Create new page and initialize request tracking
  const page = await browser.newPage();
  const requests = [];

  // Track all requests made during page load
  page.on("request", (req) => {
    requests.push({
      url: req.url(),
      resourceType: req.resourceType(),
    });
  });

  // Load target URL and wait for network to be idle
  console.log(`🚀 Loading: ${targetURL} with Brave...\n`);
  await page.goto(targetURL, { waitUntil: "networkidle0" });

  // Group requests by resource type and domain
  const grouped = requests.reduce((acc, req) => {
    const type = req.resourceType;
    const domain = new URL(req.url).hostname;

    const key = `${type}:${domain}`;
    acc[key] = acc[key] || { count: 0, type, domain };
    acc[key].count++;
    return acc;
  }, {});

  // Sort requests by count in descending order
  const sorted = Object.values(grouped).sort((a, b) => b.count - a.count);

  // Display request summary
  console.log(`📊 Request Summary:\n`);
  sorted.forEach((item) => {
    console.log(
      `${item.count.toString().padStart(3)} req → [${item.type}] ${item.domain}`
    );
  });

  // Clean up by closing the browser
  await browser.close();
})();
