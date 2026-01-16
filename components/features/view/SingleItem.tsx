import { Doc } from "@/convex/_generated/dataModel";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const SingleItem = ({ item }: { item: Doc<"items"> }) => {
  return (
    <Card className="hover:bg-accent transition-colors cursor-pointer w-11/12 border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Checkbox
            checked={item.isCompleted}
            className="mt-1"
            // Prevent parent click handlers from firing if added later
            onClick={(e) => e.stopPropagation()}
          />
          <Badge variant="outline" className="uppercase">
            {item.priority}
          </Badge>
          <span
            className={
              item.isCompleted
                ? "line-through text-muted-foreground"
                : "text-sm font-medium"
            }
          >
            {item.title}
          </span>
          {item.description && (
            <CardDescription className="line-clamp-2 text-muted-foreground text-xs/relaxed">
              {item.description}
            </CardDescription>
          )}
        </CardTitle>

        <CardAction>
          <Button variant="ghost" size="icon">
            <HugeiconsIcon icon={MoreHorizontalIcon} />
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  );
};
