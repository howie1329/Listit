import { Badge } from "@/components/ui/badge";

export const LandingPageContent = () => {
  return (
    <div className="flex flex-col w-full h-full p-8 lg:p-12 justify-center gap-10 max-w-2xl mx-auto relative">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
      
      {/* Hero Section */}
      <div className="flex flex-col gap-6 relative z-10">
        <Badge variant="secondary" className="w-fit animate-fade-in">
          Productivity made simple
        </Badge>
        
        <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent leading-[1.1] tracking-tight animate-slide-up">
          List It
        </h1>
        
        <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-lg animate-slide-up animation-delay-100">
          Organize your tasks and bookmarks in one beautifully simple place.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 relative z-10 animate-slide-up animation-delay-200">
        <FeatureCard
          icon={<ChecklistIcon />}
          title="Smart Task Lists"
          description="Create powerful lists, track progress with visual indicators, and focus on what matters most."
          gradient="from-amber-500/10 to-orange-500/10"
        />
        <FeatureCard
          icon={<BookmarkIcon />}
          title="Bookmark Collections"
          description="Organize links into curated collections. Never lose track of valuable content again."
          gradient="from-blue-500/10 to-indigo-500/10"
        />
        <FeatureCard
          icon={<SyncIcon />}
          title="Real-time Sync"
          description="Seamlessly access your lists and bookmarks across all devices, always up-to-date."
          gradient="from-emerald-500/10 to-teal-500/10"
        />
      </div>

      {/* Trust indicators */}
      <div className="flex items-center gap-6 pt-4 relative z-10 animate-fade-in animation-delay-400">
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {String.fromCharCode(64 + i)}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Trusted by <span className="font-semibold text-foreground">1,000+</span> productive people
        </p>
      </div>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) => {
  return (
    <div className={`group flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br ${gradient} border border-border/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-border cursor-default`}>
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-background/80 border border-border/50 flex items-center justify-center text-foreground/80 group-hover:text-foreground transition-colors">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-foreground text-base">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

const ChecklistIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 18H3" />
    <path d="m15 18 2 2 4-4" />
    <path d="M16 12H3" />
    <path d="M16 6H3" />
  </svg>
);

const BookmarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

const SyncIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);
