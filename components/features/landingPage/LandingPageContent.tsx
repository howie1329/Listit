import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TaskEditIcon,
  BookmarkIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";

export const LandingPageContent = () => {
  return (
    <div className="flex flex-col w-full h-full p-8 items-center justify-center gap-8 max-w-2xl mx-auto">
      {/* Hero Section */}
      <div className="flex flex-col gap-4 items-center text-center">
        <h1 className="text-7xl font-bold text-foreground leading-tight">
          List It
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Organize your tasks and bookmarks in one simple place.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-row gap-4">
        <Button size="lg" disabled>
          Get Started
        </Button>
        <Button size="lg" variant="outline" disabled>
          Learn More
        </Button>
      </div>

      {/* Divider */}
      <div className="w-full max-w-md border-t border-border" />

      {/* Features Row */}
      <div className="flex flex-row gap-8 justify-center items-start">
        <FeatureItem
          icon={<HugeiconsIcon icon={TaskEditIcon} className="w-8 h-8" />}
          title="Task Lists"
          description="Create lists, add items, and track your progress"
        />
        <FeatureItem
          icon={<HugeiconsIcon icon={BookmarkIcon} className="w-8 h-8" />}
          title="Bookmark Collections"
          description="Save and organize bookmarks with collections"
        />
        <FeatureItem
          icon={<HugeiconsIcon icon={RefreshIcon} className="w-8 h-8" />}
          title="Stay in Sync"
          description="Your data syncs in real-time across all devices"
        />
      </div>
    </div>
  );
};

const FeatureItem = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col gap-2 items-center text-center max-w-[140px]">
      <div className="text-foreground">{icon}</div>
      <h3 className="font-medium text-foreground text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
};
