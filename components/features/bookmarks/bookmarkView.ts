import { Id } from "@/convex/_generated/dataModel";

export type BookmarkView =
  | { kind: "all" }
  | { kind: "pinned" }
  | { kind: "read" }
  | { kind: "archived" }
  | { kind: "collection"; collectionId: Id<"bookmarkCollections"> };
