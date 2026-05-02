import type { RequestHandler } from './$types';
import {
	authedConvex,
	readJsonObject,
	requireString,
	runApiAction,
	api
} from '$lib/server/api-routes';
import type { Id } from '../../../convex/_generated/dataModel';

export const POST: RequestHandler = async (event) => {
	const convex = authedConvex(event.request);
	const body = await readJsonObject(event.request);
	const message = requireString(body.message, 'message');
	const threadId =
		body.threadId === undefined
			? undefined
			: (requireString(body.threadId, 'threadId') as Id<'chatThreads'>);

	return await runApiAction(event, async () => {
		return await convex.action(api.ai.chat, { threadId, message });
	});
};
