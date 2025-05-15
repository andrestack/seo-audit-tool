// Required dependencies for HTTP requests, HTML parsing, and URL handling
const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");

// Get target URL from command line arguments
const targetURL = process.argv[2];

// Validate URL input
if (!targetURL) {
  console.error("❌ Please provide a website URL as an argument.");
  process.exit(1);
}

// Function to extract and normalize all links from a webpage
async function getLinksFromPage(url) {
  try {
    // Fetch webpage content
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const links = [];

    // Extract all anchor tags with href attributes
    $("a[href]").each((_, element) => {
      const href = $(element).attr("href");
      // Filter out javascript: links and anchor links
      if (href && !href.startsWith("javascript:") && !href.startsWith("#")) {
        // Resolve relative URLs to absolute URLs
        const resolvedUrl = new URL(href, url).href;
        links.push(resolvedUrl);
      }
    });

    // Remove duplicate links and return
    return Array.from(new Set(links));
  } catch (error) {
    // Error handling for failed requests
    console.error(`⚠️ Failed to fetch ${url}: ${error.message}`);
    return [];
  }
}

// Function to check if a link is valid (returns status code < 400)
async function checkLink(url) {
  try {
    // Attempt HEAD request with timeout
    const response = await axios.head(url, { timeout: 5000 });
    return response.status < 400;
  } catch {
    return false;
  }
}

// Main function using IIFE to check for broken links
(async () => {
  console.log(`🔍 Checking for broken links on: ${targetURL}\n`);
  const links = await getLinksFromPage(targetURL);

  // Check all links concurrently and log results
  const checkPromises = links.map(async (link) => {
    const isValid = await checkLink(link);
    if (!isValid) {
      console.log(`❌ Broken: ${link}`);
    } else {
      console.log(`✅ OK:     ${link}`);
    }
  });

  // Wait for all link checks to complete
  await Promise.all(checkPromises);
})();
