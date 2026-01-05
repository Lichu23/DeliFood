'use client';

  import Link from 'next/link';
  import { usePathname } from 'next/navigation';
  import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    FolderTree,
    Settings,
    Users
  } from 'lucide-react';
  import { useAuthStore } from '@/store/authStore';
  import { cn } from '@/lib/utils';

  interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: ('OWNER' | 'ADMIN' | 'CASHIER' | 'DELIVERY')[];
  }

  const navItems: NavItem[] = [
    {
      name: 'Pedidos',
      href: '/orders',
      icon: ShoppingBag,
      roles: ['OWNER', 'ADMIN', 'CASHIER', 'DELIVERY'],
    },
    {
      name: 'Productos',
      href: '/products',
      icon: Package,
      roles: ['OWNER', 'ADMIN', 'CASHIER'],
    },
    {
      name: 'Categorías',
      href: '/categories',
      icon: FolderTree,
      roles: ['OWNER', 'ADMIN'],
    },
    {
      name: 'Configuración',
      href: '/settings',
      icon: Settings,
      roles: ['OWNER', 'ADMIN'],
    },
    {
      name: 'Equipo',
      href: '/team',
      icon: Users,
      roles: ['OWNER', 'ADMIN'],
    },
  ];

  interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
  }

  export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { currentStore } = useAuthStore();

    const filteredNavItems = navItems.filter((item) =>
      currentStore ? item.roles.includes(currentStore.role) : false
    );

    return (
      <>
        {/* Mobile overlay */}
        {isOpen && onClose && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed left-0 top-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 lg:translate-x-0',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
              <LayoutDashboard className="w-6 h-6 text-blue-500" />
              <span className="font-bold text-xl">DeliFood</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Footer info */}
            {currentStore && (
              <div className="px-6 py-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 truncate">
                  {currentStore.name}
                </p>
                <p className="text-xs text-gray-400">
                  Rol: {currentStore.role}
                </p>
              </div>
            )}
          </div>
        </aside>
      </>
    );
  }