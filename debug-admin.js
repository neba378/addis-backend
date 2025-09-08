const { PrismaClient } = require('@prisma/client');

async function checkAdmins() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking all admins in database...');
    
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        createdAt: true
      }
    });
    
   
    
  } catch (error) {
    console.error('❌ Error checking admins:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins(); 