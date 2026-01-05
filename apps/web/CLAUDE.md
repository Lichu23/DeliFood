# DeliFood Frontend - Web Application

## Frontend Phases

### Phase 1: Setup & Auth 🔄 IN PROGRESS
- [x] Project setup
- [x] Login page
- [x] Register page
- [ ] Accept invitation
- [ ] Route protection

### Phase 2: Dashboard Layout ⬜
### Phase 3: Orders Management ⬜
### Phase 4: Catalog Management ⬜
### Phase 5: Configuration ⬜
### Phase 6: Public Store ⬜

See full details in `../../PHASES.md`


## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Forms**: React Hook Form + Zod
- **Server State**: TanStack Query
- **Client State**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Public auth pages
│   │   ├── login/
│   │   ├── register/
│   │   └── invite/[token]/
│   ├── (dashboard)/        # Protected pages
│   │   ├── orders/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── settings/
│   │   ├── team/
│   │   └── profile/
│   ├── (public)/           # Public store pages
│   │   ├── store/[slug]/
│   │   └── track/[orderId]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── ui/                 # Base components (Button, Input, etc.)
│   ├── forms/              # Form components
│   ├── layout/             # Layout components (Sidebar, Header)
│   └── shared/             # Shared components
├── hooks/                  # Custom hooks
│   └── useAuth.ts
├── lib/                    # Utilities
│   ├── axios.ts            # HTTP client with interceptors
│   ├── queryClient.ts      # TanStack Query config
│   ├── socket.ts           # Socket.io client (future)
│   └── utils.ts            # Helper functions (cn)
├── services/               # API calls
│   └── auth.service.ts
├── store/                  # Zustand stores
│   └── authStore.ts
├── schemas/                # Zod validation schemas
│   └── auth.schema.ts
└── types/                  # TypeScript types
    ├── auth.types.ts
    └── api.types.ts
```

## API Connection

- Base URL: `http://localhost:4000/api`
- Auth: JWT token in `Authorization: Bearer <token>` header
- Token stored in localStorage and Zustand

## Key Patterns

### API Calls with TanStack Query
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['orders'],
  queryFn: () => ordersService.list(storeId),
});
```

### Mutations
```typescript
const mutation = useMutation({
  mutationFn: (data) => ordersService.create(data),
  onSuccess: () => queryClient.invalidateQueries(['orders']),
});
```

### Form Validation
```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

### Auth State
```typescript
const { user, currentStore, isAuthenticated, logout } = useAuth();
```

## Components

### UI Components (src/components/ui/)
- Button: Primary, secondary, danger, ghost variants
- Input: With label and error support
- Select: Dropdown with options
- Checkbox: With label
- Card: Container with header, title, description, content
- Alert: Success, error, warning, info variants

## Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Commands
```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Current Status

### Phase 1: Setup & Auth
- [x] Project setup
- [x] Dependencies installed
- [x] Folder structure created
- [x] Axios with interceptors
- [x] TanStack Query configured
- [x] Zustand auth store
- [x] UI components (Button, Input, Select, Checkbox, Card, Alert)
- [x] useAuth hook
- [x] Login page
- [x] Register page (5-step wizard)
- [ ] Accept invitation page
- [ ] Route protection

## Notes

- UI is basic/functional for MVP testing
- Will be redesigned with Lovable after backend integration is verified
- React Hook Form has compatibility warning with React Compiler (can be ignored)