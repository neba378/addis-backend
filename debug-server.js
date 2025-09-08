const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
   
    
    // Test basic connection
    await prisma.$connect();
   
    
    // Test admin query
    const adminCount = await prisma.admin.count();
   
    
    // Test user query
    const userCount = await prisma.user.count();
   
    
    // Test refresh token query
    const tokenCount = await prisma.refreshToken.count();
    
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 