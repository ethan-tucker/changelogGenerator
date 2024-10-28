import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    console.log(BACKEND_URL);
    const response = await fetch(`${BACKEND_URL}/api/changelogs?${searchParams}`);
    const data = await response.json();

    if (!response.ok) throw new Error('Backend request failed');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching changelogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch changelogs' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/changelogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) throw new Error('Backend request failed');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating changelog:', error);
    return NextResponse.json(
      { error: 'Failed to generate changelog' },
      { status: 500 }
    );
  }
}