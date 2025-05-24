import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ success: false, error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Send to your custom endpoint
    const response = await fetch('https://your-custom-endpoint.com/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: buffer,
    });

    if (!response.ok) {
      console.error(`Custom endpoint returned error: ${response.statusText}`);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    const data = await response.json();

    // Expecting { success: true } or { success: false }
    return NextResponse.json({ success: data.success });
  } catch (error) {
    console.error('Error forwarding PDF:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}