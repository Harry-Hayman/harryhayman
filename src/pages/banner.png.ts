import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';

/*
 * Site-wide Open Graph card.
 * Every page referenced /banner.png in its og:image and twitter:image, but the
 * file did not exist, so every social preview resolved to a 404. This route
 * generates it at build time from the same brand system as the per-post cards.
 */

export const prerender = true;

const dimensions = {
  width: 1200,
  height: 630,
};

export async function GET() {
  const markup = html`
    <div tw="flex flex-col w-full h-full" style="background-color: #0C2438;">
      <div tw="flex w-full" style="height: 12px; background-color: #56A9F2;"></div>

      <div tw="flex flex-col w-full h-full px-20 justify-center">
        <div tw="flex text-2xl" style="color: #8AC6FB; letter-spacing: 4px;">
          PHILADELPHIA, PENNSYLVANIA
        </div>
        <div tw="flex text-8xl mt-6 font-bold" style="color: #FFFFFF; line-height: 1.05;">
          Harry Hayman
        </div>
        <div tw="flex text-3xl mt-8" style="color: #B9DCFF; line-height: 1.4;">
          Hospitality entrepreneur, jazz advocate and philanthropist.
        </div>
        <div tw="flex text-2xl mt-10" style="color: #8AC6FB;">
          harryhayman.com
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

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: dimensions.width },
  })
    .render()
    .asPng();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=604800',
      'Content-Length': png.length.toString(),
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
