import type { RequestHandler } from './$types';
import { authedConvex, runApiAction, api } from '$lib/server/api-routes';
import type { Id } from '../../../../../convex/_generated/dataModel';

export const POST: RequestHandler = async (event) => {
	const convex = authedConvex(event.request);
	return await runApiAction(event, async () => {
		return await convex.action(api.ai.generateAutoNote, {
			bookmarkId: event.params.bookmarkId as Id<'bookmarks'>
		});
	});
};
