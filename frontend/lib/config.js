const path = require('path');
const fs = require('fs');

let fileConfig = {};
try {
  const possiblePaths = [
    path.join(process.cwd(), 'college.config.json'),
    path.join(process.cwd(), '..', 'college.config.json'),
    path.join(__dirname, 'college.config.json'),
    path.join(__dirname, '..', 'college.config.json'),
    path.join(__dirname, '..', '..', 'college.config.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      fileConfig = JSON.parse(fs.readFileSync(p, 'utf8'));
      break;
    }
  }
} catch (e) {
  console.warn('[config] Failed to load college.config.json:', e.message);
}

const config = {
  collegeName: process.env.NEXT_PUBLIC_COLLEGE_NAME || fileConfig.collegeName || 'Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga',
  collegeShort: process.env.NEXT_PUBLIC_COLLEGE_SHORT || fileConfig.collegeShort || 'PDUAM',
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || fileConfig.siteName || 'PDUAM NOTIFY',
  noticeUrl: process.env.NEXT_PUBLIC_NOTICE_URL || fileConfig.noticeUrl || 'https://pduamamjonga.ac.in/notice',
  scrapeRowSelector: process.env.SCRAPE_ROW_SELECTOR || fileConfig.scrapeRowSelector || 'li',
  scrapeDateRegex: process.env.SCRAPE_DATE_REGEX || fileConfig.scrapeDateRegex || '^(\\d{4}-\\d{2}-\\d{2})',
};

module.exports = config;
