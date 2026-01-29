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
import type * as auth from "../auth.js";
import type * as bookmarks_bookmarkCollectionFunctions from "../bookmarks/bookmarkCollectionFunctions.js";
import type * as bookmarks_bookmarkFunctions from "../bookmarks/bookmarkFunctions.js";
import type * as chatmemory_mutations from "../chatmemory/mutations.js";
import type * as chatmemory_queries from "../chatmemory/queries.js";
import type * as http from "../http.js";
import type * as items_ai_actions from "../items/ai/actions.js";
import type * as items_mutations from "../items/mutations.js";
import type * as items_queries from "../items/queries.js";
import type * as lib_modelMapping from "../lib/modelMapping.js";
import type * as mastra_storage from "../mastra/storage.js";
import type * as search_query from "../search/query.js";
import type * as thread_mutations from "../thread/mutations.js";
import type * as thread_queries from "../thread/queries.js";
import type * as threadMessages_mutations from "../threadMessages/mutations.js";
import type * as threadMessages_queries from "../threadMessages/queries.js";
import type * as threadtools_mutation from "../threadtools/mutation.js";
import type * as threadtools_queries from "../threadtools/queries.js";
import type * as uiMessages_mutation from "../uiMessages/mutation.js";
import type * as uiMessages_queries from "../uiMessages/queries.js";
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
  auth: typeof auth;
  "bookmarks/bookmarkCollectionFunctions": typeof bookmarks_bookmarkCollectionFunctions;
  "bookmarks/bookmarkFunctions": typeof bookmarks_bookmarkFunctions;
  "chatmemory/mutations": typeof chatmemory_mutations;
  "chatmemory/queries": typeof chatmemory_queries;
  http: typeof http;
  "items/ai/actions": typeof items_ai_actions;
  "items/mutations": typeof items_mutations;
  "items/queries": typeof items_queries;
  "lib/modelMapping": typeof lib_modelMapping;
  "mastra/storage": typeof mastra_storage;
  "search/query": typeof search_query;
  "thread/mutations": typeof thread_mutations;
  "thread/queries": typeof thread_queries;
  "threadMessages/mutations": typeof threadMessages_mutations;
  "threadMessages/queries": typeof threadMessages_queries;
  "threadtools/mutation": typeof threadtools_mutation;
  "threadtools/queries": typeof threadtools_queries;
  "uiMessages/mutation": typeof uiMessages_mutation;
  "uiMessages/queries": typeof uiMessages_queries;
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
