'use client';

import Link from 'next/link';
import {
  FileText,
  CheckCircle,
  Edit,
  FileCheck,
  CheckSquare,
  FilePlus,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useApplications } from '@/app/context/ApplicationContext';

export default function Dashboard() {
  const { getApplicationsByStatus } = useApplications();

  const stats = [
    {
      label: 'Total Permohonan',
      value: getApplicationsByStatus('verification').length.toString(),
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      label: 'Verifikasi',
      value: getApplicationsByStatus('verification').length.toString(),
      icon: CheckCircle,
      color: 'bg-yellow-500',
    },
    {
      label: 'Revisi',
      value: getApplicationsByStatus('revision').length.toString(),
      icon: Edit,
      color: 'bg-orange-500',
    },
    {
      label: 'Penerbitan',
      value: getApplicationsByStatus('publication').length.toString(),
      icon: FileCheck,
      color: 'bg-green-500',
    },
    {
      label: 'Selesai',
      value: getApplicationsByStatus('completed').length.toString(),
      icon: CheckSquare,
      color: 'bg-teal-500',
    },
    {
      label: 'Draft',
      value: getApplicationsByStatus('draft').length.toString(),
      icon: FilePlus,
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Sistem Manajemen Evakuasi Medis Udara</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="size-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Mulai Permohonan Baru</CardTitle>
          <CardDescription>
            Buat permohonan evakuasi medis udara baru atau lanjutkan draft yang
            tersimpan
          </CardDescription>
        </CardHeader>

        <CardContent className="flex gap-4">
          <Link
            href="/dashboard/permohonan"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Buat Permohonan Baru
          </Link>

          <Link
            href="/dashboard/draft"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Lihat Draft
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
