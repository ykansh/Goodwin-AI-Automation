import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/data';
import { renderToStream } from '@react-pdf/renderer';
import ProductDatasheetPDF from '@/components/pdf/ProductDatasheetPDF';
import path from 'path';

import React from 'react';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    // React-pdf needs absolute paths to local images for reliable rendering in Node
    const logoPath = path.join(process.cwd(), 'public', 'assets', 'logo', 'Goodwin.png');
    // Ensure image is valid (if it starts with / it's in public folder)
    const imagePath = product.image.startsWith('/') 
      ? path.join(process.cwd(), 'public', product.image)
      : product.image;

    // Render the PDF to a Node.js stream
    const stream = await renderToStream(
      React.createElement(ProductDatasheetPDF, { product, logoPath, imagePath }) as any
    );

    // Convert the stream to a Web ReadableStream for Next.js response
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
    });

    // Check if the user requested a download
    const url = new URL(request.url);
    const download = url.searchParams.get('download') === 'true';

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    
    if (download) {
      headers.set('Content-Disposition', `attachment; filename="${product.slug}-datasheet.pdf"`);
    } else {
      headers.set('Content-Disposition', `inline; filename="${product.slug}-datasheet.pdf"`);
    }

    return new NextResponse(webStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse('Internal Server Error while generating PDF', { status: 500 });
  }
}
