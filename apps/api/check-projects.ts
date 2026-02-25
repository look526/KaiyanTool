import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = '62a4aed5-c1a2-4f49-8a4c-92bba80106d6';
  
  const ownedProjects = await prisma.project.count({ where: { ownerId: userId } });
  const memberProjects = await prisma.projectMember.count({ where: { userId } });
  
  console.log('Owned projects:', ownedProjects);
  console.log('Member projects:', memberProjects);
  
  const allProjects = await prisma.project.findMany({ 
    select: { id: true, name: true, ownerId: true } 
  });
  console.log('All projects:', JSON.stringify(allProjects, null, 2));
}

main().then(() => prisma.$disconnect());
