import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:3001';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const response = await fetch(`${BACKEND_URL}/api/commits?${searchParams}`);
    const data = await response.json();

    if (!response.ok) throw new Error('Backend request failed');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to backend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commits' },
      { status: 500 }
    );
  }
}