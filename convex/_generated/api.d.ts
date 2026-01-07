/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_actions from "../ai/actions.js";
import type * as ai_bookmarks_actions from "../ai/bookmarks/actions.js";
import type * as ai_tools_firecrawlAgent from "../ai/tools/firecrawlAgent.js";
import type * as aiactions from "../aiactions.js";
import type * as auth from "../auth.js";
import type * as bookmarks_bookmarkCollectionFunctions from "../bookmarks/bookmarkCollectionFunctions.js";
import type * as bookmarks_bookmarkFunctions from "../bookmarks/bookmarkFunctions.js";
import type * as http from "../http.js";
import type * as itemFunctions from "../itemFunctions.js";
import type * as listFunctions from "../listFunctions.js";
import type * as myFunctions from "../myFunctions.js";
import type * as thread_mutations from "../thread/mutations.js";
import type * as thread_queries from "../thread/queries.js";
import type * as threadMessages_mutations from "../threadMessages/mutations.js";
import type * as threadMessages_queries from "../threadMessages/queries.js";
import type * as userFunctions from "../userFunctions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/actions": typeof ai_actions;
  "ai/bookmarks/actions": typeof ai_bookmarks_actions;
  "ai/tools/firecrawlAgent": typeof ai_tools_firecrawlAgent;
  aiactions: typeof aiactions;
  auth: typeof auth;
  "bookmarks/bookmarkCollectionFunctions": typeof bookmarks_bookmarkCollectionFunctions;
  "bookmarks/bookmarkFunctions": typeof bookmarks_bookmarkFunctions;
  http: typeof http;
  itemFunctions: typeof itemFunctions;
  listFunctions: typeof listFunctions;
  myFunctions: typeof myFunctions;
  "thread/mutations": typeof thread_mutations;
  "thread/queries": typeof thread_queries;
  "threadMessages/mutations": typeof threadMessages_mutations;
  "threadMessages/queries": typeof threadMessages_queries;
  userFunctions: typeof userFunctions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
