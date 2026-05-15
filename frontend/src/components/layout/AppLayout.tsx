import { Outlet } from 'react-router-dom';
import TopBar    from './TopBar';
import BottomNav from './BottomNav';
import Sidebar   from './Sidebar';

/**
 * AppLayout
 * ┌─────────────────────────────────────────┐
 * │ Mobile  (<1024px): TopBar + BottomNav   │
 * │ Desktop (≥1024px): Sidebar only         │
 * └─────────────────────────────────────────┘
 */
export default function AppLayout() {
  return (
    <div className="desktop-layout">

      {/* ── Desktop sidebar (hidden on mobile via CSS) ── */}
      <Sidebar />

      {/* ── Main content area ── */}
      <div className="desktop-main">

        {/* TopBar: visible only on mobile */}
        <div className="lg:hidden">
          <TopBar />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto page-content">
          <Outlet />
        </main>

        {/* BottomNav: visible only on mobile */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
