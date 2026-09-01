import { describe, it, expect } from 'vitest';
import { resolveGitHubHost, tokenCreationUrl, treeUrl } from './githubHost';

describe('resolveGitHubHost', () => {
	it.each([
		['', 'https://api.github.com', 'https://github.com', false],
		['github.com', 'https://api.github.com', 'https://github.com', false],
		['  https://github.com/  ', 'https://api.github.com', 'https://github.com', false],
		['github.example.com', 'https://github.example.com/api/v3', 'https://github.example.com', true],
		['https://github.example.com/api/v3', 'https://github.example.com/api/v3', 'https://github.example.com', true],
		['http://git.internal', 'http://git.internal/api/v3', 'http://git.internal', true],
	])('resolves %j to the right base URLs', (githubHost, apiBaseUrl, webBaseUrl, isEnterprise) => {
		const urls = resolveGitHubHost(githubHost as string);
		expect(urls.apiBaseUrl).toBe(apiBaseUrl);
		expect(urls.webBaseUrl).toBe(webBaseUrl);
		expect(urls.isEnterprise).toBe(isEnterprise);
	});
});

describe('web URLs', () => {
	it('links the classic token page on Enterprise Server, fine-grained on github.com', () => {
		expect(tokenCreationUrl(resolveGitHubHost('github.example.com')))
			.toBe('https://github.example.com/settings/tokens/new?description=Obsidian%20FIT&scopes=repo');
		expect(tokenCreationUrl(resolveGitHubHost(''))).toContain('https://github.com/settings/personal-access-tokens/new');
	});

	it('builds tree URLs on the configured host', () => {
		expect(treeUrl(resolveGitHubHost('github.example.com'), 'alice', 'vault', 'main'))
			.toBe('https://github.example.com/alice/vault/tree/main');
	});
});
