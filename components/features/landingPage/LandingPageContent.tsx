export const LandingPageContent = () => {
  return (
    <div className="flex flex-col w-full h-full p-8 justify-center gap-6 max-w-2xl mx-auto">
      {/* Hero Section */}
      <div className="flex flex-col gap-3">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
          📝 List It
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          AI-powered lists you can share. Create smart lists and get
          personalized suggestions.
        </p>
      </div>

      {/* Key Features */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3">
          <FeatureCard
            icon="🤖"
            title="AI-Powered Lists"
            description="Generate smart lists with AI assistance. Get personalized Today's List suggestions based on your habits."
          />
          <FeatureCard
            icon="🔗"
            title="Shareable Links"
            description="Create public lists and share them instantly with anyone. Perfect for grocery lists, event planning, and more."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="pt-2">
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
    <div className="flex flex-row gap-3 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="text-2xl shrink-0">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <h3 className="font-medium text-slate-800 dark:text-slate-200 text-base">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
};
