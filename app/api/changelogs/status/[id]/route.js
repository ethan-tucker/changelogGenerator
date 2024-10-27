import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:3001';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const response = await fetch(`${BACKEND_URL}/api/changelogs/status/${id}`);
    if (!response.ok) {
      throw new Error('Failed to check changelog status');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error checking changelog status:', error);
    return NextResponse.json(
      { error: 'Failed to check changelog status' },
      { status: 500 }
    );
  }
}