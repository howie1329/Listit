import { LandingPageContent } from "@/components/features/landingPage/LandingPageContent";
import { AuthComponents } from "@/components/features/landingPage/AuthComponents";
export default function Page() {
  return (
    <>
      <main className="flex flex-col w-full h-svh overflow-hidden">
        <MainContent />
      </main>
    </>
  );
}

const MainContent = () => {
  return (
    <div className="flex flex-row w-full h-full">
      <div className="flex flex-col w-3/5 h-full border-y border-l items-center justify-center">
        <LandingPageContent />
      </div>
      <div className="flex flex-col w-2/5 h-full border items-center justify-center">
        <AuthComponents />
      </div>
    </div>
  );
};
