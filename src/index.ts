/**
 * This module provides access to the News API
 * https://newsapi.org/
 *
 * The API provides access to recent news headlines
 * from many popular news sources.
 *
 * The author of this code has no formal relationship with NewsAPI.org and does not
 * claim to have created any of the facilities provided by NewsAPI.org.
 */

//GLOBALS
import fetch = require('node-fetch');
import qs = require('querystring');
const host = 'https://newsapi.org';

// Per-instance configuration, kept out of the public object so that multiple clients
// don't overwrite each other's API key or proxy
const configs = new WeakMap<NewsAPI, { apiKey: string, corsProxyUrl: string }>();

// The public signatures live in the `NewsAPI` namespace at the bottom of this file. The implementations below
// take their arguments untyped and sort them out in splitArgsIntoOptionsAndCallback.

class NewsAPI {
  declare v2: NewsAPI.V2;

  constructor(apiKey: string, options: NewsAPI.ClientOptions = {}) {
    if (!apiKey) throw new Error('No API key specified');

    configs.set(this, {
      apiKey,
      corsProxyUrl: options.corsProxyUrl || ''
    });
    const request = (...requestArgs: [string, any[], NewsAPI.Params?]) => makeRequest(this, ...requestArgs);

    // Bound so they keep working when destructured off the client, as they did before
    this.sources = this.sources.bind(this);
    this.articles = this.articles.bind(this);

    this.v2 = {
      topHeadlines(...args: any[]) {
        return request('/v2/top-headlines', args, { language: 'en' });
      },

      everything(...args: any[]) {
        return request('/v2/everything', args);
      },

      sources(...args: any[]) {
        return request('/v2/sources', args);
      }
    };
  }

  /** @deprecated Part of the legacy v1 API. Use `v2.sources` instead. */
  sources(params?: NewsAPI.Params, options?: NewsAPI.RequestOptions & { showHeaders?: false }): Promise<NewsAPI.LegacyResponse>;
  sources(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions & { showHeaders: true }): Promise<NewsAPI.WithHeaders<NewsAPI.LegacyResponse>>;
  sources<R = void>(cb: NewsAPI.Callback<NewsAPI.LegacyResponse, R>): Promise<R>;
  sources<R = void>(params: NewsAPI.Params | undefined, cb: NewsAPI.Callback<NewsAPI.LegacyResponse, R>): Promise<R>;
  sources<R = void>(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions & { showHeaders?: false }, cb: NewsAPI.Callback<NewsAPI.LegacyResponse, R>): Promise<R>;
  sources<R = void>(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions & { showHeaders: true }, cb: NewsAPI.Callback<NewsAPI.WithHeaders<NewsAPI.LegacyResponse>, R>): Promise<R>;
  sources(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions): Promise<NewsAPI.LegacyResponse | NewsAPI.WithHeaders<NewsAPI.LegacyResponse>>;
  sources<R = void>(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions, cb: NewsAPI.Callback<NewsAPI.LegacyResponse | NewsAPI.WithHeaders<NewsAPI.LegacyResponse>, R>): Promise<R>;
  sources(...args: any[]): Promise<any> {
    return makeRequest(this, '/v1/sources', args, undefined, false);
  }

  /** @deprecated Part of the legacy v1 API. */
  articles(params?: NewsAPI.Params, options?: NewsAPI.RequestOptions & { showHeaders?: false }): Promise<NewsAPI.LegacyResponse>;
  articles(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions & { showHeaders: true }): Promise<NewsAPI.WithHeaders<NewsAPI.LegacyResponse>>;
  articles<R = void>(cb: NewsAPI.Callback<NewsAPI.LegacyResponse, R>): Promise<R>;
  articles<R = void>(params: NewsAPI.Params | undefined, cb: NewsAPI.Callback<NewsAPI.LegacyResponse, R>): Promise<R>;
  articles<R = void>(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions & { showHeaders?: false }, cb: NewsAPI.Callback<NewsAPI.LegacyResponse, R>): Promise<R>;
  articles<R = void>(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions & { showHeaders: true }, cb: NewsAPI.Callback<NewsAPI.WithHeaders<NewsAPI.LegacyResponse>, R>): Promise<R>;
  articles(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions): Promise<NewsAPI.LegacyResponse | NewsAPI.WithHeaders<NewsAPI.LegacyResponse>>;
  articles<R = void>(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions, cb: NewsAPI.Callback<NewsAPI.LegacyResponse | NewsAPI.WithHeaders<NewsAPI.LegacyResponse>, R>): Promise<R>;
  articles(...args: any[]): Promise<any> {
    return makeRequest(this, '/v1/articles', args);
  }
}

class NewsAPIError extends Error {
  declare code: string;
  declare status: number;

  constructor(err: { code: string, message: string }, httpStatus: number) {
    super(err.message);
    // The name format is kept for backwards compatibility. Use `code` to check for specific errors.
    this.name = `NewsAPIError: ${err.code}`;
    this.code = err.code;
    this.status = httpStatus;
  }
}

