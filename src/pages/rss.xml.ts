import { getCollection } from "astro:content";
import { SITE, absolute, postPath } from "../lib/paths";

export const prerender = true;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/* Feed readers show a summary, not an essay: some descriptions run long. */
const summary = (value: string) => {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > 400 ? `${clean.slice(0, 399).replace(/\s+\S*$/, "")}…` : clean;
};

/*
 * The newest fifty posts as RSS 2.0, for feed readers and for the services
 * that discover new writing through feeds. Linked from every page's head.
 */
export async function GET() {
  const posts = (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 50);

  const items = posts
    .map((post) => {
      const url = absolute(postPath(post.slug));
      const category = post.data.category
        ? `\n      <category>${escapeXml(post.data.category)}</category>`
        : "";
      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
      <dc:creator>Harry Hayman</dc:creator>${category}
      <description>${escapeXml(summary(post.data.description))}</description>
    </item>`;
    })
    .join("\n");

  const lastBuild = (posts[0]?.data.pubDate ?? new Date()).toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Harry Hayman</title>
    <link>${SITE}/blog/</link>
    <description>Harry Hayman on Philadelphia's restaurants, jazz nights, food security and the people building the city.</description>
    <language>en-us</language>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
