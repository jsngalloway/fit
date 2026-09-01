/**
 * GitHub Host Resolution
 *
 * Resolves the configured host into the API base URL used by Octokit and the web
 * base URL used for browser links. GitHub Enterprise Server serves the same v3
 * REST API as github.com under /api/v3, so pointing both at a different origin is
 * all that separates a self-hosted instance from github.com.
 *
 * Note: this is host resolution for GitHub only, not provider selection. GitLab and
 * Gitea need different API clients — see the TODO in githubConnection.ts.
 */

export const DOTCOM_HOST = "github.com";

/** Hosts that resolve to github.com rather than an Enterprise Server instance. */
const DOTCOM_ALIASES = new Set([DOTCOM_HOST, "www.github.com", "api.github.com"]);

/** Where to reach a configured GitHub host, for API calls and for browser links. */
export interface GitHubHostUrls {
	host: string;         // Bare hostname, e.g. "github.com" or "github.example.com"
	apiBaseUrl: string;   // Octokit baseUrl, e.g. "https://api.github.com"
	webBaseUrl: string;   // Origin for user-facing links, e.g. "https://github.com"
	isEnterprise: boolean;
}

const DOTCOM_URLS: GitHubHostUrls = {
	host: DOTCOM_HOST,
	apiBaseUrl: "https://api.github.com",
	webBaseUrl: "https://github.com",
	isEnterprise: false,
};

/**
 * Resolve the githubHost setting into API and web base URLs.
 *
 * Accepts bare hostnames ("github.example.com"), full URLs ("https://github.example.com")
 * and API URLs ("https://github.example.com/api/v3"), since users copy whichever of the
 * three they have at hand. An explicit http:// scheme is preserved for instances that
 * aren't served over TLS; everything else defaults to https.
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
		.replace(/\/api\/v3$/i, "")   // user pasted the API URL instead of the host
		.replace(/\/+$/, "");

	if (DOTCOM_ALIASES.has(host.toLowerCase())) {
		return DOTCOM_URLS;
	}

	const webBaseUrl = `${scheme}://${host}`;
	return {
		host,
		apiBaseUrl: `${webBaseUrl}/api/v3`,
		webBaseUrl,
		isEnterprise: true,
	};
}

/**
 * URL of the token creation page, pre-filled with the access FIT needs.
 *
 * Enterprise Server gets the classic token page: fine-grained tokens have to be
 * enabled by the instance administrator, while classic tokens are always available.
 * The `repo` scope is the narrowest classic scope that grants Contents: Read and Write.
 */
export function tokenCreationUrl(urls: GitHubHostUrls): string {
	if (urls.isEnterprise) {
		return `${urls.webBaseUrl}/settings/tokens/new?description=Obsidian%20FIT&scopes=repo`;
	}
	return `${urls.webBaseUrl}/settings/personal-access-tokens/new?name=Obsidian%20FIT&description=Obsidian%20FIT%20plugin&contents=write`;
}

/** URL of the web view of a repository at a branch or commit. */
export function treeUrl(urls: GitHubHostUrls, owner: string, repo: string, ref: string): string {
	return `${urls.webBaseUrl}/${owner}/${repo}/tree/${ref}`;
}