/**
 * Sends a request to an endpoint using the configuration of the given client.
 * @param {NewsAPI} client        The client making the request
 * @param {String}  endpoint      The API endpoint, e.g. '/v2/everything'
 * @param {Array}   args          The arguments passed to the public method
 * @param {Object}  [defaultParams] Params to use if none were provided
 * @param {Boolean} [useApiKey]   Whether to send the API key
 * @return {Promise<Object>}
 */
function makeRequest(client: NewsAPI, endpoint: string, args: any[], defaultParams?: NewsAPI.Params, useApiKey = true): Promise<any> {
  const config = configs.get(client)!;
  const { params = defaultParams, options, cb } = splitArgsIntoOptionsAndCallback(args);
  const url = createUrlFromEndpointAndOptions(config.corsProxyUrl, endpoint, params);
  return getDataFromWeb(url, options, useApiKey ? config.apiKey : null, cb);
}

/**
 * Takes a variable-length array that represents arguments to a function and attempts to split it into
 * an 'options' object and a 'cb' callback function.
 * @param {Array}   args The arguments to the function
 * @return {Object}
 */
function splitArgsIntoOptionsAndCallback(args: any[]): { params?: NewsAPI.Params, options?: NewsAPI.RequestOptions, cb?: NewsAPI.Callback<any, any> } {
  let params;
  let options;
  let cb;
  if (args.length > 1) {
    const possibleCb = args[args.length - 1];
    if ('function' === typeof possibleCb) {
      cb = possibleCb;
      options = args.length === 3 ? args[1] : undefined;
    } else {
      options = args[1];
    }
    params = args[0];
  } else if ('object' === typeof args[0]) {
    params = args[0];
  } else if ('function' === typeof args[0]) {
    cb = args[0];
  }
  return { params, options, cb };
}

/**
 * Creates a url string from an endpoint and an options object by prepending the
 * "host" const (and an optional CORS proxy) to the endpoint and appending the
 * options as querystring parameters.
 * @param {String} corsProxyUrl
 * @param {String} endpoint
 * @param {Object} [options]
 * @return {String}
 */
function createUrlFromEndpointAndOptions(corsProxyUrl: string, endpoint: string, options?: NewsAPI.Params): string {
  const query = qs.stringify(options as qs.ParsedUrlQueryInput | undefined);
  const baseURL = `${corsProxyUrl}${host}${endpoint}`;
  return query ? `${baseURL}?${query}` : baseURL;
}

/**
 * Parses a response body as JSON. Responses that aren't JSON (e.g. an HTML error page
 * from a proxy) are turned into a NewsAPIError instead of a JSON parse error.
 * @param  {Response} res
 * @return {Promise<Object>}
 */
function parseResponseBody(res: fetch.Response): Promise<any> {
  return res.text().then(text => {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new NewsAPIError({
        code: 'invalidResponse',
        message: `Expected a JSON response from News API but received HTTP ${res.status} ${res.statusText}`
      }, res.status);
    }
  });
}

/**
 * Takes a URL string and returns a Promise containing
 * the parsed JSON response from the web.
 * @param  {String}   url      A URL String
 * @param  {Object}   [options]  Request options: noCache, showHeaders
 * @param  {String}   [apiKey]   A key to be used for authentication
 * @param  {Function} [cb]       Node-style callback
 * @return {Promise<Object>}
 */
function getDataFromWeb(url: string, options?: NewsAPI.RequestOptions, apiKey?: string | null, cb?: NewsAPI.Callback<any, any>): Promise<any> {
  // Note: requests are sent without CORS headers. 'Access-Control-Allow-Origin' is a response header,
  // and sending it with a request only causes browsers to make a preflight request.
  const reqOptions: fetch.RequestInit & { headers: Record<string, string> } = { headers: {} };
  if (apiKey) {
    reqOptions.headers['X-Api-Key'] = apiKey;
  }
  if (options && options.noCache === true) {
    reqOptions.headers['X-No-Cache'] = 'true';
  }
  let useCallback = 'function' === typeof cb;
  return fetch(url, reqOptions).then(res => parseResponseBody(res).then(body => {
    if (body.status === 'error') throw new NewsAPIError(body, res.status);
    // 'showHeaders' option can be used for clients to debug response headers
    // response will be in form of { headers, body }
    if (options && options.showHeaders) {
      if (useCallback) return cb!(null, { headers: res.headers, body });
      return { headers: res.headers, body };
    }
    if (useCallback) return cb!(null, body);
    return body;
  })).catch(err => {
    if (useCallback) return cb!(err);
    throw err;
  });
}

// Type-only declarations: this namespace merges with the class above and adds nothing at runtime.
type NewsAPIErrorInstance = NewsAPIError;
type NewsAPIErrorConstructor = typeof NewsAPIError;

declare namespace NewsAPI {
  /** Options for the `NewsAPI` constructor. */
  interface ClientOptions {
    /** A proxy URL that is prepended to each request URL. */
    corsProxyUrl?: string;
  }

