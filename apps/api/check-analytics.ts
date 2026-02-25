import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = '62a4aed5-c1a2-4f49-8a4c-92bba80106d6';
  
  const now = new Date();
  
  const ownedProjects = await prisma.project.count({ where: { ownerId: userId } });
  const memberProjects = await prisma.projectMember.count({ where: { userId } });
  
  console.log('Owned projects:', ownedProjects);
  console.log('Member projects:', memberProjects);
  
  const topProjects = await prisma.project.findMany({
    where: { ownerId: userId },
    take: 5,
    select: {
      id: true,
      name: true,
      _count: { select: { documents: true } }
    }
  });
  
  console.log('Top projects:', JSON.stringify(topProjects, null, 2));
}

main().then(() => prisma.$disconnect());
