/**
 * GitHub Host Resolution
 *
 * Resolves the configured host into the API base URL used by Octokit
 * this handles differentiating github.com and self-hosted github instances - though they use the same api
 */

const DOTCOM_WEB_URL = "https://github.com";
const DOTCOM_API_URL = "https://api.github.com";

/** Hosts that resolve to github.com rather than an Enterprise Server instance. */
const DOTCOM_ALIASES = new Set(["github.com", "www.github.com", "api.github.com"]);

/**
 * Origin for user-facing links, e.g. "https://github.example.com". Accepts:
 * - hostnames: github.example.com
 * - urls: https://github.example.com
 * - api urls: https://github.example.com/api/v3
 *
 * @param githubHost - The githubHost setting; empty means github.com
 */
export function webBaseUrl(githubHost: string): string {
	const configured = githubHost.trim();
	const schemeMatch = configured.match(/^(https?):\/\/(.*)$/i);
	const host = (schemeMatch ? schemeMatch[2] : configured)
		.replace(/\/+$/, "")
		.replace(/\/api\/v3$/i, "");

	if (host === "" || DOTCOM_ALIASES.has(host.toLowerCase())) {
		return DOTCOM_WEB_URL;
	}
	const scheme = schemeMatch ? schemeMatch[1].toLowerCase() : "https";
	return `${scheme}://${host}`;
}

/** Octokit baseUrl for the configured host. */
export function apiBaseUrl(githubHost: string): string {
	const webUrl = webBaseUrl(githubHost);
	// github.com is the only host that serves its API from a separate origin
	return webUrl === DOTCOM_WEB_URL ? DOTCOM_API_URL : `${webUrl}/api/v3`;
}

/**
 * URL of the classic token creation page, pre-filled with the access FIT needs.
 * fine-grained tokens also work, but are not turned on for all instances
 */
export function tokenCreationUrl(githubHost: string): string {
	return `${webBaseUrl(githubHost)}/settings/tokens/new?description=Obsidian%20FIT&scopes=repo`;
}

/** URL of the web view of a repository at a branch or commit. */
export function treeUrl(githubHost: string, owner: string, repo: string, ref: string): string {
	return `${webBaseUrl(githubHost)}/${owner}/${repo}/tree/${ref}`;
}
