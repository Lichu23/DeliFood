 'use client';

  import { useState } from 'react';
  import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
  import { Sidebar } from '@/components/layout/Sidebar';
  import { Header } from '@/components/layout/Header';

  export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main content */}
          <div className="lg:pl-64">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }
