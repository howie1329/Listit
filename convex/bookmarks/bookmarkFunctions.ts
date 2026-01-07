import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// Helper function to create searchText from bookmark fields
function createSearchText(
  title: string,
  description: string | undefined,
  url: string,
  tags: string[],
): string {
  const parts = [title, description ?? "", url, ...tags].filter(Boolean);
  return parts.join(" ").toLowerCase();
}

export const getBookmarks = query({
  args: {
    includeArchived: v.optional(v.boolean()),
    includePinned: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("bookmarks"),
      userId: v.id("users"),
      url: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      favicon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      screenshot: v.optional(v.string()),
      summary: v.optional(v.string()),
      extractedContent: v.optional(v.string()),
      tags: v.array(v.string()),
      collectionId: v.optional(v.id("bookmarkCollections")),
      isArchived: v.boolean(),
      isDeleted: v.boolean(),
      isPinned: v.boolean(),
      isRead: v.boolean(),
      isPublic: v.boolean(),
      _creationTime: v.number(),
      createdAt: v.string(),
      updatedAt: v.string(),
      readAt: v.optional(v.string()),
      readingTime: v.optional(v.number()),
      searchText: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    // Filter by archived/pinned if specified
    return bookmarks.filter((bookmark) => {
      if (args.includeArchived === false && bookmark.isArchived) {
        return false;
      }
      if (args.includePinned === true && !bookmark.isPinned) {
        return false;
      }
      return true;
    });
  },
});

export const getBookmark = query({
  args: {
    bookmarkId: v.id("bookmarks"),
  },
  returns: v.union(
    v.object({
      _id: v.id("bookmarks"),
      userId: v.id("users"),
      url: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      favicon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      screenshot: v.optional(v.string()),
      summary: v.optional(v.string()),
      extractedContent: v.optional(v.string()),
      tags: v.array(v.string()),
      collectionId: v.optional(v.id("bookmarkCollections")),
      isArchived: v.boolean(),
      isDeleted: v.boolean(),
      isPinned: v.boolean(),
      isRead: v.boolean(),
      isPublic: v.boolean(),
      _creationTime: v.number(),
      createdAt: v.string(),
      updatedAt: v.string(),
      readAt: v.optional(v.string()),
      readingTime: v.optional(v.number()),
      searchText: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      return null;
    }
    return bookmark;
  },
});

export const searchBookmarks = query({
  args: {
    searchQuery: v.string(),
    includeArchived: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("bookmarks"),
      userId: v.id("users"),
      url: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      favicon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      screenshot: v.optional(v.string()),
      summary: v.optional(v.string()),
      extractedContent: v.optional(v.string()),
      tags: v.array(v.string()),
      collectionId: v.optional(v.id("bookmarkCollections")),
      isArchived: v.boolean(),
      isDeleted: v.boolean(),
      isPinned: v.boolean(),
      isRead: v.boolean(),
      isPublic: v.boolean(),
      _creationTime: v.number(),
      createdAt: v.string(),
      updatedAt: v.string(),
      readAt: v.optional(v.string()),
      readingTime: v.optional(v.number()),
      searchText: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withSearchIndex("search_bookmarks", (q) =>
        q
          .search("searchText", args.searchQuery)
          .eq("userId", userId)
          .eq("isDeleted", false),
      )
      .collect();
    // Filter by archived status if specified
    if (args.includeArchived === false) {
      return bookmarks.filter((bookmark) => !bookmark.isArchived);
    }
    return bookmarks;
  },
});

export const getBookmarksByCollection = query({
  args: {
    collectionId: v.id("bookmarkCollections"),
  },
  returns: v.array(
    v.object({
      _id: v.id("bookmarks"),
      userId: v.id("users"),
      url: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      favicon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      screenshot: v.optional(v.string()),
      summary: v.optional(v.string()),
      extractedContent: v.optional(v.string()),
      tags: v.array(v.string()),
      collectionId: v.optional(v.id("bookmarkCollections")),
      isArchived: v.boolean(),
      isDeleted: v.boolean(),
      isPinned: v.boolean(),
      isRead: v.boolean(),
      isPublic: v.boolean(),
      _creationTime: v.number(),
      createdAt: v.string(),
      updatedAt: v.string(),
      readAt: v.optional(v.string()),
      readingTime: v.optional(v.number()),
      searchText: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("collectionId"), args.collectionId),
          q.eq(q.field("isDeleted"), false),
        ),
      )
      .collect();
    return bookmarks;
  },
});

export const getArchivedBookmarks = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("bookmarks"),
      userId: v.id("users"),
      url: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      favicon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      screenshot: v.optional(v.string()),
      summary: v.optional(v.string()),
      extractedContent: v.optional(v.string()),
      tags: v.array(v.string()),
      collectionId: v.optional(v.id("bookmarkCollections")),
      isArchived: v.boolean(),
      isDeleted: v.boolean(),
      isPinned: v.boolean(),
      isRead: v.boolean(),
      isPublic: v.boolean(),
      _creationTime: v.number(),
      createdAt: v.string(),
      updatedAt: v.string(),
      readAt: v.optional(v.string()),
      readingTime: v.optional(v.number()),
      searchText: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId_archived", (q) =>
        q.eq("userId", userId).eq("isArchived", true),
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();
    return bookmarks;
  },
});

export const getPinnedBookmarks = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("bookmarks"),
      userId: v.id("users"),
      url: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      favicon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      screenshot: v.optional(v.string()),
      summary: v.optional(v.string()),
      extractedContent: v.optional(v.string()),
      tags: v.array(v.string()),
      collectionId: v.optional(v.id("bookmarkCollections")),
      isArchived: v.boolean(),
      isDeleted: v.boolean(),
      isPinned: v.boolean(),
      isRead: v.boolean(),
      isPublic: v.boolean(),
      _creationTime: v.number(),
      createdAt: v.string(),
      updatedAt: v.string(),
      readAt: v.optional(v.string()),
      readingTime: v.optional(v.number()),
      searchText: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isPinned"), true),
          q.eq(q.field("isDeleted"), false),
        ),
      )
      .collect();
    return bookmarks;
  },
});

export const checkDuplicateBookmark = query({
  args: {
    url: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("bookmarks"),
      userId: v.id("users"),
      url: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      favicon: v.optional(v.string()),
      thumbnail: v.optional(v.string()),
      screenshot: v.optional(v.string()),
      summary: v.optional(v.string()),
      extractedContent: v.optional(v.string()),
      tags: v.array(v.string()),
      collectionId: v.optional(v.id("bookmarkCollections")),
      isArchived: v.boolean(),
      isDeleted: v.boolean(),
      isPinned: v.boolean(),
      isRead: v.boolean(),
      isPublic: v.boolean(),
      _creationTime: v.number(),
      createdAt: v.string(),
      updatedAt: v.string(),
      readAt: v.optional(v.string()),
      readingTime: v.optional(v.number()),
      searchText: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("isDeleted"), false),
        ),
      )
      .first();
    return bookmark ?? null;
  },
});

export const createBookmark = mutation({
  args: {
    url: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    favicon: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    screenshot: v.optional(v.string()),
    summary: v.optional(v.string()),
    extractedContent: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    collectionId: v.optional(v.id("bookmarkCollections")),
    isPublic: v.optional(v.boolean()),
    readingTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const now = new Date().toISOString();
    const searchText = createSearchText(
      args.title,
      args.description,
      args.url,
      args.tags ?? [],
    );
    return await ctx.db.insert("bookmarks", {
      userId: userId,
      url: args.url,
      title: args.title,
      description: args.description,
      favicon: args.favicon,
      thumbnail: args.thumbnail,
      screenshot: args.screenshot,
      summary: args.summary,
      extractedContent: args.extractedContent,
      tags: args.tags ?? [],
      collectionId: args.collectionId,
      isArchived: false,
      isDeleted: false,
      isPinned: false,
      isRead: false,
      isPublic: args.isPublic ?? false,
      createdAt: now,
      updatedAt: now,
      readingTime: args.readingTime,
      searchText: searchText,
    });
  },
});

