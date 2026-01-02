export const LandingPageContent = () => {
  return (
    <div className="flex flex-col w-full h-full p-12 justify-center gap-8 max-w-2xl mx-auto">
      {/* Hero Section */}
      <div className="flex flex-col gap-4">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
          📝 List It
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
          A fast, AI-assisted list app that helps you create, share, and generate smart lists — including an AI-powered &ldquo;Today&apos;s List.&rdquo;
        </p>
      </div>

      {/* Key Features */}
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
          Why List It?
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <FeatureCard
            icon="🤖"
            title="AI-Powered Lists"
            description="Generate smart lists with AI assistance. Get personalized Today&apos;s List suggestions based on your habits."
          />
          <FeatureCard
            icon="🔗"
            title="Shareable Links"
            description="Create public lists and share them instantly with anyone. Perfect for grocery lists, event planning, and more."
          />
          <FeatureCard
            icon="⚡"
            title="Fast & Simple"
            description="Clean, minimal interface that gets out of your way. Create and manage lists in seconds."
          />
          <FeatureCard
            icon="🔒"
            title="Private or Public"
            description="Toggle between private lists for personal use or public lists for sharing. You&apos;re in control."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex flex-col gap-4 pt-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Get started by signing in or creating an account →
        </p>
      </div>
    </div>
  );
};



const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-row gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
      <div className="text-3xl shrink-0">{icon}</div>
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
};