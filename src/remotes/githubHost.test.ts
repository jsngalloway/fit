import { describe, it, expect } from 'vitest';
import { apiBaseUrl, tokenCreationUrl, treeUrl, webBaseUrl } from './githubHost';

describe('githubHost', () => {
	it.each([
		['', 'https://api.github.com', 'https://github.com'],
		['github.com', 'https://api.github.com', 'https://github.com'],
		['  https://github.com/  ', 'https://api.github.com', 'https://github.com'],
		['github.example.com', 'https://github.example.com/api/v3', 'https://github.example.com'],
		['https://github.example.com/api/v3', 'https://github.example.com/api/v3', 'https://github.example.com'],
		['http://git.internal', 'http://git.internal/api/v3', 'http://git.internal'],
	])('resolves %j to the right base URLs', (githubHost, expectedApiUrl, expectedWebUrl) => {
		expect(apiBaseUrl(githubHost)).toBe(expectedApiUrl);
		expect(webBaseUrl(githubHost)).toBe(expectedWebUrl);
	});

	it('links the classic token page on every host', () => {
		expect(tokenCreationUrl('github.example.com'))
			.toBe('https://github.example.com/settings/tokens/new?description=Obsidian%20FIT&scopes=repo');
		expect(tokenCreationUrl(''))
			.toBe('https://github.com/settings/tokens/new?description=Obsidian%20FIT&scopes=repo');
	});

	it('builds tree URLs on the configured host', () => {
		expect(treeUrl('github.example.com', 'alice', 'vault', 'main'))
			.toBe('https://github.example.com/alice/vault/tree/main');
	});
});
