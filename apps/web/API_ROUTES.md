# DeliFood API Documentation - Frontend Guide

**Base URL:** `http://localhost:4000`
**Version:** 1.1
**Last Updated:** 2026-01-07 (Phase 5 Complete)

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Public Routes](#public-routes)
3. [Protected Routes](#protected-routes)
   - [Auth & Profile](#auth--profile)
   - [Stores](#stores)
   - [Orders](#orders)
   - [Products](#products)
   - [Categories](#categories)
   - [Delivery Zones](#delivery-zones)
   - [Delivery Slots](#delivery-slots)
   - [Blocked Dates](#blocked-dates)
   - [Team Invitations](#team-invitations)
   - [File Uploads](#file-uploads)
   - [Metrics](#metrics)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Role Permissions](#role-permissions)

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

**Token Expiration:** 7 days

---

## 🌐 Public Routes

### Register New User
```
POST /api/auth/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "storeName": "Mi Tienda",
  "currency": "EUR"
}
```

### Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": { /* user data */ }
  }
}
```

### Get Public Store Info
```
GET /api/stores/:slug/public
```
**Auth:** None (public route)
**Use case:** Customer browsing store catalog
**Returns:** Complete store information for public view

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Pizza Express Madrid",
    "slug": "pizza-express-madrid",
    "description": "Las mejores pizzas de la ciudad",
    "logoUrl": "https://...",
    "currency": "EUR",
    "isActive": true,
    "categories": [
      {
        "id": "uuid",
        "name": "Pizzas",
        "description": "Pizzas artesanales",
        "sortOrder": 1
      }
    ],
    "products": [
      {
        "id": "uuid",
        "name": "Pizza Margarita",
        "description": "Tomate, mozzarella y albahaca",
        "price": 12.50,
        "imageUrl": "https://...",
        "isAvailable": true,
        "categoryId": "uuid",
        "category": {
          "id": "uuid",
          "name": "Pizzas"
        }
      }
    ],
    "deliveryZones": [
      {
        "id": "uuid",
        "name": "Centro",
        "maxDistance": 5,
        "deliveryFee": 3.50,
        "minimumOrder": 15.00
      }
    ],
    "paymentMethods": {
      "cash": true,
      "transfer": true
    }
  }
}
```

**Note:** Only returns products where `isAvailable: true`

---

### Get Available Delivery Slots (NEW in Phase 5)
```
GET /api/stores/:slug/delivery-slots/available?date=YYYY-MM-DD
```
**Auth:** None (public route)
**Use case:** Customer selecting scheduled delivery time
**Query Params:**
- `date`: Required (format: YYYY-MM-DD, e.g., "2026-01-08")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "slot": {
        "id": "uuid",
        "dayOfWeek": 1,
        "startTime": "12:00",
        "endTime": "15:00",
        "maxOrdersPerHour": 10
      },
      "available": true,
      "remainingCapacity": 8
    },
    {
      "slot": {
        "id": "uuid",
        "dayOfWeek": 1,
        "startTime": "19:00",
        "endTime": "23:00",
        "maxOrdersPerHour": 10
      },
      "available": false,
      "remainingCapacity": 0
    }
  ]
}
```

**Logic:**
- Calculates day of week from provided date
- Returns slots matching that day of week
- Checks blocked dates (returns empty if date is blocked)
- Calculates remaining capacity for each slot
- Only returns slots for the specific store

**Example:**
```
GET /api/stores/pizza-express-madrid/delivery-slots/available?date=2026-01-08
```

---

### Create Order (Customer)
```
POST /api/stores/:slug/orders
```
**Auth:** None (public route)
**Use case:** Customer placing an order from public store

**Request Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2
    }
  ],
  "customerName": "María López",
  "customerPhone": "+34 666 777 888",
  "customerEmail": "maria@example.com",
  "deliveryAddress": "Calle Mayor, 15, 3º B",
  "deliveryCity": "Madrid",
  "deliveryPostalCode": "28013",
  "deliveryNotes": "Llamar al timbre",
  "deliveryZoneId": "uuid",
  "orderType": "IMMEDIATE",
  "scheduledDate": "2026-01-08",
  "scheduledTimeSlot": "slot-uuid",
  "paymentMethod": "CASH"
}
```

**Field Details:**
- `items`: Array of products (only productId and quantity, prices calculated server-side)
- `customerEmail`: Optional
- `deliveryPostalCode`: Optional
- `deliveryNotes`: Optional
- `orderType`: "IMMEDIATE" or "SCHEDULED"
- `scheduledDate`: Required if orderType is "SCHEDULED" (YYYY-MM-DD)
- `scheduledTimeSlot`: Required if orderType is "SCHEDULED" (slot UUID)
- `paymentMethod`: "CASH" or "TRANSFER"

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "001",
    "status": "CONFIRMED",
    "total": 53.50,
    "estimatedDeliveryTime": "30 minutos"
  }
}
```

**Initial Status:**
- CASH → CONFIRMED (can start preparing immediately)
- TRANSFER → PENDING (waiting for payment confirmation)

**Validation:**
- Store must be active
- All products must exist and be available
- Prices calculated from database (don't trust frontend)
- Validates minimum order for selected zone
- If SCHEDULED: validates date, slot exists, and capacity available

### Track Order
```
GET /api/orders/:orderId/track
```
**Auth:** None (public route)
**Use case:** Customer tracking their order status

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "001",
    "status": "PREPARING",
    "orderType": "IMMEDIATE",
    "paymentMethod": "CASH",
    "paymentStatus": "CONFIRMED",
    "subtotal": 50.00,
    "deliveryFee": 3.50,
    "total": 53.50,
    "customerName": "María López",
    "customerPhone": "+34 666 777 888",
    "customerEmail": "maria@example.com",
    "deliveryAddress": "Calle Mayor, 15, 3º B",
    "deliveryCity": "Madrid",
    "deliveryPostalCode": "28013",
    "deliveryNotes": "Llamar al timbre",
    "scheduledDate": "2026-01-08",
    "scheduledTime": "19:00 - 23:00",
    "estimatedDeliveryTime": "30 minutos",
    "items": [
      {
        "id": "uuid",
        "quantity": 2,
        "price": 12.50,
        "product": {
          "id": "uuid",
          "name": "Pizza Margarita",
          "imageUrl": "https://..."
        }
      }
    ],
    "store": {
      "id": "uuid",
      "name": "Pizza Express Madrid",
      "slug": "pizza-express-madrid",
      "currency": "EUR"
    },
    "createdAt": "2026-01-07T10:30:00.000Z"
  }
}
```

**Note:** Publicly accessible - no authentication required

### Cancel Order (Customer)
```
POST /api/orders/:orderId/cancel
```
**Body:**
```json
{
  "reason": "Ya no lo necesito"
}
```

### Get Invitation Info
```
GET /api/invitations/:token
```
**Use case:** User clicking invitation link
**Returns:** Invitation details and store info

### Accept Invitation (New User)
```
POST /api/invitations/accept
```
**Body:**
```json
{
  "token": "invitation-token",
  "name": "New Member",
  "email": "member@example.com",
  "password": "password123"
}
```

---

## 🔒 Protected Routes

## Auth & Profile

### Get Current User Profile
```
GET /api/auth/profile
```
**Auth:** Required
**Returns:** User data with stores and memberships

### Update Profile
```
PATCH /api/auth/profile
```
**Auth:** Required
**Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

### Change Password
```
POST /api/auth/change-password
```
**Auth:** Required
**Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

---

## Stores

### Get Store by ID
```
GET /api/stores/:storeId
```
**Auth:** Required
**Role:** Store Member
**Returns:** Complete store information

### Update Store Info
```
PATCH /api/stores/:storeId
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:**
```json
{
  "name": "New Store Name",
  "slug": "new-slug",
  "phone": "+34666555444",
  "email": "store@example.com",
  "address": "New Address",
  "description": "Store description",
  "logoUrl": "https://cloudinary.com/..."
}
```

### Update Store Settings
```
PATCH /api/stores/:storeId/settings
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:**
```json
{
  "currency": "EUR",
  "timezone": "Europe/Madrid",
  "cancelWindowMinutes": 15,
  "scheduledCancelWindowHours": 24,
  "minScheduledOrderHours": 2,
  "maxScheduledOrderDays": 7,
  "paymentMethods": ["CASH", "TRANSFER"]
}
```

### List Store Members
```
GET /api/stores/:storeId/members
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Returns:** Array of store members with roles

### Remove Store Member
```
DELETE /api/stores/:storeId/members/:memberId
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Note:** Cannot remove OWNER

### Get Delivery Personnel
```
GET /api/stores/:storeId/delivery-members
```
**Auth:** Required
**Role:** Store Member
**Returns:** Users with DELIVERY role

---

## Orders

### List Store Orders
```
GET /api/stores/:storeId/orders
```
**Auth:** Required
**Role:** Store Member
**Query Params:**
- `status`: PENDING, CONFIRMED, PREPARING, READY, ON_THE_WAY, DELIVERED, CANCELLED
- `type`: IMMEDIATE, SCHEDULED
- `paymentMethod`: CASH, TRANSFER
- `from`: Date (YYYY-MM-DD)
- `to`: Date (YYYY-MM-DD)

**Example:**
```
GET /api/stores/:storeId/orders?status=PREPARING&type=IMMEDIATE
```

### Get Order by ID
```
GET /api/stores/:storeId/orders/:orderId
```
**Auth:** Required
**Role:** Store Member
**Returns:** Complete order details with items

### Update Order Status
```
PATCH /api/stores/:storeId/orders/:orderId/status
```
**Auth:** Required
**Role:** Store Member
**Body:**
```json
{
  "status": "PREPARING"
}
```
**Valid transitions:**
- PENDING → PREPARING
- CONFIRMED → PREPARING
- PREPARING → READY
- READY → ON_THE_WAY
- ON_THE_WAY → DELIVERED

### Assign Delivery Person
```
POST /api/stores/:storeId/orders/:orderId/assign
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:**
```json
{
  "deliveryPersonId": "uuid"
}
```

### Confirm Payment (Transfer)
```
POST /api/stores/:storeId/orders/:orderId/confirm-payment
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Use case:** Mark TRANSFER payment as confirmed
**Transition:** PENDING → PREPARING

### Cancel Order (Store)
```
POST /api/stores/:storeId/orders/:orderId/cancel
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:**
```json
{
  "reason": "Producto no disponible"
}
```

---

## Products

### List Products
```
GET /api/stores/:storeId/products
```
**Auth:** Required
**Role:** Store Member
**Query Params:**
- `categoryId`: Filter by category (optional)

**Example:**
```
GET /api/stores/:storeId/products?categoryId=uuid
```

### Get Product by ID
```
GET /api/stores/:storeId/products/:productId
```
**Auth:** Required
**Role:** Store Member

### Create Product
```
POST /api/stores/:storeId/products
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:**
```json
{
  "name": "Pizza Margarita",
  "description": "Tomate, mozzarella y albahaca",
  "price": 12.50,
  "categoryId": "uuid",
  "imageUrl": "https://cloudinary.com/...",
  "isAvailable": true
}
```

### Update Product
```
PATCH /api/stores/:storeId/products/:productId
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:** Same as create (all fields optional)

### Delete Product
```
DELETE /api/stores/:storeId/products/:productId
```
**Auth:** Required
**Role:** OWNER or ADMIN

### Toggle Product Availability
```
POST /api/stores/:storeId/products/:productId/toggle-availability
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Use case:** Quick enable/disable product

---

## Categories

### List Categories
```
GET /api/stores/:storeId/categories
```
**Auth:** Required
**Role:** Store Member
**Returns:** Categories with product count

### Get Category by ID
```
GET /api/stores/:storeId/categories/:categoryId
```
**Auth:** Required
**Role:** Store Member

### Create Category
```
POST /api/stores/:storeId/categories
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:**
```json
{
  "name": "Pizzas",
  "description": "Nuestras deliciosas pizzas",
  "displayOrder": 1
}
```

### Update Category
```
PATCH /api/stores/:storeId/categories/:categoryId
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:** Same as create (all fields optional)

### Delete Category
```
DELETE /api/stores/:storeId/categories/:categoryId
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Note:** Cannot delete if has products

---

## Delivery Zones

### List Delivery Zones
```
GET /api/stores/:storeId/delivery-zones
```
**Auth:** Required
**Role:** Store Member

### Get Zone by ID
```
GET /api/stores/:storeId/delivery-zones/:zoneId
```
**Auth:** Required
**Role:** Store Member

### Create Delivery Zone
```
POST /api/stores/:storeId/delivery-zones
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:**
```json
{
  "name": "Centro",
  "maxDistanceKm": 5,
  "deliveryFee": 3.50,
  "minimumOrder": 15.00
}
```

### Update Delivery Zone
```
PATCH /api/stores/:storeId/delivery-zones/:zoneId
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:** Same as create (all fields optional)

### Delete Delivery Zone
```
DELETE /api/stores/:storeId/delivery-zones/:zoneId
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Note:** At least 1 zone must remain

---

## Delivery Slots

### List Delivery Slots
```
GET /api/stores/:storeId/delivery-slots
```
**Auth:** Required
**Role:** Store Member

### List Slots by Day of Week
```
GET /api/stores/:storeId/delivery-slots/day/:dayOfWeek
```
**Auth:** Required
**Role:** Store Member
**Params:** dayOfWeek (0-6, where 0 = Sunday)

**Example:**
```
GET /api/stores/:storeId/delivery-slots/day/1
```

### Get Slot by ID
```
GET /api/stores/:storeId/delivery-slots/:slotId
```
**Auth:** Required
**Role:** Store Member

### Create Delivery Slot
```
POST /api/stores/:storeId/delivery-slots
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:**
```json
{
  "dayOfWeek": 1,
  "startTime": "12:00",
  "endTime": "14:00",
  "maxOrdersPerHour": 10
}
```

### Update Delivery Slot
```
PATCH /api/stores/:storeId/delivery-slots/:slotId
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:** Same as create (all fields optional)

### Delete Delivery Slot
```
DELETE /api/stores/:storeId/delivery-slots/:slotId
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Note:** At least 1 slot must remain

---

## Blocked Dates

### List Blocked Dates
```
GET /api/stores/:storeId/blocked-dates
```
**Auth:** Required
**Role:** Store Member
**Query Params:**
- `from`: Start date (YYYY-MM-DD)
- `to`: End date (YYYY-MM-DD)

**Example:**
```
GET /api/stores/:storeId/blocked-dates?from=2026-01-01&to=2026-12-31
```

### Create Blocked Date
```
POST /api/stores/:storeId/blocked-dates
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:**
```json
{
  "date": "2026-12-25",
  "reason": "Navidad"
}
```

### Create Multiple Blocked Dates
```
POST /api/stores/:storeId/blocked-dates/bulk
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:**
```json
{
  "dates": [
    { "date": "2026-12-25", "reason": "Navidad" },
    { "date": "2026-01-01", "reason": "Año Nuevo" }
  ]
}
```

### Delete Blocked Date
```
DELETE /api/stores/:storeId/blocked-dates/:blockedDateId
```
**Auth:** Required
**Role:** OWNER or ADMIN

---

## Team Invitations

### Create Invitation
```
POST /api/stores/:storeId/invitations
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Body:**
```json
{
  "email": "newmember@example.com",
  "role": "CASHIER"
}
```
**Roles:** ADMIN, CASHIER, DELIVERY

### List Store Invitations
```
GET /api/stores/:storeId/invitations
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Returns:** Pending invitations

### Accept Invitation (Existing User)
```
POST /api/invitations/accept-existing
```
**Auth:** Required
**Body:**
```json
{
  "token": "invitation-token"
}
```

### Cancel Invitation
```
DELETE /api/stores/:storeId/invitations/:invitationId
```
**Auth:** Required
**Role:** OWNER or ADMIN

### Resend Invitation
```
POST /api/stores/:storeId/invitations/:invitationId/resend
```
**Auth:** Required
**Role:** OWNER or ADMIN

---

## File Uploads

### Upload Image
```
POST /api/uploads/image
```
**Auth:** Required
**Content-Type:** multipart/form-data
**Body:**
- `image`: File (max 5MB)
- `folder`: String (optional, default: 'delifood')

**Example with axios:**
```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('folder', 'products');

const response = await axios.post('/api/uploads/image', formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "delifood/abc123"
  }
}
```

### Delete Image
```
DELETE /api/uploads/image?publicId=delifood/abc123
```
**Auth:** Required
**Query Param:** publicId (from upload response)

---

## Metrics

### Get Store Metrics
```
GET /api/stores/:storeId/metrics
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Query Params:**
- `from`: Start date (YYYY-MM-DD)
- `to`: End date (YYYY-MM-DD)

**Example:**
```
GET /api/stores/:storeId/metrics?from=2026-01-01&to=2026-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "totalRevenue": 2450.50,
    "averageOrderValue": 16.34,
    "ordersByStatus": {
      "DELIVERED": 120,
      "CANCELLED": 5,
      "PREPARING": 10
    },
    "ordersByType": {
      "IMMEDIATE": 100,
      "SCHEDULED": 50
    },
    "ordersByPaymentMethod": {
      "CASH": 80,
      "TRANSFER": 70
    }
  }
}
```

### Get Today's Metrics
```
GET /api/stores/:storeId/metrics/today
```
**Auth:** Required
**Role:** OWNER or ADMIN
**Returns:** Same format as above for today only

---

## 📤 Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // For validation errors (Zod)
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Error Type | Description |
|------|-----------|-------------|
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate or conflict (e.g., slug exists) |
| 500 | Server Error | Unexpected server error |

### Example Error Handling

```javascript
try {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!data.success) {
    // Handle error
    console.error(data.message);
    if (data.errors) {
      // Validation errors (Zod)
      data.errors.forEach(err => console.error(err));
    }
  } else {
    // Success
    const token = data.data.token;
  }
} catch (error) {
  // Network error
  console.error('Network error:', error);
}
```

---

## 👥 Role Permissions

| Role | Permissions |
|------|-------------|
| **OWNER** | Full access, cannot be removed |
| **ADMIN** | All operations except delete store |
| **CASHIER** | View and manage orders only |
| **DELIVERY** | View assigned orders, update status |

### Permission Matrix

| Action | OWNER | ADMIN | CASHIER | DELIVERY |
|--------|-------|-------|---------|----------|
| View orders | ✅ | ✅ | ✅ | ✅ (assigned only) |
| Update order status | ✅ | ✅ | ✅ | ✅ |
| Assign delivery | ✅ | ✅ | ❌ | ❌ |
| Confirm payment | ✅ | ✅ | ❌ | ❌ |
| Cancel order | ✅ | ✅ | ❌ | ❌ |
| Manage products | ✅ | ✅ | ❌ | ❌ |
| Manage categories | ✅ | ✅ | ❌ | ❌ |
| Manage zones/slots | ✅ | ✅ | ❌ | ❌ |
| Manage team | ✅ | ✅ | ❌ | ❌ |
| View metrics | ✅ | ✅ | ❌ | ❌ |
| Update settings | ✅ | ✅ | ❌ | ❌ |
| Delete store | ✅ | ❌ | ❌ | ❌ |

---

## 📝 Important Notes

1. **At least 1 delivery zone required** per store
2. **At least 1 delivery slot required** per store
3. **At least 1 payment method required** per store
4. **OWNER role** cannot be changed or removed
5. **Orders with TRANSFER** payment start as PENDING
6. **ETA calculated** when order marked ON_THE_WAY
7. **Cancellation windows** are enforced strictly
8. **Token expires** in 7 days (604800 seconds)
9. **All dates** in ISO format (YYYY-MM-DD)
10. **All times** in 24h format (HH:mm)

---

## 🚀 Quick Start Example

```javascript
// 1. Register and Login
const registerResponse = await fetch('http://localhost:4000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'owner@store.com',
    password: 'password123',
    name: 'Store Owner',
    storeName: 'My Store',
    currency: 'EUR'
  })
});

const { data: { token } } = await registerResponse.json();

// 2. Get user profile
const profileResponse = await fetch('http://localhost:4000/api/auth/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { data: user } = await profileResponse.json();
const storeId = user.memberships[0].storeId;

// 3. Create a product
const productResponse = await fetch(`http://localhost:4000/api/stores/${storeId}/products`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Pizza Margarita',
    price: 12.50,
    categoryId: 'category-uuid',
    isAvailable: true
  })
});

// 4. List orders
const ordersResponse = await fetch(
  `http://localhost:4000/api/stores/${storeId}/orders?status=PREPARING`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
```

---

**Need help?** Contact the backend team or check CLAUDE.md for more details.
