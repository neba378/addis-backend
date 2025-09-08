import { prisma } from '../prisma/client';

/**
 * Seed the database with sample data for development
 */
export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if arbitrators already exist
    const existingArbitrators = await prisma.arbitrator.count();
    if (existingArbitrators > 0) {
      console.log('📊 Database already has arbitrators, skipping seed...');
      return;
    }

    console.log('👥 Creating sample arbitrators...');

    // Create sample arbitrators
    const sampleArbitrators = [
      {
        fullName: 'Ato Alemayehu Tadesse',
        profilePicture: '/uploads/profile-pictures/arbitrator-1.jpg',
        location: 'Addis Ababa',
        languages: JSON.stringify(['Amharic', 'English']),
        specializationAreas: JSON.stringify(['Family Disputes', 'Property Rights', 'Commercial Disputes']),
        yearsOfExperience: 25,
        description: 'A respected elder with 25 years of experience in traditional arbitration, specializing in family and property matters. Known for his wisdom and fair judgment in resolving complex community disputes.',
        isActive: true,
      },
      {
        fullName: 'Weizero Almaz Bekele',
        profilePicture: '/uploads/profile-pictures/arbitrator-2.jpg',
        location: 'Bahir Dar',
        languages: JSON.stringify(['Amharic', 'Awi', 'English']),
        specializationAreas: JSON.stringify(['Commercial Disputes', 'Community Relations', 'Land Disputes']),
        yearsOfExperience: 18,
        description: 'Highly regarded Shimagile known for her wisdom in resolving business conflicts and community disputes. Specializes in commercial matters and has extensive experience in the Amhara region.',
        isActive: true,
      },
      {
        fullName: 'Ato Girma Wolde',
        profilePicture: '/uploads/profile-pictures/arbitrator-3.jpg',
        location: 'Gondar',
        languages: JSON.stringify(['Amharic', 'Tigrinya', 'English']),
        specializationAreas: JSON.stringify(['Land Disputes', 'Inheritance', 'Family Disputes']),
        yearsOfExperience: 30,
        description: 'Traditional leader with deep knowledge of customary land laws and inheritance practices across northern Ethiopia. Respected for his expertise in complex property and family matters.',
        isActive: true,
      },
      {
        fullName: 'Weizero Tigist Haile',
        profilePicture: '/uploads/profile-pictures/arbitrator-4.jpg',
        location: 'Jimma',
        languages: JSON.stringify(['Oromo', 'Amharic', 'English']),
        specializationAreas: JSON.stringify(['Family Disputes', 'Marriage Counseling', 'Community Relations']),
        yearsOfExperience: 22,
        description: 'Compassionate elder specializing in family mediation and marriage counseling within Oromo communities. Known for her gentle approach and deep understanding of cultural traditions.',
        isActive: true,
      },
      {
        fullName: 'Ato Dawit Mekonnen',
        profilePicture: '/uploads/profile-pictures/arbitrator-5.jpg',
        location: 'Mekelle',
        languages: JSON.stringify(['Tigrinya', 'Amharic', 'English']),
        specializationAreas: JSON.stringify(['Commercial Disputes', 'Labor Relations', 'Property Rights']),
        yearsOfExperience: 20,
        description: 'Experienced arbitrator in commercial and labor disputes, serving the Tigray region with distinction. Specializes in business conflicts and workplace issues.',
        isActive: true,
      },
      {
        fullName: 'Weizero Selamawit Assefa',
        profilePicture: '/uploads/profile-pictures/arbitrator-6.jpg',
        location: 'Hawassa',
        languages: JSON.stringify(['Sidamo', 'Amharic', 'English']),
        specializationAreas: JSON.stringify(['Community Relations', 'Property Rights', 'Family Disputes']),
        yearsOfExperience: 16,
        description: 'Respected community leader known for her fair and thoughtful approach to property and community disputes. Deeply connected to the Sidama community traditions.',
        isActive: true,
      },
    ];

    const createdArbitrators = await prisma.arbitrator.createMany({
      data: sampleArbitrators,
    });

    console.log(`✅ Successfully created ${createdArbitrators.count} arbitrators`);

    // Create sample arbitration requests
    console.log('📝 Creating sample arbitration requests...');
    
    const sampleRequests = [
      {
        fullName: 'Ato Kebede Tesfaye',
        phoneNumber: '0912345678',
        emailAddress: 'kebede.tesfaye@email.com',
        location: 'Addis Ababa',
        preferredLanguages: JSON.stringify(['Amharic', 'English']),
        typeOfDispute: 'Family Dispute',
        disputeSummary: 'Disagreement over inheritance distribution among siblings. Father passed away without a clear will, leading to conflicts over property division and family business ownership.',
        status: 'PENDING' as const,
      },
      {
        fullName: 'Weizero Fatima Ahmed',
        phoneNumber: '0923456789',
        emailAddress: 'fatima.ahmed@email.com',
        location: 'Dire Dawa',
        preferredLanguages: JSON.stringify(['Somali', 'Amharic']),
        typeOfDispute: 'Land Dispute',
        disputeSummary: 'Boundary dispute with neighbor over shared land. Both parties claim ownership of a 2-meter strip of land that affects access to our property.',
        status: 'ASSIGNED' as const,
      },
    ];

    const createdRequests = await prisma.arbitrationRequest.createMany({
      data: sampleRequests,
    });

    console.log(`✅ Successfully created ${createdRequests.count} arbitration requests`);

    console.log('🎉 Database seeding completed!');
    console.log('📊 Sample data includes:');
    console.log(`   - ${createdArbitrators.count} arbitrators`);
    console.log(`   - ${createdRequests.count} arbitration requests`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 