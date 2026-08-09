import { getCollection } from "astro:content";

export const prerender = true;

const SITE = "https://harryhayman.com";

/** One markdown link line in llms.txt format: `- [name](url): description` */
function link(name: string, url: string, description: string) {
  const clean = description.replace(/\s+/g, " ").trim();
  return `- [${name}](${url}): ${clean}`;
}

export async function GET() {
  const posts = (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const categories = [...new Set(posts.map((post) => post.data.category))]
    .filter((category): category is string => typeof category === "string")
    .sort((a, b) => a.localeCompare(b));

  const recent = posts.slice(0, 25);
  const rest = posts.slice(25);

  const content = `# Harry Hayman

> Harry Hayman, in full Harrison Graham Hayman IV, is a Philadelphia hospitality entrepreneur, jazz advocate and philanthropist. He is CEO of Gemini Hospitality Consultants and a Senior Fellow at The Economy League of Greater Philadelphia, and he founded the Feed Philly Coalition, The Philadelphia Jazz Experience, Harry Hayman Creative, Veggie Graffiti, Another Three Hearts Experience and I Am Hungry in Philly.

Harry Hayman started in hospitality at 17 as a dishwasher in Washington, DC, founded Presto! Design at 19, and studied International Business and Finance at The American University before being accepted to the Wharton School of Business. In Philadelphia he has operated rooms including McFadden's and SOUTH Jazz Club with the Bynum Hospitality Group. This site is his personal site: a biography, a directory of his ventures, and a blog covering Philadelphia restaurants, jazz nights, food security and community life. Based in Philadelphia, Pennsylvania, United States.

## Core pages

${link("Home", `${SITE}/`, "Overview of Harry Hayman's work across Philadelphia hospitality, jazz and community initiatives")}
${link("About Harry Hayman", `${SITE}/about`, "Biography: early career, professional journey through the 1990s and 2000s, current ventures, speaking engagements, board roles and personal values")}
${link("Ventures and Initiatives", `${SITE}/ventures`, "Directory of the eight organisations Harry Hayman founded or leads, each with its website and social profiles")}
${link("Blog", `${SITE}/blog`, `All ${posts.length} posts, plus an index of the Philadelphia places covered on the blog`)}
${link("Contact", `${SITE}/contact`, "Contact form and social profiles for consulting, speaking and collaboration enquiries")}

## Ventures

${link("Gemini Hospitality Consultants", "https://harryhaymangemini.com/", "Strategic consulting for restaurants and hospitality businesses; Harry Hayman is CEO")}
${link("Philadelphia Jazz Experience", "https://philadelphiajazzexperience.org", "Preserving and promoting Philadelphia's jazz heritage through education, performance and community engagement")}
${link("Feed Philly Coalition", "https://feedphillycoalition.org", "Community initiative addressing food insecurity through partnerships with local restaurants and organisations")}
${link("Veggie Graffiti", "https://veggiegraffiti.com", "Urban farming initiative combining hydroponic technology with sustainable practices")}
${link("Harry Hayman Creative", "https://harryhaymancreative.com/", "Creative agency for branding, marketing and digital work with hospitality and lifestyle businesses")}
${link("I Am Hungry in Philly", "https://iamhungryinphilly.org", "Connecting Philadelphia's food-insecure residents with local food resources and support services")}
${link("Another Three Hearts Experience", "https://another3heartsexperience.com/", "Film and hospitality experiences combining culinary excellence with cultural enrichment")}

## Blog topics

${categories
  .map((category) =>
    link(
      category,
      `${SITE}/blog/category/${encodeURIComponent(category)}`,
      `Posts filed under ${category}`,
    ),
  )
  .join("\n")}

## Recent writing

${recent
  .map((post) =>
    link(post.data.title, `${SITE}/blog/${post.slug}`, post.data.description),
  )
  .join("\n")}

## Elsewhere

${link("LinkedIn", "https://www.linkedin.com/in/harrisongrahamhaymaniv/", "Professional profile")}
${link("Instagram", "https://www.instagram.com/harryhayman4", "Day to day photography from Philadelphia")}
${link("X", "https://x.com/HGHayman", "Short posts and links")}
${link("Facebook", "https://www.facebook.com/HaymanHG/", "Public page")}
${link("Threads", "https://www.threads.com/@harryhayman4", "Short posts")}
${link("Bluesky", "https://bsky.app/profile/harryhayman.bsky.social", "Short posts")}
${link("YouTube", "https://www.youtube.com/@harryhayman1467/shorts", "Short video")}
${link("Pinterest", "https://www.pinterest.com/hghayman1/", "Visual collections")}

## Optional

${link("Sitemap", `${SITE}/sitemap-index.xml`, "Machine readable index of every page on the site")}
${rest
  .map((post) =>
    link(post.data.title, `${SITE}/blog/${post.slug}`, post.data.description),
  )
  .join("\n")}
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
