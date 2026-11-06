import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const path = searchParams.get('path') || '/products';

  const expectedSecret = process.env.REVALIDATION_SECRET || "goodwin_revalidate_secret_2026";
  if (secret !== expectedSecret) {
    return NextResponse.json({ message: 'Invalid revalidation secret token' }, { status: 401 });
  }

  try {
    revalidatePath(path);
    revalidatePath('/');
    return NextResponse.json({ revalidated: true, path, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ message: 'Error revalidating: ' + err.message }, { status: 500 });
  }
}
