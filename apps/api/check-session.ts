import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sessionToken = '63f861c9b361d20bedb9465da95f04cd7d85c53f42f44e9fcea55c74cda6ceae';
  
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true }
  });
  
  if (session) {
    console.log('Session found:');
    console.log('  userId:', session.user_id);
    console.log('  token:', session.token);
    console.log('  expiresAt:', session.expires_at);
    if (session.user) {
      console.log('  user.id:', session.user.id);
      console.log('  user.name:', session.user.name);
      console.log('  user.email:', session.user.email);
    }
  } else {
    console.log('Session not found');
  }
}

main().then(() => prisma.$disconnect());
