import { AppShell } from '@/components/layout/AppShell';

export default function GroupsPage() {
  return (
    <AppShell title="My Groups">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-[#9b9590]">
        <div className="text-5xl mb-4">◫</div>
        <p className="text-[16px] font-medium text-[#6b6660]">My Groups</p>
        <p className="text-[13px] mt-1">Coming soon</p>
      </div>
    </AppShell>
  );
}
