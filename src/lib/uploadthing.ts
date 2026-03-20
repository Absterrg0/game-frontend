import { generateReactHelpers } from '@uploadthing/react';
import { getBackendUrl } from '@/lib/api/client';

const backendUrl = getBackendUrl()?.replace(/\/$/, '');
const uploadthingApiUrl = backendUrl ? `${backendUrl}/api/uploadthing` : '/api/uploadthing';

function toRequestUrl(input: RequestInfo | URL): string {
	if (typeof input === 'string') return input;
	if (input instanceof URL) return input.toString();
	if (input instanceof Request) return input.url;
	return String(input);
}

function isUploadthingApiRequest(requestUrl: string): boolean {
	if (requestUrl.startsWith('/api/uploadthing')) return true;

	if (!backendUrl) return false;

	try {
		const resolved = new URL(requestUrl, window.location.origin);
		const backendOrigin = new URL(backendUrl).origin;
		return resolved.origin === backendOrigin && resolved.pathname.startsWith('/api/uploadthing');
	} catch {
		return false;
	}
}

const uploadthingFetch: typeof fetch = (input, init) => {
	const requestUrl = toRequestUrl(input);
	const shouldIncludeCredentials = isUploadthingApiRequest(requestUrl);

	return fetch(input, shouldIncludeCredentials ? { ...init, credentials: 'include' } : init);
};


export const { useUploadThing } = generateReactHelpers({
	url: uploadthingApiUrl,
	fetch: uploadthingFetch,
});