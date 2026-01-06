# DeliFood - Frontend Web Phases

## Status Overview

| Stage              | Status      | Progress |
| ------------------ | ----------- | -------- |
| 🎯 **STAGE 1: MVP** | 🔄 Progress | 4/5      |
| 🚀 **STAGE 2**     | ⬜ Pending  | 0/4      |

---

# 🎯 STAGE 1: MVP (Minimum Viable Product)

> **Goal**: Dashboard for store owners + public store for customers to place orders.

---

## Phase 1: Setup & Auth ✅ COMPLETED

**Branch**: `feat/frontend-phase-1-auth` (merged to main)

**Features**
- [x] Next.js 14 project setup (App Router)
- [x] TailwindCSS + Shadcn/ui configuration
- [x] TanStack Query configuration
- [x] Zustand store setup
- [x] Auth context and hooks
- [x] API client with interceptors
- [x] Login page
- [x] Register page (multi-step onboarding wizard)
- [x] Accept invitation page (`/invite/[token]`)
- [x] Protected routes middleware

**Pages**
```
/login
/register (steps: account → store → payment → zones → slots)
/invite/[token]
```

**Components**
```
<LoginForm />
<RegisterWizard />
  - <AccountStep />
  - <StoreStep />
  - <PaymentStep />
  - <ZonesStep />
  - <SlotsStep />
<InvitationAcceptance />
<ProtectedRoute />
```

---

## Phase 2: Dashboard Layout 🔄 IN PROGRESS

**Current Branch**: `feat/frontend-phase-2-dashboard`

**Features**
- [x] Sidebar navigation with icons (Lucide React)
- [x] Top header with user menu
- [x] Store selector dropdown (multi-store support)
- [x] Mobile responsive (hamburger menu)
- [x] Role-based menu items visibility
- [x] Logout functionality
- [x] Profile page with update profile and change password

**Pages**
```
/orders (main dashboard page)
/profile
```

**Components**
```
<DashboardLayout /> (updated with Sidebar + Header)
<Sidebar />
  - Navigation items: Orders, Products, Categories, Settings, Team
  - Role-based filtering
  - Mobile drawer support
<Header />
  - Mobile menu button
  - <StoreSelector /> (dropdown for multi-store)
  - <UserMenu /> (profile, settings, logout)
<ProfilePage />
  - Update profile form
  - Change password form
```

**Navigation Structure**
```
Dashboard
├── Orders (all roles)
├── Products (OWNER, ADMIN, CASHIER)
├── Categories (OWNER, ADMIN)
├── Settings (OWNER, ADMIN)
│   ├── Store
│   ├── Payments
│   ├── Delivery Zones
│   ├── Delivery Slots
│   └── Blocked Dates
└── Team (OWNER, ADMIN)
```

---

## Phase 3: Orders Management ✅ COMPLETED

**Branch**: `feat/frontend-phase-3-orders`

**Features**
- [x] Orders list with real-time updates
- [x] Filters: status, type (immediate/scheduled), payment status, date range
- [x] Order status badges (color-coded)
- [x] Order detail page
- [x] Status change buttons (flow-aware)
- [x] Assign delivery person dropdown
- [x] Confirm payment button (transfer orders)
- [x] Cancel order with reason
- [x] Order timeline/history
- [x] Print order functionality
- [x] Sound notification for new orders
- [x] Socket.io integration

**Pages**
```
/dashboard/orders
/dashboard/orders/[orderId]
```

**Components**
```
<OrdersList />
  - <OrderFilters />
  - <OrderCard />
<OrderDetail />
  - <OrderHeader />
  - <OrderItems />
  - <OrderCustomer />
  - <OrderTimeline />
  - <OrderActions />
<OrderStatusBadge />
<AssignDeliveryDialog />
<ConfirmPaymentDialog />
<CancelOrderDialog />
```

**Order Status Colors**
```
PENDING     → Yellow
CONFIRMED   → Blue
PREPARING   → Orange
READY       → Purple
ON_THE_WAY  → Cyan
DELIVERED   → Green
CANCELLED   → Red
```

---

## Phase 4: Catalog Management ✅ COMPLETED

**Branch**: `feat/frontend-phase-4-catalog`

**Features**
- [x] Categories list with drag-to-reorder
- [x] Category form (create/edit modal)
- [x] Products grid view
- [x] Product form (create/edit page)
- [x] Image upload with preview (basic version)
- [x] Toggle availability switch (real-time)
- [x] Filter products by category
- [x] Search products by name
- [x] Empty states
- [ ] Bulk actions (deferred to Stage 2)

**Pages**
```
/dashboard/categories
/dashboard/products
/dashboard/products/new
/dashboard/products/[productId]/edit
```

**Components**
```
<CategoriesList />
  - <CategoryCard /> (draggable)
  - <CategoryFormModal />
<ProductsGrid />
  - <ProductCard />
  - <ProductSearch />
  - <CategoryFilter />
<ProductForm />
  - <ImageUploader />
  - <ProductFields />
  - <PriceInput />
<AvailabilityToggle />
<BulkActionsBar />
```

