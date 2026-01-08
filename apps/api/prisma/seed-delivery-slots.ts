import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script to add delivery slots for MVP testing
 * Usage: npx tsx prisma/seed-delivery-slots.ts <STORE_ID>
 */

const STORE_ID = process.argv[2];

if (!STORE_ID) {
  console.error('❌ Error: Store ID is required');
  console.log('Usage: npx tsx prisma/seed-delivery-slots.ts <STORE_ID>');
  console.log('Example: npx tsx prisma/seed-delivery-slots.ts cmk5oexx00003c54a2afmnk68');
  process.exit(1);
}

async function main() {
  console.log(`\n🌱 Seeding delivery slots for store: ${STORE_ID}\n`);

  // Check if store exists
  const store = await prisma.store.findUnique({
    where: { id: STORE_ID },
  });

  if (!store) {
    console.error(`❌ Store with ID "${STORE_ID}" not found`);
    process.exit(1);
  }

  console.log(`✓ Store found: ${store?.name}\n`);

  const slots = [
    // Monday - 12:00-15:00
    { dayOfWeek: 1, startTime: '12:00', endTime: '15:00', maxOrdersPerHour: 10 },

    // Tuesday - 12:00-15:00 and 19:00-23:00
    { dayOfWeek: 2, startTime: '12:00', endTime: '15:00', maxOrdersPerHour: 10 },
    { dayOfWeek: 2, startTime: '19:00', endTime: '23:00', maxOrdersPerHour: 10 },

    // Wednesday - 12:00-15:00 and 19:00-23:00
    { dayOfWeek: 3, startTime: '12:00', endTime: '15:00', maxOrdersPerHour: 10 },
    { dayOfWeek: 3, startTime: '19:00', endTime: '23:00', maxOrdersPerHour: 10 },

    // Thursday - 12:00-15:00 and 19:00-23:00
    { dayOfWeek: 4, startTime: '12:00', endTime: '15:00', maxOrdersPerHour: 10 },
    { dayOfWeek: 4, startTime: '19:00', endTime: '23:00', maxOrdersPerHour: 10 },

    // Friday - 12:00-15:00 and 19:00-23:00
    { dayOfWeek: 5, startTime: '12:00', endTime: '15:00', maxOrdersPerHour: 10 },
    { dayOfWeek: 5, startTime: '19:00', endTime: '23:00', maxOrdersPerHour: 10 },

    // Saturday - 12:00-23:00
    { dayOfWeek: 6, startTime: '12:00', endTime: '23:00', maxOrdersPerHour: 10 },

    // Sunday - 12:00-23:00
    { dayOfWeek: 0, startTime: '12:00', endTime: '23:00', maxOrdersPerHour: 10 },
  ];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let successCount = 0;
  let errorCount = 0;

  for (const slot of slots) {
    const dayName = dayNames[slot.dayOfWeek];
    try {
      const created = await prisma.deliverySlot.create({
        data: {
          storeId: STORE_ID,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          maxOrdersPerHour: slot.maxOrdersPerHour,
          isActive: true,
        },
      });

      console.log(`✓ ${dayName} ${slot.startTime}-${slot.endTime} (ID: ${created.id})`);
      successCount++;
    } catch (error) {
      console.error(`✗ ${dayName} ${slot.startTime}-${slot.endTime}`);
      console.error(`  Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n==========================================');
  console.log(`✓ Successfully created: ${successCount} slots`);
  if (errorCount > 0) {
    console.log(`✗ Errors: ${errorCount} slots`);
  }
  console.log('==========================================\n');
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
