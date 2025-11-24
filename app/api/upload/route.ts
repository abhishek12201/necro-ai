import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, filename, projectName } = body;

    // Validation
    if (!code || !filename || !projectName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real app, you would save this to a database
    // For now, we'll just return a mock upload ID
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      id: uploadId,
      filename,
      projectName,
      uploadedAt: new Date().toISOString(),
      status: 'success',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload code' },
      { status: 500 }
    );
  }
}
