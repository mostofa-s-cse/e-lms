"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUserProfiles = seedUserProfiles;
async function seedUserProfiles(prisma) {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true }
    });
    const profileData = users.map((user, index) => ({
        userId: user.id,
        phone: `+880-1${String(index + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900000) + 100000)}`,
        address: `${1000 + index} ${user.role === 'ADMIN' ? 'Admin' : user.role === 'TEACHER' ? 'Faculty' : 'Student'} Road`,
        city: index % 3 === 0 ? 'Dhaka' : index % 3 === 1 ? 'Chittagong' : 'Sylhet',
        state: 'Bangladesh',
        profilePicture: `/uploads/profile/default-${index + 1}.jpg`
    }));
    const profiles = await Promise.all(profileData.map(data => prisma.userProfile.create({ data })));
    console.log(`✅ Created ${profiles.length} user profiles`);
    return profiles;
}
//# sourceMappingURL=userProfiles.js.map