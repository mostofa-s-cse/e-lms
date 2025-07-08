import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedPayments = async () => {
  try {
    console.log('🌱 Seeding payments...');

    // Get some existing users, courses, intakes, and enrollments
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

    const paymentMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CASH', 'SSLCOMMERZ'];
    const paymentStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
    const currencies = ['BDT', 'USD', 'EUR'];

    const payments = [];

    for (let i = 0; i < 20; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomEnrollment = enrollments[Math.floor(Math.random() * enrollments.length)];
      const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const randomStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];

      // Generate random amount based on intake amount
      const baseAmount = randomEnrollment.intake?.amount || 1000;
      const amount = baseAmount + Math.random() * 500;

      const payment = {
        userId: randomUser.id,
        enrollmentId: randomEnrollment.id,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
        currency: randomCurrency,
        status: randomStatus as 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED',
        method: randomMethod as 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH' | 'SSLCOMMERZ' | 'OTHER',
        referenceId: `REF-${Date.now()}-${i}`,
        paidAt: randomStatus === 'COMPLETED' ? new Date() : null,
      };

      payments.push(payment);
    }

    // Create payments
    for (const paymentData of payments) {
      await prisma.payment.create({
        data: paymentData,
      });
    }

    console.log(`✅ Seeded ${payments.length} payments successfully`);
  } catch (error) {
    console.error('❌ Error seeding payments:', error);
  }
};

export const clearPayments = async () => {
  try {
    console.log('🧹 Clearing payments...');
    await prisma.payment.deleteMany();
    console.log('✅ Payments cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing payments:', error);
  }
}; 