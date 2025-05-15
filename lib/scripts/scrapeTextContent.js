// Required dependencies for HTTP requests and HTML parsing
const axios = require("axios");
const cheerio = require("cheerio");

// Get the target URL from command line arguments
const targetURL = process.argv[2];

// Validate URL input
if (!targetURL) {
  console.error("❌ Please provide a website URL.");
  process.exit(1);
}

// Main scraping function using IIFE (Immediately Invoked Function Expression)
(async () => {
  try {
    // Fetch webpage content
    const response = await axios.get(targetURL);
    // Load HTML content into cheerio for jQuery-like parsing
    const $ = cheerio.load(response.data);

    // Define HTML elements to extract text from
    const elementsToScrape = ["h1", "h2", "h3", "h4", "h5", "h6", "p"];

    // Array to store extracted text with their corresponding HTML tags
    const extractedText = [];

    // Iterate through each HTML element type and extract text
    elementsToScrape.forEach((tag) => {
      $(tag).each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 0) {
          extractedText.push({
            tag,
            text,
          });
        }
      });
    });

    // Output results to console
    console.log(`📋 Text Content Found on ${targetURL}:\n`);
    extractedText.forEach((item) => {
      console.log(`[${item.tag.toUpperCase()}] ${item.text}`);
    });

    // Optional JSON file export functionality (commented out)
    /*
    const fs = require('fs');
    fs.writeFileSync('textContent.json', JSON.stringify(extractedText, null, 2));
    console.log('\n✅ Saved text content to textContent.json');
    */
  } catch (error) {
    // Error handling for failed requests
    console.error(`⚠️ Error fetching the page: ${error.message}`);
  }
})();
