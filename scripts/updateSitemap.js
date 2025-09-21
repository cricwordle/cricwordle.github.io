import fs from "fs";
import path from "path";

// Path to your public folder
const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");

// Current date in YYYY-MM-DD format
const today = new Date().toISOString().split("T")[0];

// Sitemap content
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://cricwordle.github.io/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

// Write the sitemap
fs.writeFileSync(sitemapPath, sitemapContent);
console.log(`✅ Sitemap updated: ${today}`);
