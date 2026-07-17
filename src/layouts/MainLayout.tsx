import { Outlet } from 'react-router-dom';
import FloatingHeader from '@/components/FloatingHeader';
import MinimalFooter from '@/components/MinimalFooter';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <FloatingHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <MinimalFooter />
    </div>
  );
}
