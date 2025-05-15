// Required dependency for HTTP requests
const axios = require("axios");

// Function to extract Open Graph image URL from a webpage
async function getOpenGraphImage(url) {
  try {
    // Fetch webpage content
    const response = await axios.get(url);

    // Extract the Open Graph image URL using regex
    const ogImageTag = response.data.match(
      /<meta property="og:image" content="(.*?)">/
    );

    // Return the image URL if found, otherwise null
    return ogImageTag ? ogImageTag[1] : null;
  } catch (error) {
    // Error handling for failed requests
    console.error(`Error fetching ${url}: ${error.message}`);
    return null;
  }
}

// Process multiple URLs concurrently and extract their Open Graph images
async function processUrls(urls) {
  // Use Promise.all to fetch all images in parallel
  const results = await Promise.all(urls.map((url) => getOpenGraphImage(url)));

  // Display results for each URL
  console.log("Results:");
  results.forEach((result, index) => {
    console.log(`URL: ${urls[index]} - Open Graph Image URL: ${result}`);
  });
}

// List of URLs to process
const urlsToProcess = [
  "https://vendee.com.au",
  // Add more URLs here
];

// Start processing the URLs
processUrls(urlsToProcess);
