import { Outlet } from 'react-router-dom';
import TopBar  from './TopBar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="desktop-layout">
      <Sidebar />
      <div className="desktop-main">
        <div className="lg:hidden"><TopBar /></div>
        <main className="flex-1 overflow-y-auto page-content">
          <Outlet />
        </main>
        <div className="lg:hidden"><BottomNav /></div>
      </div>
    </div>
  );
}
