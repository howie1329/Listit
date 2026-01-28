import { LandingPageContent } from "@/components/features/landingPage/LandingPageContent";
import { AuthComponents } from "@/components/features/landingPage/AuthComponents";

export default function Page() {
  return (
    <main className="relative w-full min-h-svh overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49%,var(--border)_50%,transparent_51%,transparent_100%),linear-gradient(to_bottom,transparent_0%,transparent_49%,var(--border)_50%,transparent_51%,transparent_100%)] bg-[size:60px_60px] opacity-[0.3]" />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] animate-float animation-delay-2000" />
      
      {/* Content */}
      <div className="relative z-10 w-full min-h-svh">
        <MainContent />
      </div>
    </main>
  );
}

const MainContent = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-svh">
      {/* Left side - Landing content */}
      <div className="flex flex-col w-full lg:w-3/5 min-h-[50vh] lg:min-h-svh items-center justify-center relative">
        <LandingPageContent />
      </div>
      
      {/* Right side - Auth */}
      <div className="flex flex-col w-full lg:w-2/5 min-h-[50vh] lg:min-h-svh items-center justify-center border-t lg:border-t-0 lg:border-l border-border/50 bg-muted/20 backdrop-blur-sm">
        <AuthComponents />
      </div>
    </div>
  );
};
