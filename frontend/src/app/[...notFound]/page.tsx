import DashboardSideBar from '@/components/DashboardSideBar';
import NotImplemented from '@/components/NotImplemented';

export default function NotFound() {
  return <div
    className="flex min-h-screen"
    style={{ backgroundColor: "var(--color-background)" }}
  >
    {/* Sidebar */}
    <div className="sticky top-0 h-screen">
      <DashboardSideBar />
    </div>

    {/* Main Content */}
    <div className="flex-1 flex flex-col min-h-screen">
      <NotImplemented />
    </div>
  </div>;
} 