export const updateBookmark = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    favicon: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    screenshot: v.optional(v.string()),
    summary: v.optional(v.string()),
    extractedContent: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    collectionId: v.optional(v.id("bookmarkCollections")),
    isPublic: v.optional(v.boolean()),
    readingTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("You are not authorized to update this bookmark");
    }
    const updatedTitle = args.title ?? bookmark.title;
    const updatedDescription = args.description ?? bookmark.description;
    const updatedTags = args.tags ?? bookmark.tags;
    const searchText = createSearchText(
      updatedTitle,
      updatedDescription,
      bookmark.url,
      updatedTags,
    );
    const updateData: {
      updatedAt: string;
      searchText: string;
      title?: string;
      description?: string;
      favicon?: string;
      thumbnail?: string;
      screenshot?: string;
      summary?: string;
      extractedContent?: string;
      tags?: string[];
      collectionId?: Id<"bookmarkCollections">;
      isPublic?: boolean;
      readingTime?: number;
    } = {
      updatedAt: new Date().toISOString(),
      searchText: searchText,
    };
    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined)
      updateData.description = args.description;
    if (args.favicon !== undefined) updateData.favicon = args.favicon;
    if (args.thumbnail !== undefined) updateData.thumbnail = args.thumbnail;
    if (args.screenshot !== undefined) updateData.screenshot = args.screenshot;
    if (args.summary !== undefined) updateData.summary = args.summary;
    if (args.extractedContent !== undefined)
      updateData.extractedContent = args.extractedContent;
    if (args.tags !== undefined) updateData.tags = args.tags;
    if (args.collectionId !== undefined)
      updateData.collectionId = args.collectionId;
    if (args.isPublic !== undefined) updateData.isPublic = args.isPublic;
    if (args.readingTime !== undefined)
      updateData.readingTime = args.readingTime;
    return await ctx.db.patch(args.bookmarkId, updateData);
  },
});

export const softDeleteBookmark = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("You are not authorized to delete this bookmark");
    }
    return await ctx.db.patch(args.bookmarkId, {
      isDeleted: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const hardDeleteBookmark = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("You are not authorized to delete this bookmark");
    }
    if (!bookmark) {
      throw new Error("Bookmark not found");
    }
    await ctx.db.delete(args.bookmarkId);
  },
});

export const archiveBookmark = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("You are not authorized to archive this bookmark");
    }
    if (!bookmark) {
      throw new Error("Bookmark not found");
    }
    return await ctx.db.patch(args.bookmarkId, {
      isArchived: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const unarchiveBookmark = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("You are not authorized to unarchive this bookmark");
    }
    return await ctx.db.patch(args.bookmarkId, {
      isArchived: false,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const pinBookmark = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("You are not authorized to pin this bookmark");
    }
    await ctx.db.patch(args.bookmarkId, {
      isPinned: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const unpinBookmark = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("You are not authorized to unpin this bookmark");
    }
    return await ctx.db.patch(args.bookmarkId, {
      isPinned: false,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const markAsRead = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("You are not authorized to update this bookmark");
    }
    return await ctx.db.patch(args.bookmarkId, {
      isRead: true,
      readAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

export const markAsUnread = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("You are not authorized to update this bookmark");
    }
    return await ctx.db.patch(args.bookmarkId, {
      isRead: false,
      readAt: undefined,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const addTags = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("You are not authorized to update this bookmark");
    }
    const existingTags = bookmark.tags;
    const newTags = [...new Set([...existingTags, ...args.tags])];
    const searchText = createSearchText(
      bookmark.title,
      bookmark.description,
      bookmark.url,
      newTags,
    );
    return await ctx.db.patch(args.bookmarkId, {
      tags: newTags,
      searchText: searchText,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const removeTags = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("You are not authorized to update this bookmark");
    }
    const existingTags = bookmark.tags;
    const newTags = existingTags.filter((tag) => !args.tags.includes(tag));
    const searchText = createSearchText(
      bookmark.title,
      bookmark.description,
      bookmark.url,
      newTags,
    );
    return await ctx.db.patch(args.bookmarkId, {
      tags: newTags,
      searchText: searchText,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateCollection = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
    collectionId: v.optional(v.id("bookmarkCollections")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark || bookmark.userId !== userId) {
      throw new Error("You are not authorized to update this bookmark");
    }
    // If collectionId is provided, verify it belongs to the user
    if (args.collectionId) {
      const collection = await ctx.db.get(args.collectionId);
      if (!collection || collection.userId !== userId) {
        throw new Error("Collection not found or unauthorized");
      }
    }
    return await ctx.db.patch(args.bookmarkId, {
      collectionId: args.collectionId,
      updatedAt: new Date().toISOString(),
    });
  },
});
