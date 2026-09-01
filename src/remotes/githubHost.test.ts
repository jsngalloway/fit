import { describe, it, expect } from 'vitest';
import { resolveGitHubHost, tokenCreationUrl, treeUrl } from './githubHost';

describe('resolveGitHubHost', () => {
	it.each([
		['', 'https://api.github.com', 'https://github.com'],
		['github.com', 'https://api.github.com', 'https://github.com'],
		['  https://github.com/  ', 'https://api.github.com', 'https://github.com'],
		['github.example.com', 'https://github.example.com/api/v3', 'https://github.example.com'],
		['https://github.example.com/api/v3', 'https://github.example.com/api/v3', 'https://github.example.com'],
		['http://git.internal', 'http://git.internal/api/v3', 'http://git.internal'],
	])('resolves %j to the right base URLs', (githubHost, apiBaseUrl, webBaseUrl) => {
		const urls = resolveGitHubHost(githubHost);
		expect(urls.apiBaseUrl).toBe(apiBaseUrl);
		expect(urls.webBaseUrl).toBe(webBaseUrl);
	});
});

describe('web URLs', () => {
	it('links the classic token page on every host', () => {
		expect(tokenCreationUrl(resolveGitHubHost('github.example.com')))
			.toBe('https://github.example.com/settings/tokens/new?description=Obsidian%20FIT&scopes=repo');
		expect(tokenCreationUrl(resolveGitHubHost('')))
			.toBe('https://github.com/settings/tokens/new?description=Obsidian%20FIT&scopes=repo');
	});

	it('builds tree URLs on the configured host', () => {
		expect(treeUrl(resolveGitHubHost('github.example.com'), 'alice', 'vault', 'main'))
			.toBe('https://github.example.com/alice/vault/tree/main');
	});
});