  /** Per-request options, passed after the query parameters. */
  interface RequestOptions {
    /** Send `X-No-Cache: true` to skip News API's cache. */
    noCache?: boolean;
    /** Resolve with `{ headers, body }` instead of just the body. */
    showHeaders?: boolean;
  }

  /** The subset of the fetch `Headers` object that is useful to callers. */
  interface ResponseHeaders {
    get(name: string): string | null;
    has(name: string): boolean;
    forEach(callback: (value: string, name: string) => void): void;
  }

  /** What a request resolves with when `showHeaders: true` is passed. */
  interface WithHeaders<T> {
    headers: ResponseHeaders;
    body: T;
  }

  /** Node-style callback. What it returns is what the request's promise resolves with. */
  type Callback<T, R = void> = (err: Error | null, result?: T) => R;

  type Category = 'business' | 'entertainment' | 'general' | 'health' | 'science' | 'sports' | 'technology';
  type Language = 'ar' | 'de' | 'en' | 'es' | 'fr' | 'he' | 'it' | 'nl' | 'no' | 'pt' | 'ru' | 'sv' | 'ud' | 'zh';

  /** https://newsapi.org/docs/endpoints/top-headlines */
  interface TopHeadlinesParams {
    /** Keywords or a phrase to search for. */
    q?: string;
    /** A 2-letter ISO 3166-1 country code. Can't be mixed with `sources`. */
    country?: string;
    /** Can't be mixed with `sources`. */
    category?: Category;
    /** Comma-separated source IDs. Can't be mixed with `country` or `category`. */
    sources?: string;
    /** Defaults to `'en'` when no params are passed at all. */
    language?: Language;
    pageSize?: number;
    page?: number;
  }

  /** https://newsapi.org/docs/endpoints/everything */
  interface EverythingParams {
    /** Keywords or a phrase to search for. */
    q?: string;
    /** Keywords or a phrase to search for in the article title only. */
    qInTitle?: string;
    /** Comma-separated fields to restrict `q` to: `title`, `description`, `content`. */
    searchIn?: string;
    /** Comma-separated source IDs. */
    sources?: string;
    /** Comma-separated domains, e.g. `bbc.co.uk,techcrunch.com`. */
    domains?: string;
    excludeDomains?: string;
    /** ISO 8601 date or date-time, e.g. `2017-12-01`. */
    from?: string;
    /** ISO 8601 date or date-time. */
    to?: string;
    language?: Language;
    sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
    pageSize?: number;
    page?: number;
  }

  /** https://newsapi.org/docs/endpoints/sources */
  interface SourcesParams {
    category?: Category;
    language?: Language;
    country?: string;
  }

  /** Query parameters for the legacy v1 methods, which are passed along untouched. */
  type Params = { [param: string]: string | number | boolean | undefined };

  interface Article {
    source: { id: string | null, name: string };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    /** ISO 8601 date-time. */
    publishedAt: string;
    content: string | null;
  }

  interface Source {
    id: string;
    name: string;
    description: string;
    url: string;
    category: Category;
    language: Language;
    country: string;
  }

  /** Successful response of `v2.topHeadlines` and `v2.everything`. Errors reject with a `NewsAPIError`. */
  interface ArticlesResponse {
    status: 'ok';
    totalResults: number;
    articles: Article[];
  }

  /** Successful response of `v2.sources`. */
  interface SourcesResponse {
    status: 'ok';
    sources: Source[];
  }

  /** Successful response of the legacy v1 methods. */
  interface LegacyResponse {
    status: 'ok';
    [key: string]: unknown;
  }

  /**
   * A v2 endpoint. It returns a promise, or takes a node-style callback as its last argument,
   * and resolves with `{ headers, body }` when `showHeaders: true` is passed.
   */
  interface Method<P, T> {
    (params?: P, options?: RequestOptions & { showHeaders?: false }): Promise<T>;
    (params: P | undefined, options: RequestOptions & { showHeaders: true }): Promise<WithHeaders<T>>;
    <R = void>(cb: Callback<T, R>): Promise<R>;
    <R = void>(params: P | undefined, cb: Callback<T, R>): Promise<R>;
    <R = void>(params: P | undefined, options: RequestOptions & { showHeaders?: false }, cb: Callback<T, R>): Promise<R>;
    <R = void>(params: P | undefined, options: RequestOptions & { showHeaders: true }, cb: Callback<WithHeaders<T>, R>): Promise<R>;
    // Fallbacks for options whose showHeaders isn't known at compile time, e.g. a RequestOptions variable
    (params: P | undefined, options: RequestOptions): Promise<T | WithHeaders<T>>;
    <R = void>(params: P | undefined, options: RequestOptions, cb: Callback<T | WithHeaders<T>, R>): Promise<R>;
  }

  interface V2 {
    topHeadlines: Method<TopHeadlinesParams, ArticlesResponse>;
    everything: Method<EverythingParams, ArticlesResponse>;
    sources: Method<SourcesParams, SourcesResponse>;
  }

  type NewsAPIError = NewsAPIErrorInstance;
  var NewsAPIError: NewsAPIErrorConstructor;
}

NewsAPI.NewsAPIError = NewsAPIError;

export = NewsAPI;
