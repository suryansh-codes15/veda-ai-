import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function AppShell({ children, title = 'Assignment', showBack = false, onBack }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#eae7e1] p-3 gap-3">
      <Sidebar />
      <main className="flex-1 flex flex-col gap-3 min-w-0 max-w-[1100px]">
        <Topbar title={title} showBack={showBack} onBack={onBack} />
        <div className="flex-1 bg-white rounded-2xl p-8 shadow-realistic page-enter overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
