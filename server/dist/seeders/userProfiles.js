"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUserProfiles = seedUserProfiles;
async function seedUserProfiles(prisma) {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true }
    });
    const profileData = users.map((user, index) => ({
        userId: user.id,
        phone: `+1-555-${String(index + 1).padStart(4, '0')}`,
        address: `${1000 + index} ${user.role === 'ADMIN' ? 'Admin' : user.role === 'TEACHER' ? 'Faculty' : 'Student'} St`,
        city: index % 2 === 0 ? 'Boston' : 'Cambridge',
        state: 'MA',
        profilePicture: `https://images.unsplash.com/photo-${1500000000000 + index}?w=150&h=150&fit=crop&crop=face`
    }));
    const profiles = await Promise.all(profileData.map(data => prisma.userProfile.create({ data })));
    console.log(`✅ Created ${profiles.length} user profiles`);
    return profiles;
}
//# sourceMappingURL=userProfiles.js.map