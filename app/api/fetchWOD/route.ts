import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateCode = searchParams.get('dateCode');
  const url = `https://www.crossfit.com/${dateCode}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch CrossFit page.' }, { status: response.status });
    }
    const text = await response.text();

    // Return the HTML as JSON
    return NextResponse.json({ html: text });
  } catch (err) {
    console.error('Error fetching CrossFit.com page:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
