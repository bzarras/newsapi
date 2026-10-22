# Release Notes

## How to release
Releases are staged on npm by the [Release workflow](.github/workflows/release.yml) when a GitHub Release is published,
and go live once a maintainer approves them.
1. In a pull request, bump the version with `npm version <patch|minor> --no-git-tag-version` and add release notes below.
2. After it's merged, [create a GitHub Release](https://github.com/bzarras/newsapi/releases/new) on `master` with a new tag
   matching the version (e.g. `v2.5.0`) and the release notes. Mark it as a pre-release to publish under the `next` tag instead of `latest`.
3. The workflow checks that the tag matches `package.json`, runs the tests, and stages the version on npm with provenance.
4. Approve the staged version with 2FA on [npmjs.com](https://www.npmjs.com/package/newsapi) under Staged Packages, or with
   `npm stage list` and `npm stage approve <stage-id>`. To cancel, reject it with `npm stage reject <stage-id>`.

npm accepts releases from GitHub Actions through a stage-only [trusted publisher](https://docs.npmjs.com/trusted-publishers/)
(workflow `release.yml`, environment `npm`), so no npm token is stored in the repository.

The major version of this library matches the version of the News API it wraps, so changes must not break current consumers.

## v2.5.0
Date: 2026-10-21  
Type: Minor  
This release makes the following changes, updates, and bug fixes:
1. Add TypeScript type definitions (`dist/index.d.ts`), generated from the now TypeScript source in `src/index.ts`. The compiled JavaScript output is unchanged.
2. Only publish `dist/` (plus the README, LICENSE and `package.json`) to npm, instead of also including `src/`, `test/` and the TypeScript configs.

## v2.4.2
Date: 2026-10-21  
Type: Patch  
This release makes the following changes, updates, and bug fixes:
1. Fix multiple `NewsAPI` instances overwriting each other's API key and CORS proxy URL.
2. Stop sending the `Access-Control-Allow-Origin` header and `mode: 'cors'` with requests. `Access-Control-Allow-Origin` is a response header, and sending it caused browsers to make CORS preflight requests that News API rejects.
3. Non-JSON responses (e.g. an HTML error page from a proxy) are now reported as a `NewsAPIError` instead of a JSON parse error.
4. `NewsAPIError` now has `code` and `status` properties, and is exported as `NewsAPI.NewsAPIError`.
5. Update dependencies to resolve security vulnerabilities.

## v2.4.1
Date: 2020-07-22  
Type: Patch  
This release makes the following changes, updates, and bug fixes:
1. Add the `corsProxyUrl` constructor option.

## v2.4.0
Date: 2018-09-16  
Type: Minor  
This release makes the following changes, updates, and bug fixes:
1. Add babel build step to provide compatibility with ES5 environments

## v2.3.0
Date: 2018-07-31  
Type: Minor  
This release makes the following changes, updates, and bug fixes:
1. Update mocha to eliminate vulnerabilities.
2. Remove use of bluebird. Use native promises instead.

## v2.2.2
Date: 2018-03-26  
Type: Patch  
This release makes the following changes, updates, and bug fixes:
1. Remove use of Promise.spread() to improve compatibility with react native.

## v2.2.1
Date: 2018-03-24  
Type: Patch  
This release makes the following changes, updates, and bug fixes:
1. Switch from `request` to `node-fetch` for http requests in order to support more platforms.
