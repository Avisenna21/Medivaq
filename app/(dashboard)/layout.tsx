import { MainLayout } from './MainLayout';
import { ApplicationProvider } from '../context/ApplicationContext';
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApplicationProvider>
      <MainLayout>{children}</MainLayout>
    </ApplicationProvider>
  );
}
