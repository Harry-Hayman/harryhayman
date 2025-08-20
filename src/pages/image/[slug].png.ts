import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

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

// --- Sanitize helper ---
function sanitizeText(input: string): string {
  return input
    .normalize("NFKD")            // Normalize unicode
    .replace(/[’‘]/g, "'")        // curly single quotes → straight
    .replace(/[“”]/g, '"')        // curly double quotes → straight
    .replace(/–|—/g, "-")         // dashes → hyphen
    .replace(/[^\x00-\x7F]/g, ""); // remove non-ascii (optional)
}

export async function GET(context: APIContext) {
  const { title, pubDate, description, tags } = context.props as Props;
  const date = pubDate.toLocaleDateString('en-US', { dateStyle: 'full' });

  // Apply sanitizer
  const safeTitle = sanitizeText(title);
  const safeDescription = sanitizeText(description);
  const safeTags = tags.map((t: string) => sanitizeText(t));

  const markup = html`
    <div tw="bg-zinc-900 flex flex-col w-full h-full rounded-lg overflow-hidden shadow-lg text-white border border-zinc-700/50">

      <div tw="flex flex-col w-full h-4/5 p-10 justify-center">
        <div tw="flex text-zinc-400 text-xl">
          ${date}
        </div>
        <div tw="flex text-6xl mb-4 w-full font-bold leading-snug tracking-tight text-transparent bg-indigo-400" 
             style="background-clip: text; -webkit-background-clip: text; background: linear-gradient(90deg, rgb(87, 57, 249), rgb(98, 203, 242));">
          ${safeTitle}
        </div>
        <div tw="text-zinc-400 text-xl mt-4">${safeDescription}</div>
      </div>

      <div tw="w-full h-1/5 border-t border-zinc-700/50 flex p-10 items-center justify-between text-2xl">
        <div tw="flex items-center">
          <span tw="ml-3 text-zinc-500">cojocarudavid.me</span>
        </div>

        <div tw="flex items-center bg-zinc-800/50 rounded-lg px-4 py-2">
          <img src="https://i.imgur.com/0KpLrT2.png" tw="w-15 h-15" />
          <div tw="flex flex-col ml-4 border-l border-zinc-700/50 pl-4">
            <span tw="text-zinc-400 font-semibold">David Cojocaru</span>
            <span tw="text-zinc-400 text-sm">cojocaru-david</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load fonts
  const fontRegular = fs.readFileSync(
    path.resolve('./node_modules/@fontsource/inter/files/inter-latin-400-normal.woff')
  );
  const fontBold = fs.readFileSync(
    path.resolve('./node_modules/@fontsource/inter/files/inter-latin-700-normal.woff')
  );

  const svg = await satori(markup as any, {
    fonts: [
      {
        name: 'Inter',
        data: fontRegular,
        weight: 400,
      },
      {
        name: 'Inter',
        data: fontBold,
        weight: 700,
      },
    ],
    height: dimensions.height,
    width: dimensions.width,
  });

  const image = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: dimensions.width
    },
  }).render();

  return new Response(image.asPng(), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': image.asPng().length.toString(),
      'Surrogate-Key': safeTags.join(' '),
      'Query-String-Hash': 'image',
      'Cache-Tag': 'image',
      'Keep-Alive': 'timeout=5, max=1000',
      'X-Content-Type-Options': 'nosniff'
    },
  });
}

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  const paths = posts.map((post: any) => ({
    params: {
      slug: post.slug,
    },
    props: {
      title: sanitizeText(post.data.title),
      pubDate: post.data.pubDate,
      description: sanitizeText(post.data.description),
      tags: post.data.tags.map((t: string) => sanitizeText(t)),
    },
  }));
  return paths;
}
