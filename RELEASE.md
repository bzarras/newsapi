# Release Notes

## Unreleased
Type: Patch  
This release makes the following changes, updates, and bug fixes:
1. Fix multiple `NewsAPI` instances overwriting each other's API key and CORS proxy URL.
2. Stop sending the `Access-Control-Allow-Origin` header and `mode: 'cors'` with requests. `Access-Control-Allow-Origin` is a response header, and sending it caused browsers to make CORS preflight requests that News API rejects.
3. Fix callbacks being called a second time if the callback itself throws.
4. Non-JSON responses (e.g. an HTML error page from a proxy) and unsuccessful HTTP statuses are now reported as a `NewsAPIError` instead of a JSON parse error or a successful response.
5. `NewsAPIError` now has `code` and `status` properties, and is exported as `NewsAPI.NewsAPIError`.
6. Update dependencies to resolve security vulnerabilities.

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
