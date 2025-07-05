import { PrismaClient } from '@prisma/client';

export async function seedUserProfiles(prisma: PrismaClient) {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true }
  });

  const profileData = users.map((user, index) => ({
    userId: user.id,
    phone: `+1-555-${String(index + 1).padStart(4, '0')}`,
    address: `${1000 + index} ${user.role === 'ADMIN' ? 'Admin' : user.role === 'TEACHER' ? 'Faculty' : 'Student'} St`,
    city: index % 2 === 0 ? 'Boston' : 'Cambridge',
    state: 'MA',
    profilePicture: `/uploads/profile/default-${index + 1}.jpg`
  }));

  const profiles = await Promise.all(
    profileData.map(data => 
      prisma.userProfile.create({ data })
    )
  );

  console.log(`✅ Created ${profiles.length} user profiles`);
  return profiles;
} 