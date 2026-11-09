import type { PageServerLoad } from './$types';

// Runs on the server for every request to /.
export const load: PageServerLoad = () => ({
	renderedAt: new Date().toISOString()
});
