import { NextRequest, NextResponse } from 'next/server';

function getFileType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const typeMap: { [key: string]: string } = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'php': 'php',
    'py': 'python',
    'rb': 'ruby',
    'java': 'java',
    'css': 'css',
    'html': 'html',
    'json': 'json',
    'md': 'markdown',
  };
  return typeMap[ext || ''] || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubUrl, projectName } = body;

    // Validation
    if (!githubUrl || !projectName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate GitHub URL format
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubRegex.test(githubUrl)) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format' },
        { status: 400 }
      );
    }

    // Extract owner and repo from GitHub URL
    const urlParts = githubUrl.replace(/\/$/, '').split('/');
    const owner = urlParts[urlParts.length - 2];
    const repo = urlParts[urlParts.length - 1];

    // Fetch repository contents from GitHub API
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Necro-AI-App',
        },
      });

      if (!response.ok) {
        // Try 'master' branch if 'main' doesn't exist
        const masterResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Necro-AI-App',
            },
          }
        );

        if (!masterResponse.ok) {
          throw new Error('Failed to fetch repository contents');
        }

        const data = await masterResponse.json();
        const files = data.tree
          .filter((item: any) => item.type === 'blob')
          .map((item: any) => ({
            path: item.path,
            type: getFileType(item.path),
            size: item.size || 0,
            sha: item.sha,
            url: item.url,
          }));

        return NextResponse.json({
          filesFound: files.length,
          files,
          projectName,
          clonedAt: new Date().toISOString(),
          owner,
          repo,
        });
      }

      const data = await response.json();
      const files = data.tree
        .filter((item: any) => item.type === 'blob')
        .map((item: any) => ({
          path: item.path,
          type: getFileType(item.path),
          size: item.size || 0,
          sha: item.sha,
          url: item.url,
        }));

      return NextResponse.json({
        filesFound: files.length,
        files,
        projectName,
        clonedAt: new Date().toISOString(),
        owner,
        repo,
      });
    } catch (fetchError) {
      console.error('GitHub API error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch repository from GitHub. Please check the URL and try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Clone error:', error);
    return NextResponse.json(
      { error: 'Failed to clone repository' },
      { status: 500 }
    );
  }
}
