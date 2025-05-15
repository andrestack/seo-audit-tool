// Required dependencies for HTTP requests and HTML parsing
const axios = require("axios");
const cheerio = require("cheerio");

// Get target URL from command line arguments
const targetURL = process.argv[2];

// Validate URL input
if (!targetURL) {
  console.error("❌ Please provide a website URL as an argument.");
  process.exit(1);
}

// Main function using IIFE to check for missing alt text
(async () => {
  try {
    // Fetch webpage content
    const response = await axios.get(targetURL);
    const $ = cheerio.load(response.data);

    // Select all image elements and initialize counter
    const images = $("img");
    let missingAltCount = 0;

    console.log(`🔍 Checking <img> tags on: ${targetURL}\n`);

    // Iterate through each image and check for alt text
    images.each((i, el) => {
      const src = $(el).attr("src") || "[no src]";
      const alt = $(el).attr("alt");

      // Log images with missing or empty alt text
      if (!alt || alt.trim() === "") {
        console.log(`❌ Missing alt: ${src}`);
        missingAltCount++;
      } else {
        console.log(`✅ OK:          ${src}`);
      }
    });

    // Display summary statistics
    console.log(`\n📊 Total images: ${images.length}`);
    console.log(`🚨 Missing alt text: ${missingAltCount}`);
  } catch (error) {
    // Error handling for failed requests
    console.error(`⚠️ Failed to fetch ${targetURL}: ${error.message}`);
  }
})();
