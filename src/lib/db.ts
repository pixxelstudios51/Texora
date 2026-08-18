import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };

// Self-contained Auto-Seeding utility to load premium demo data on startup
export async function ensureSeedData() {
  try {
    const defaultEmail = 'ananya@texora.ai';
    const userExists = await prisma.user.findUnique({
      where: { email: defaultEmail }
    });

    if (userExists) {
      return userExists.id;
    }

    console.log('Seeding default textile designer database...');

    // 1. Create User
    const user = await prisma.user.create({
      data: {
        id: 'default-designer-id',
        name: 'Ananya Sharma',
        email: defaultEmail,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
        role: 'Professional Designer',
        designTypes: 'Saree,Dress Material,Kurti,Dupatta'
      }
    });

    // 2. Subscription
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'PROFESSIONAL',
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
        provider: 'MOCK',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    // 3. Credit Wallet
    await prisma.creditWallet.create({
      data: {
        userId: user.id,
        monthlyCredits: 15,
        purchasedCredits: 5
      }
    });

    // 4. Default Color Palettes
    const palettes = [
      { name: 'Wedding Collection 2026', colors: '#5C0612,#0A3B23,#D4AF37,#F7E7C4,#1A0D00' },
      { name: 'Bridal Crimson & Gold', colors: '#800020,#D4AF37,#FFFDD0,#301934,#E6C280' },
      { name: 'Pastel Sorbet', colors: '#FFD1DC,#FFE5D9,#D8F3DC,#F0E6EF,#FFF2E6' },
      { name: 'Luxury Indigo Zari', colors: '#0B1B3D,#D4AF37,#1D2D50,#FFFDD0,#A370F7' }
    ];

    for (const p of palettes) {
      await prisma.colorPalette.create({
        data: {
          userId: user.id,
          name: p.name,
          colors: p.colors
        }
      });
    }

    // 5. Default Motifs (Saved Library)
    const motifs = [
      { name: 'Royal Paisley (Kalka)', category: 'Paisleys', tags: 'traditional,paisley,zari,border', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300' },
      { name: 'Bridal Lotus Bud', category: 'Flowers', tags: 'lotus,bridal,floral', imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=300' },
      { name: 'Marigold Creeper Petal', category: 'Leaves', tags: 'marigold,creeper,leaf', imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=300' },
      { name: 'Jaipur Elephant Motif', category: 'Traditional', tags: 'rajasthani,elephant,traditional', imageUrl: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&q=80&w=300' },
      { name: 'Zari Border Ribbon', category: 'Borders', tags: 'zari,gold,border', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=300' }
    ];

    for (const m of motifs) {
      await prisma.motif.create({
        data: {
          userId: user.id,
          name: m.name,
          category: m.category,
          tags: m.tags,
          imageUrl: m.imageUrl
        }
      });
    }

    // 6. Default Projects
    const demoProjects = [
      {
        id: 'project-1',
        name: 'Floral Saree Collection',
        productType: 'Saree',
        status: 'In Progress',
        originalImageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'project-2',
        name: 'Paisley Border Design',
        productType: 'Blouse',
        status: 'Ready for Export',
        originalImageUrl: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&q=80&w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'project-3',
        name: 'Traditional Dress Material',
        productType: 'Dress Material',
        status: 'Draft',
        originalImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=300'
      },
      {
        id: 'project-4',
        name: 'Modern Floral Repeat',
        productType: 'Custom Textile',
        status: 'Completed',
        originalImageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=300'
      }
    ];

    for (const proj of demoProjects) {
      const dbProj = await prisma.project.create({
        data: {
          id: proj.id,
          userId: user.id,
          name: proj.name,
          productType: proj.productType,
          status: proj.status,
          originalImageUrl: proj.originalImageUrl,
          thumbnailUrl: proj.thumbnailUrl
        }
      });

      // Seeding layers for Project 1 (Floral Saree Collection)
      if (proj.id === 'project-1') {
        const layers = [
          { name: 'Royal Crimson Silk Base', type: 'background', order: 0, opacity: 1.0, imageUrl: proj.originalImageUrl, visible: true, locked: true },
          { name: 'Traditional Floral Motif 01', type: 'motif', order: 1, opacity: 0.9, imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200', visible: true, locked: false, metadata: JSON.stringify({ x: 150, y: 150, width: 200, height: 200, rotation: 15 }) },
          { name: 'Border Creeper Vine', type: 'artwork', order: 2, opacity: 1.0, imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200', visible: true, locked: false, metadata: JSON.stringify({ x: 50, y: 600, width: 700, height: 120, rotation: 0 }) },
          { name: 'Zari Weave Texture', type: 'texture', order: 3, opacity: 0.35, imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=200', visible: true, locked: false }
        ];

        for (const layer of layers) {
          await prisma.layer.create({
            data: {
              projectId: dbProj.id,
              name: layer.name,
              type: layer.type,
              order: layer.order,
              opacity: layer.opacity,
              imageUrl: layer.imageUrl,
              visible: layer.visible,
              locked: layer.locked,
              metadata: layer.metadata
            }
          });
        }

        // Seeding screen separations for Project 1
        const screens = [
          { name: 'Screen 01 (Crimson Ground)', hex: '#800020', order: 1 },
          { name: 'Screen 02 (Zari Gold Border)', hex: '#D4AF37', order: 2 },
          { name: 'Screen 03 (Lotus Bud Green)', hex: '#0A3B23', order: 3 },
          { name: 'Screen 04 (Petal Ochre)', hex: '#F3C623', order: 4 },
          { name: 'Screen 05 (Contour Black)', hex: '#1E1E1E', order: 5 }
        ];

        for (const s of screens) {
          await prisma.screenSeparation.create({
            data: {
              projectId: dbProj.id,
              colorName: s.name,
              hex: s.hex,
              order: s.order
            }
          });
        }

        // Seeding Project Version
        await prisma.projectVersion.create({
          data: {
            projectId: dbProj.id,
            versionNumber: 1,
            canvasState: JSON.stringify({
              sareeSettings: { length: 5.5, width: 44, border: 4, pallu: 36 },
              items: [
                { id: '1', type: 'motif', src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200', x: 150, y: 150, width: 200, height: 200, rotation: 15, flipX: false, flipY: false },
                { id: '2', type: 'border', src: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200', x: 50, y: 600, width: 700, height: 120, rotation: 0, flipX: false, flipY: false }
              ]
            }),
            previewUrl: proj.thumbnailUrl
          }
        });
      }
    }

    console.log('Seeding completed successfully!');
    return user.id;
  } catch (error) {
    console.error('Failed to seed default database:', error);
    return null;
  }
}
