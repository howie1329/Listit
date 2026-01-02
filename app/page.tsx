import { LandingPageContent } from "@/components/features/landingPage/LandingPageContent";
import { AuthComponents } from "@/components/features/landingPage/AuthComponents";
export default function Page() {
  return (
    <>
      <header className="flex sticky h-8 top-0 z-50 border-slate-200 dark:border-slate-700 items-center r">
        <p>ListIt</p>
      </header>
      <main className="flex flex-col w-full h-[calc(100vh-2rem)]">
        <MainContent />
      </main>
    </>
  );
}

const MainContent = () => {
  return (
    <div className="flex flex-row w-full h-full">
      <div className="flex flex-col w-3/5 h-full border items-center justify-center">
        <LandingPageContent />
      </div>
      <div className="flex flex-col w-2/5 h-full border items-center justify-center">
        <AuthComponents />
      </div>
    </div>
  );
};
