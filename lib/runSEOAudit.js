import fs from 'fs';
import path from 'path';

// Import all modules
import checkBrokenLinks from './checkBrokenLinks';
import checkMissingAltText from './checkMissingAltText';
import checkHeavyRequestElements from './checkHeavyRequestElements';
import scrapeMetaData from './scrapeMetaData';
import keywordFrequencyAnalyzer from './keywordFrequencyAnalyzer';
import headingStructureChecker from './headingStructureChecker';

const url = process.argv[2];
if (!url) {
  console.error('❌ Please provide a URL as an argument.');
  process.exit(1);
}

(async () => {
  console.log(`\n🚀 Running SEO Audit for: ${url}\n`);

  const [
    brokenLinks,
    missingAlts,
    heavyRequests,
    metaData,
    keywordFreq,
    headingStructure
  ] = await Promise.all([
    checkBrokenLinks(url),
    checkMissingAltText(url),
    checkHeavyRequestElements(url),
    scrapeMetaData(url),
    keywordFrequencyAnalyzer(url),
    headingStructureChecker(url)
  ]);

  const auditResult = {
    url,
    timestamp: new Date().toISOString(),
    metaData,
    keywordFrequency: keywordFreq.topKeywords,
    headingStructure,
    brokenLinks,
    missingAltTextImages: missingAlts,
    heavyRequests
  };

  const outFile = path.join(__dirname, 'audit-' + new Date().toISOString().split('T')[0] + '.json');
  fs.writeFileSync(outFile, JSON.stringify(auditResult, null, 2));

  console.log('\n✅ Audit complete!');
  console.log(`📄 Results saved to: ${outFile}\n`);

  // Optional: log a simple human-friendly summary
  console.log(`📝 Summary:
  - Title: ${metaData.title} (${metaData.titleLength} chars)
  - Meta Description: ${metaData.descriptionLength ? 'Present' : 'Missing'}
  - H1s: ${headingStructure.headings.filter(h => h.tag === 'h1').length}
  - Broken Links: ${brokenLinks.length}
  - Images Missing ALT: ${missingAlts.length}
  - Top Keywords: ${keywordFreq.topKeywords.slice(0, 5).map(k => k.word).join(', ')}
  `);
})();