**Image Upload**
```
- Max size: 5MB
- Formats: JPEG, PNG, WebP
- Auto-resize: 1200x1200
- Upload to Cloudinary
- Preview with crop tool
```

---

## Phase 5: Public Store ⬜ PENDING

**Features**
- [ ] Store public page (catalog view)
- [ ] Browse products by category
- [ ] Product detail modal
- [ ] Shopping cart (Zustand)
- [ ] Cart drawer/sidebar
- [ ] Checkout form (customer info + address)
- [ ] Delivery zone validation
- [ ] Delivery time selection (immediate or scheduled)
- [ ] Available slots calculation
- [ ] Order summary
- [ ] Submit order
- [ ] Order confirmation page
- [ ] Order tracking page (public)
- [ ] Mobile-first responsive design
- [ ] SEO meta tags

**Pages**
```
/store/[slug]
/store/[slug]/checkout
/track/[orderId]
```

**Components**
```
<StoreHeader />
  - <StoreLogo />
  - <CartButton />
<ProductCatalog />
  - <CategoryTabs />
  - <ProductCard />
<ProductDetailModal />
<ShoppingCart />
  - <CartItem />
  - <CartSummary />
<CartDrawer />
<CheckoutForm />
  - <CustomerInfoStep />
  - <DeliveryAddressStep />
  - <DeliveryTimeStep />
  - <PaymentMethodStep />
<DeliveryZoneSelector />
<DeliveryTimeSelector />
  - <ImmediateOption />
  - <ScheduledOption /> (date + time slot)
<OrderSummary />
<OrderConfirmation />
<OrderTracking />
  - <OrderStatus />
  - <DeliveryMap /> (optional)
```

**Checkout Flow**
```
1. Browse catalog → Add to cart
2. Open cart → Review items
3. Checkout → Customer info
4. Select delivery address → Zone validation
5. Select delivery time → Immediate or scheduled
6. Choose payment method → CASH or TRANSFER
7. Review order → Submit
8. Confirmation → Order ID + tracking link
```

---

# 🚀 STAGE 2: PRODUCTION

> **Goal**: Complete dashboard features, analytics, PWA, and testing.

---

## Phase 6: Configuration & Settings ⬜ PENDING

**Features**
- [ ] Store settings page (full CRUD)
  - [ ] Store information (name, description, logo)
  - [ ] Contact information
  - [ ] Business hours
  - [ ] Payment methods configuration
  - [ ] Cancellation policies
- [ ] Delivery zones management
  - [ ] Table view with actions
  - [ ] Create/edit/delete zones
  - [ ] Map visualization (optional)
- [ ] Delivery slots management
  - [ ] Calendar/grid view by day
  - [ ] Create/edit/delete slots
  - [ ] Overlap detection UI
- [ ] Blocked dates management
  - [ ] Calendar view
  - [ ] Single and bulk creation
  - [ ] Delete blocked dates
- [ ] Team management
  - [ ] Members list with roles
  - [ ] Invite new members
  - [ ] Change member roles (except OWNER)
  - [ ] Remove members
  - [ ] Pending invitations list

**Pages**
```
/dashboard/settings
/dashboard/settings/payments
/dashboard/settings/delivery-zones
/dashboard/settings/delivery-slots
/dashboard/settings/blocked-dates
/dashboard/team
```

**Components**
```
<StoreSettingsForm />
<PaymentSettings />
  - <PaymentMethodToggle /> (CASH, TRANSFER)
  - <BankAccountForm />
<DeliveryZonesTable />
  - <ZoneRow />
  - <ZoneFormDialog />
<DeliverySlotCalendar />
  - <SlotsByDay />
  - <SlotFormDialog />
<BlockedDatesCalendar />
  - <DatePicker />
  - <BulkBlockDialog />
<TeamTable />
  - <MemberRow />
  - <InviteMemberDialog />
  - <ChangeRoleDialog />
```

---

## Phase 7: Analytics & Metrics ⬜ PENDING

**Features**
- [ ] Dashboard overview page
  - [ ] Total orders (today, week, month)
  - [ ] Revenue charts
  - [ ] Orders by status (pie chart)
  - [ ] Top-selling products
  - [ ] Average order value
  - [ ] Delivery performance metrics
- [ ] Reports generation
  - [ ] Sales reports (by period)
  - [ ] Product performance reports
  - [ ] Delivery reports
  - [ ] Export to CSV/PDF
- [ ] Real-time metrics
  - [ ] Active orders counter
  - [ ] Orders in delivery counter
  - [ ] Revenue today

**Pages**
```
/dashboard (overview with metrics)
/dashboard/reports
```

**Components**
```
<DashboardOverview />
  - <MetricCard /> (Total Orders, Revenue, Avg Order)
  - <RevenueChart /> (Line chart)
  - <OrdersByStatusChart /> (Pie chart)
  - <TopProductsTable />
<ReportsPage />
  - <DateRangePicker />
  - <ReportTypeSelector />
  - <ExportButton /> (CSV, PDF)
  - <ReportTable />
```

