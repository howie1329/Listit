import type { RequestHandler } from './$types';
import {
	authedConvex,
	readJsonObject,
	requireString,
	runApiAction,
	api
} from '$lib/server/api-routes';

export const POST: RequestHandler = async (event) => {
	const convex = authedConvex(event.request);
	const body = await readJsonObject(event.request);
	const question = requireString(body.question, 'question');

	return await runApiAction(event, async () => {
		return await convex.action(api.ai.ask, { question });
	});
};
