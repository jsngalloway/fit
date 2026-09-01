/**
 * GitHub Host Resolution
 *
 * Resolves the configured host into the API base URL used by Octokit
 * this handles differentiating github.com and self-hosted github instances - though they use the same api
 */

/** Hosts that resolve to github.com rather than an Enterprise Server instance. */
const DOTCOM_ALIASES = new Set(["github.com", "www.github.com", "api.github.com"]);

/** Where to reach a configured GitHub host, for API calls and for browser links. */
export interface GitHubHostUrls {
	apiBaseUrl: string;   // Octokit baseUrl, e.g. "https://api.github.com"
	webBaseUrl: string;   // Origin for user-facing links, e.g. "https://github.com"
}

// default hosts used when a specific host is not specified
const DOTCOM_URLS: GitHubHostUrls = {
	apiBaseUrl: "https://api.github.com",
	webBaseUrl: "https://github.com",
};

/**
 * Resolve the githubHost setting into API and web base URLs. Accepts:
 * - hostnames: github.example.com
 * - urls: https://github.example.com
 * - api urls: https://github.example.com/api/v3
 *
 * @param githubHost - The githubHost setting; empty means github.com
 */
export function resolveGitHubHost(githubHost: string): GitHubHostUrls {
	const configured = githubHost.trim();
	if (configured === "") {
		return DOTCOM_URLS;
	}

	const schemeMatch = configured.match(/^(https?):\/\/(.*)$/i);
	const scheme = schemeMatch ? schemeMatch[1].toLowerCase() : "https";
	const host = (schemeMatch ? schemeMatch[2] : configured)
		.replace(/\/+$/, "")
		.replace(/\/api\/v3$/i, "");

	if (DOTCOM_ALIASES.has(host.toLowerCase())) {
		return DOTCOM_URLS;
	}

	const webBaseUrl = `${scheme}://${host}`;
	return {
		apiBaseUrl: `${webBaseUrl}/api/v3`,
		webBaseUrl,
	};
}

/**
 * URL of the classic token creation page, pre-filled with the access FIT needs.
 * fine-grained tokens also work, but are not turned on for all instances
 */
export function tokenCreationUrl(urls: GitHubHostUrls): string {
	return `${urls.webBaseUrl}/settings/tokens/new?description=Obsidian%20FIT&scopes=repo`;
}

/** URL of the web view of a repository at a branch or commit. */
export function treeUrl(urls: GitHubHostUrls, owner: string, repo: string, ref: string): string {
	return `${urls.webBaseUrl}/${owner}/${repo}/tree/${ref}`;
}
