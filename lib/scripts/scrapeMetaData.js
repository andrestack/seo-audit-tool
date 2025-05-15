const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeMetaData(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content')?.trim() || '';

    return {
      url,
      title,
      description,
      titleLength: title.length,
      descriptionLength: description.length
    };
  } catch (error) {
    return {
      url,
      error: `Failed to fetch metadata: ${error.message}`
    };
  }
}

module.exports = scrapeMetaData;


if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error('❌ Please provide a URL.');
    process.exit(1);
  }

  scrapeMetaData(url).then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}
