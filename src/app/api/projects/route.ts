import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, productType, imageUrl } = body;

    if (!name || !productType || !imageUrl) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create the project
    const project = await prisma.project.create({
      data: {
        userId,
        name,
        productType,
        status: 'In Progress',
        originalImageUrl: imageUrl,
        thumbnailUrl: imageUrl
      }
    });

    // 2. Prepopulate layers
    const layers = [
      {
        projectId: project.id,
        name: `${productType} Original Reference`,
        type: 'background',
        order: 0,
        opacity: 1.0,
        imageUrl: imageUrl,
        visible: true,
        locked: true
      },
      {
        projectId: project.id,
        name: 'AI Extracted Main Motifs',
        type: 'motif',
        order: 1,
        opacity: 1.0,
        imageUrl: imageUrl, // Can filter visual masks on client
        visible: true,
        locked: false,
        metadata: JSON.stringify({ x: 0, y: 0, width: 600, height: 600, rotation: 0 })
      },
      {
        projectId: project.id,
        name: 'AI Separated Background Texture',
        type: 'texture',
        order: 2,
        opacity: 0.3,
        imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=200',
        visible: true,
        locked: false
      }
    ];

    for (const layer of layers) {
      await prisma.layer.create({
        data: layer
      });
    }

    // 3. Prepopulate default screen separations (6 screens for starting project)
    const screens = [
      { colorName: 'Base Ground', hex: '#800020', order: 1 },
      { colorName: 'Accent Golden Zari', hex: '#D4AF37', order: 2 },
      { colorName: 'Contrast Forest Green', hex: '#0A3B23', order: 3 },
      { colorName: 'Accent Haldi Yellow', hex: '#F3C623', order: 4 },
      { colorName: 'Indigo Contour Shading', hex: '#1A5F7A', order: 5 },
      { colorName: 'Line Black Outline', hex: '#1E1E1E', order: 6 }
    ];

    for (const s of screens) {
      await prisma.screenSeparation.create({
        data: {
          projectId: project.id,
          colorName: s.colorName,
          hex: s.hex,
          order: s.order
        }
      });
    }

    // 4. Save V1 Version
    await prisma.projectVersion.create({
      data: {
        projectId: project.id,
        versionNumber: 1,
        canvasState: JSON.stringify({
          sareeSettings: { length: 5.5, width: 44, border: 4, pallu: 36 },
          items: [
            { id: '1', type: 'motif', src: imageUrl, x: 100, y: 100, width: 400, height: 400, rotation: 0, flipX: false, flipY: false }
          ]
        }),
        previewUrl: imageUrl
      }
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error('Create Project API Error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
