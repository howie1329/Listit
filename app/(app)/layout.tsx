import { CreateListModel } from "@/components/features/list/CreateListModal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full overflow-hidden">
      <AppHeader />
      <main className="w-full h-[calc(100vh-2rem)] border-2 border-green-500 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full h-8 flex items-center justify-between p-4">
      <p>List It</p>
      <CreateListModel />
    </header>
  );
};
