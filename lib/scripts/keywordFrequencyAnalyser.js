const axios = require("axios");
const cheerio = require("cheerio");

function cleanAndTokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .split(/\s+/)
    .filter((word) => word.length > 2); // filter out very short/empty words
}

async function keywordFrequencyAnalyzer(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const contentTags = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "li"];
    let fullText = "";

    contentTags.forEach((tag) => {
      $(tag).each((_, el) => {
        fullText += $(el).text() + " ";
      });
    });

    const words = cleanAndTokenize(fullText);
    const frequency = {};

    words.forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    const sorted = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => ({ word, count }));

    return {
      url,
      topKeywords: sorted.slice(0, 20),
    };
  } catch (error) {
    return {
      url,
      error: `Failed to analyze keyword frequency: ${error.message}`,
    };
  }
}

module.exports = keywordFrequencyAnalyzer;

if (require.main === module) {
    const url = process.argv[2];
    if (!url) {
      console.error('❌ Please provide a URL.');
      process.exit(1);
    }
  
    keywordFrequencyAnalyzer(url).then(result => {
      if (result.error) {
        console.error('⚠️ ' + result.error);
        return;
      }
  
      console.log(`\n🔑 Top Keywords for ${result.url}:`);
      result.topKeywords.forEach(k =>
        console.log(`${k.word}: ${k.count}`)
      );
    });
  }
  
