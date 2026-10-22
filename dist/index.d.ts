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
declare class NewsAPI {
    v2: NewsAPI.V2;
    constructor(apiKey: string, options?: NewsAPI.ClientOptions);
    /** @deprecated Part of the legacy v1 API. Use `v2.sources` instead. */
    sources(params?: NewsAPI.Params, options?: NewsAPI.RequestOptions & {
        showHeaders?: false;
    }): Promise<NewsAPI.LegacyResponse>;
    sources(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions & {
        showHeaders: true;
    }): Promise<NewsAPI.WithHeaders<NewsAPI.LegacyResponse>>;
    sources<R = void>(cb: NewsAPI.Callback<NewsAPI.LegacyResponse, R>): Promise<R>;
    sources<R = void>(params: NewsAPI.Params | undefined, cb: NewsAPI.Callback<NewsAPI.LegacyResponse, R>): Promise<R>;
    sources<R = void>(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions & {
        showHeaders?: false;
    }, cb: NewsAPI.Callback<NewsAPI.LegacyResponse, R>): Promise<R>;
    sources<R = void>(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions & {
        showHeaders: true;
    }, cb: NewsAPI.Callback<NewsAPI.WithHeaders<NewsAPI.LegacyResponse>, R>): Promise<R>;
    /** @deprecated Part of the legacy v1 API. */
    articles(params?: NewsAPI.Params, options?: NewsAPI.RequestOptions & {
        showHeaders?: false;
    }): Promise<NewsAPI.LegacyResponse>;
    articles(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions & {
        showHeaders: true;
    }): Promise<NewsAPI.WithHeaders<NewsAPI.LegacyResponse>>;
    articles<R = void>(cb: NewsAPI.Callback<NewsAPI.LegacyResponse, R>): Promise<R>;
    articles<R = void>(params: NewsAPI.Params | undefined, cb: NewsAPI.Callback<NewsAPI.LegacyResponse, R>): Promise<R>;
    articles<R = void>(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions & {
        showHeaders?: false;
    }, cb: NewsAPI.Callback<NewsAPI.LegacyResponse, R>): Promise<R>;
    articles<R = void>(params: NewsAPI.Params | undefined, options: NewsAPI.RequestOptions & {
        showHeaders: true;
    }, cb: NewsAPI.Callback<NewsAPI.WithHeaders<NewsAPI.LegacyResponse>, R>): Promise<R>;
}
declare class NewsAPIError extends Error {
    code: string;
    status: number;
    constructor(err: {
        code: string;
        message: string;
    }, httpStatus: number);
}
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
    type Params = {
        [param: string]: string | number | boolean | undefined;
    };
    interface Article {
        source: {
            id: string | null;
            name: string;
        };
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
        (params?: P, options?: RequestOptions & {
            showHeaders?: false;
        }): Promise<T>;
        (params: P | undefined, options: RequestOptions & {
            showHeaders: true;
        }): Promise<WithHeaders<T>>;
        <R = void>(cb: Callback<T, R>): Promise<R>;
        <R = void>(params: P | undefined, cb: Callback<T, R>): Promise<R>;
        <R = void>(params: P | undefined, options: RequestOptions & {
            showHeaders?: false;
        }, cb: Callback<T, R>): Promise<R>;
        <R = void>(params: P | undefined, options: RequestOptions & {
            showHeaders: true;
        }, cb: Callback<WithHeaders<T>, R>): Promise<R>;
    }
    interface V2 {
        topHeadlines: Method<TopHeadlinesParams, ArticlesResponse>;
        everything: Method<EverythingParams, ArticlesResponse>;
        sources: Method<SourcesParams, SourcesResponse>;
    }
    type NewsAPIError = NewsAPIErrorInstance;
    var NewsAPIError: NewsAPIErrorConstructor;
}
export = NewsAPI;
