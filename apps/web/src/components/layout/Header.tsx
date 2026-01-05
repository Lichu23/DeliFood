  'use client';

  import { Menu } from 'lucide-react';
  import { StoreSelector } from './StoreSelector';
  import { UserMenu } from './UserMenu';

  interface HeaderProps {
    onMenuClick: () => void;
  }

  export function Header({ onMenuClick }: HeaderProps) {
    return (
      <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Desktop spacing */}
          <div className="hidden lg:block" />

          {/* Right side */}
          <div className="flex items-center gap-4">
            <StoreSelector />
            <UserMenu />
          </div>
        </div>
      </header>
    );
  }