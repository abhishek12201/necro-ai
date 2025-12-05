import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, analysis, batch } = body;

    if (!projectName || !analysis) {
      return NextResponse.json(
        { error: 'Missing required fields: projectName and analysis' },
        { status: 400 }
      );
    }

    // Return the payload unchanged for now
    // This endpoint standardizes the shape for report generation
    const reportPayload = {
      projectName,
      analysis,
      batch: batch || null,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(reportPayload);
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

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
