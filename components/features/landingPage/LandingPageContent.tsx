export const LandingPageContent = () => {
  return (
    <div className="flex flex-col w-full h-full p-8 justify-center gap-8 max-w-xl mx-auto">
      {/* Hero Section */}
      <div className="flex flex-col gap-4">
        <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
          List It
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
          Organize your tasks and bookmarks in one simple place.
        </p>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-6 pt-4">
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          List It helps you stay organized by bringing together your tasks and
          bookmarks. Create lists, track what needs to get done, and save the
          links you want to revisit later.
        </p>

        <div className="flex flex-col gap-3 pt-2">
          <FeatureItem
            title="Task Lists"
            description="Create lists, add items, and track your progress. Organize by priority and focus on what matters today."
          />
          <FeatureItem
            title="Bookmark Collections"
            description="Save and organize bookmarks with collections. Keep track of what you've read and find things quickly."
          />
          <FeatureItem
            title="Stay in Sync"
            description="Your lists and bookmarks sync in real-time across all your devices."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-medium text-slate-900 dark:text-slate-100 text-base">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
};