**Charts Library**
```
- Recharts or Chart.js
- Real-time updates via Socket.io
- Responsive design
```

---

## Phase 8: PWA & Mobile Enhancements ⬜ PENDING

**Features**
- [ ] Progressive Web App (PWA) setup
  - [ ] Service worker for offline support
  - [ ] Web manifest
  - [ ] Install prompt
  - [ ] Offline fallback pages
- [ ] Push notifications (web)
  - [ ] New order notifications
  - [ ] Order status updates
- [ ] Mobile optimizations
  - [ ] Touch-friendly UI
  - [ ] Swipe gestures
  - [ ] Bottom sheet modals
- [ ] App-like experience on mobile

**PWA Features**
```
- Installable on mobile/desktop
- Offline mode (cached data)
- Push notifications (with permission)
- App icon and splash screen
- Standalone display mode
```

**Files**
```
public/
├── manifest.json
├── sw.js (service worker)
├── icons/
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── apple-touch-icon.png
└── offline.html
```

---

## Phase 9: Testing & Quality ⬜ PENDING

**Features**
- [ ] Unit tests (Vitest or Jest)
  - [ ] Utility functions
  - [ ] Hooks tests
  - [ ] Component tests
- [ ] Integration tests (React Testing Library)
  - [ ] User flows
  - [ ] Form submissions
  - [ ] API interactions
- [ ] E2E tests (Playwright or Cypress)
  - [ ] Critical user paths
  - [ ] Order creation flow
  - [ ] Auth flows
- [ ] Visual regression testing (Chromatic)
- [ ] Accessibility testing (axe-core)
- [ ] Test coverage reports

**Testing Strategy**
```
Unit Tests:
- src/lib/*.test.ts
- src/hooks/*.test.ts
- src/components/**/*.test.tsx

Integration Tests:
- tests/integration/auth.test.tsx
- tests/integration/orders.test.tsx

E2E Tests:
- tests/e2e/order-flow.spec.ts
- tests/e2e/onboarding.spec.ts
- tests/e2e/customer-order.spec.ts
```

**Coverage Targets**
```
- Overall: > 80%
- Components: > 70%
- Utilities: > 90%
- Hooks: > 80%
```

---

# 📋 SUMMARY

## MVP Checklist 🔄 IN PROGRESS (4/5)
- [x] Phase 1: Setup & Auth ✅ COMPLETED
- [x] Phase 2: Dashboard Layout ✅ COMPLETED
- [x] Phase 3: Orders Management ✅ COMPLETED
- [x] Phase 4: Catalog Management ✅ COMPLETED
- [ ] Phase 5: Public Store

## Production Checklist ⬜ PENDING (0/4)
- [ ] Phase 6: Configuration & Settings
- [ ] Phase 7: Analytics & Metrics
- [ ] Phase 8: PWA & Mobile Enhancements
- [ ] Phase 9: Testing & Quality

---

# 🎯 CURRENT FOCUS

**Active Branch**: `feat/frontend-phase-4-catalog`
**Current Phase**: Phase 4 - Catalog Management (100% complete)

**Completed Tasks**:
1. ✅ Created types and schemas for categories and products
2. ✅ Created categories and products services
3. ✅ Implemented CategoriesList with drag-and-drop reordering (@dnd-kit)
4. ✅ Created CategoryCard and CategoryFormDialog (CRUD)
5. ✅ Implemented ProductsGrid with filters and search
6. ✅ Created ProductCard with availability toggle
7. ✅ Created ProductFilters (category dropdown + search)
8. ✅ Built ProductForm for create/edit with validation
9. ✅ Implemented ImageUploadBasic with Cloudinary integration
10. ✅ Fixed backend list filtering (includeUnavailable query param)
11. ✅ Fixed Zustand hydration issue (redirect loop)
12. ✅ Fixed form type issues (union types for create/update schemas)

**Next Phase**: Phase 5 - Public Store

---

# 📊 SUCCESS CRITERIA

## MVP Success
- [ ] Store owner can login and access dashboard
- [ ] Store owner can manage orders in real-time
- [ ] Store owner can manage products and categories
- [ ] Customers can browse public store
- [ ] Customers can place orders (immediate and scheduled)
- [ ] Order tracking works for customers
- [ ] Mobile-friendly responsive design

## Production Success
- [ ] PWA installable on mobile devices
- [ ] Push notifications working
- [ ] Complete settings management
- [ ] Analytics dashboard functional
- [ ] Test coverage > 80%
- [ ] Accessibility score > 90 (Lighthouse)
- [ ] Performance score > 90 (Lighthouse)

---

**Last Updated**: 2026-01-06
**Platform**: Frontend Web (apps/web)
**Stack**: Next.js 14 + TypeScript + TailwindCSS + TanStack Query + Zustand
