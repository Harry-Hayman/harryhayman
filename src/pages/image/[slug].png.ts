import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

/*
 * Per-post Open Graph card.
 * This route shipped from an upstream template and was still rendering another
 * developer's name and domain, plus a remote avatar fetched at build time.
 * It is now Harry Hayman's card, on the light-blue brand, with no external
 * requests during the build.
 */

const dimensions = {
  width: 1200,
  height: 630,
};

interface Props {
  title: string;
  pubDate: Date;
  description: string;
  tags: string[];
}

function sanitizeText(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–|—/g, '-')
    .replace(/[^\x00-\x7F]/g, '');
}

/** Keep long titles from overflowing the card. */
function truncate(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1).trimEnd() + '...';
}

export async function GET(context: APIContext) {
  const { title, pubDate, description } = context.props as Props;
  const date = pubDate.toLocaleDateString('en-US', { dateStyle: 'long' });

  const safeTitle = truncate(sanitizeText(title), 110);
  const safeDescription = truncate(sanitizeText(description), 170);

  const markup = html`
    <div tw="flex flex-col w-full h-full" style="background-color: #0C2438;">
      <div tw="flex w-full" style="height: 12px; background-color: #56A9F2;"></div>

      <div tw="flex flex-col w-full h-full px-16 pt-14 pb-10 justify-between">
        <div tw="flex flex-col">
          <div tw="flex text-2xl" style="color: #8AC6FB; letter-spacing: 3px;">
            HARRYHAYMAN.COM
          </div>
          <div tw="flex text-6xl mt-8 font-bold" style="color: #FFFFFF; line-height: 1.15;">
            ${safeTitle}
          </div>
          <div tw="flex text-2xl mt-6" style="color: #B9DCFF; line-height: 1.45;">
            ${safeDescription}
          </div>
        </div>

        <div tw="flex w-full items-center justify-between pt-8" style="border-top: 1px solid #144875;">
          <div tw="flex items-center">
            <div tw="flex items-center justify-center rounded-full" style="width: 56px; height: 56px; background-color: #1B6FBF; color: #FFFFFF; font-size: 24px;">
              HH
            </div>
            <div tw="flex flex-col ml-5">
              <span tw="text-2xl" style="color: #FFFFFF;">Harry Hayman</span>
              <span tw="text-xl" style="color: #8AC6FB;">Philadelphia hospitality, jazz and community</span>
            </div>
          </div>
          <div tw="flex text-xl" style="color: #8AC6FB;">${date}</div>
        </div>
      </div>
    </div>
  `;

  const fontRegular = fs.readFileSync(
    path.resolve('./node_modules/@fontsource/inter/files/inter-latin-400-normal.woff')
  );
  const fontBold = fs.readFileSync(
    path.resolve('./node_modules/@fontsource/inter/files/inter-latin-700-normal.woff')
  );

  const svg = await satori(markup as any, {
    fonts: [
      { name: 'Inter', data: fontRegular, weight: 400 },
      { name: 'Inter', data: fontBold, weight: 700 },
    ],
    height: dimensions.height,
    width: dimensions.width,
  });

  const image = new Resvg(svg, {
    fitTo: { mode: 'width', value: dimensions.width },
  }).render();

  const png = image.asPng();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': png.length.toString(),
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post: any) => ({
    params: {
      slug: post.slug,
    },
    props: {
      title: sanitizeText(post.data.title),
      pubDate: post.data.pubDate,
      description: sanitizeText(post.data.description),
      tags: (post.data.tags || []).map((t: string) => sanitizeText(t)),
    },
  }));
}
