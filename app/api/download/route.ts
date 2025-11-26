import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing project ID' },
        { status: 400 }
      );
    }

    // In a real app, this would:
    // 1. Fetch the generated code from database/storage
    // 2. Create a ZIP file with all modernized files
    // 3. Return the ZIP as a download

    // For demo purposes, create a simple text file
    const mockContent = `# Modernized Code Package
Project ID: ${projectId}

This is a demo download. In production, this would be a ZIP file containing:
- All modernized source files
- Updated package.json with modern dependencies
- Migration guide
- Test files
- README with setup instructions

Generated at: ${new Date().toISOString()}
`;

    // Create a blob response
    const blob = new Blob([mockContent], { type: 'text/plain' });
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="modernized-code-${projectId}.zip"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download code' },
      { status: 500 }
    );
  }
}
