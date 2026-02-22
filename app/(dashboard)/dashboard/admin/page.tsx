'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, LogOut, Plus, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EvacuationRequest {
  id: number;
  patient_name: string;
  location: string;
  priority_level: string;
  status: string;
  request_date: string;
  full_name?: string;
  email?: string;
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  approved: 'bg-green-100 text-green-800',
  in_transit: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-200 text-green-900',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminDashboard() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [evacuations, setEvacuations] = useState<EvacuationRequest[]>([]);
  const [filteredEvacuations, setFilteredEvacuations] = useState<EvacuationRequest[]>([]);
  const [error, setError] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    } else if (user && user.role !== 'admin') {
      router.push('/dashboard/user');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchEvacuations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [evacuations, searchTerm, statusFilter, priorityFilter]);

  const fetchEvacuations = async () => {
    try {
      setDataLoading(true);
      const response = await fetch('/api/evacuations');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEvacuations(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load evacuations');
    } finally {
      setDataLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = evacuations;

    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((e) => e.priority_level === priorityFilter);
    }

    setFilteredEvacuations(filtered);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-primary text-lg font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  const criticalCount = evacuations.filter((e) => e.priority_level === 'critical').length;
  const pendingCount = evacuations.filter((e) => e.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              M
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Medical Evacuation System</h1>
              <p className="text-sm text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{evacuations.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All time evacuations</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-50/50 dark:from-orange-950/20 dark:to-orange-950/10 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-500">{pendingCount}</div>
              <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-50/50 dark:from-red-950/20 dark:to-red-950/10 border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700 dark:text-red-500">{criticalCount}</div>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">Urgent priority</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Evacuation Requests</CardTitle>
            <CardDescription>Manage and monitor all medical evacuation requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Patient name, location, or email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evacuations Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left font-semibold text-foreground">Patient</th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">Requester</th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">Location</th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">Priority</th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvacuations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        No evacuations found
                      </td>
                    </tr>
                  ) : (
                    filteredEvacuations.map((evac) => (
                      <tr key={evac.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{evac.patient_name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{evac.full_name}</td>
                        <td className="px-6 py-4 text-sm text-foreground truncate max-w-xs">{evac.location}</td>
                        <td className="px-6 py-4">
                          <Badge className={`${priorityColors[evac.priority_level] || 'bg-gray-100 text-gray-800'} capitalize`}>
                            {evac.priority_level}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${statusColors[evac.status] || 'bg-gray-100 text-gray-800'} capitalize`}>
                            {evac.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(evac.request_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/evacuation/${evac.id}`)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
