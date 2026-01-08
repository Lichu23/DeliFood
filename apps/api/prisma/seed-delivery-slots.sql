-- SQL Script to add delivery slots for MVP testing
-- Replace 'YOUR_STORE_ID' with your actual store ID before running
-- Example: cmk5oexx00003c54a2afmnk68

-- You can run this with:
-- psql -d your_database_name -f seed-delivery-slots.sql
-- OR copy-paste into your PostgreSQL client

-- Monday - 12:00-15:00
INSERT INTO "DeliverySlot" (id, "storeId", "dayOfWeek", "startTime", "endTime", "maxOrdersPerHour", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'YOUR_STORE_ID', 1, '12:00', '15:00', 10, true, NOW(), NOW());

-- Tuesday - 12:00-15:00 and 19:00-23:00
INSERT INTO "DeliverySlot" (id, "storeId", "dayOfWeek", "startTime", "endTime", "maxOrdersPerHour", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'YOUR_STORE_ID', 2, '12:00', '15:00', 10, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'YOUR_STORE_ID', 2, '19:00', '23:00', 10, true, NOW(), NOW());

-- Wednesday - 12:00-15:00 and 19:00-23:00
INSERT INTO "DeliverySlot" (id, "storeId", "dayOfWeek", "startTime", "endTime", "maxOrdersPerHour", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'YOUR_STORE_ID', 3, '12:00', '15:00', 10, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'YOUR_STORE_ID', 3, '19:00', '23:00', 10, true, NOW(), NOW());

-- Thursday - 12:00-15:00 and 19:00-23:00
INSERT INTO "DeliverySlot" (id, "storeId", "dayOfWeek", "startTime", "endTime", "maxOrdersPerHour", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'YOUR_STORE_ID', 4, '12:00', '15:00', 10, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'YOUR_STORE_ID', 4, '19:00', '23:00', 10, true, NOW(), NOW());

-- Friday - 12:00-15:00 and 19:00-23:00
INSERT INTO "DeliverySlot" (id, "storeId", "dayOfWeek", "startTime", "endTime", "maxOrdersPerHour", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'YOUR_STORE_ID', 5, '12:00', '15:00', 10, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'YOUR_STORE_ID', 5, '19:00', '23:00', 10, true, NOW(), NOW());

-- Saturday - 12:00-23:00
INSERT INTO "DeliverySlot" (id, "storeId", "dayOfWeek", "startTime", "endTime", "maxOrdersPerHour", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'YOUR_STORE_ID', 6, '12:00', '23:00', 10, true, NOW(), NOW());

-- Sunday - 12:00-23:00
INSERT INTO "DeliverySlot" (id, "storeId", "dayOfWeek", "startTime", "endTime", "maxOrdersPerHour", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'YOUR_STORE_ID', 0, '12:00', '23:00', 10, true, NOW(), NOW());

-- Verify inserted slots
SELECT
  "dayOfWeek",
  "startTime",
  "endTime",
  "maxOrdersPerHour",
  "isActive"
FROM "DeliverySlot"
WHERE "storeId" = 'YOUR_STORE_ID'
ORDER BY "dayOfWeek", "startTime";
