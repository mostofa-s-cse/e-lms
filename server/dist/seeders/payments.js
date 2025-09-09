"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPayments = exports.seedPayments = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const seedPayments = async () => {
    try {
        console.log('🌱 Seeding payments...');
        const users = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            take: 5,
        });
        const enrollments = await prisma.enrollment.findMany({
            include: {
                intake: true,
            },
            take: 10,
        });
        if (users.length === 0 || enrollments.length === 0) {
            console.log('⚠️  No users or enrollments found. Skipping payment seeding.');
            return;
        }
        const paymentMethods = ['SSLCOMMERZ', 'CUSTOM', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_BANKING', 'INTERNET_BANKING', 'CASH', 'OTHER'];
        const paymentStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
        const currencies = ['BDT', 'USD', 'EUR'];
        const payments = [];
        for (let i = 0; i < 20; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomEnrollment = enrollments[Math.floor(Math.random() * enrollments.length)];
            const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
            const randomStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
            const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
            const baseAmount = randomEnrollment.intake?.amount || 1000;
            const amount = baseAmount + Math.random() * 500;
            const payment = {
                userId: randomUser.id,
                enrollmentId: randomEnrollment.id,
                amount: Math.round(amount * 100) / 100,
                currency: randomCurrency,
                status: randomStatus,
                method: randomMethod,
                referenceId: `REF-${Date.now()}-${i}`,
                paidAt: randomStatus === 'COMPLETED' ? new Date() : null,
            };
            payments.push(payment);
        }
        for (const paymentData of payments) {
            await prisma.payment.create({
                data: paymentData,
            });
        }
        console.log(`✅ Seeded ${payments.length} payments successfully`);
    }
    catch (error) {
        console.error('❌ Error seeding payments:', error);
    }
};
exports.seedPayments = seedPayments;
const clearPayments = async () => {
    try {
        console.log('🧹 Clearing payments...');
        await prisma.payment.deleteMany();
        console.log('✅ Payments cleared successfully');
    }
    catch (error) {
        console.error('❌ Error clearing payments:', error);
    }
};
exports.clearPayments = clearPayments;
//# sourceMappingURL=payments.js.map