'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  CheckCircle,
  Edit,
  FileCheck,
  CheckSquare,
  FilePlus,
  LayoutDashboard,
  Plane,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/permohonan', label: 'Form Permohonan', icon: FileText },
  { path: '/verifikasi', label: 'Verifikasi', icon: CheckCircle },
  { path: '/revisi', label: 'Revisi', icon: Edit },
  { path: '/penerbitan', label: 'Penerbitan', icon: FileCheck },
  { path: '/selesai', label: 'Selesai', icon: CheckSquare },
  { path: '/draft', label: 'Draft', icon: FilePlus },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Plane className="size-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-xl text-gray-900">MEDIVAQ</h1>
              <p className="text-xs text-gray-500">
                Medical Evacuation Services
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100',
                )}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
