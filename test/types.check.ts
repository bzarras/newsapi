// Compile-time checks for the public types. Run with `npm run typecheck`; there is nothing to execute.
import NewsAPI = require('../src/index');

const newsapi = new NewsAPI('key', { corsProxyUrl: 'https://proxy.example.com/' });

// Type equality helper: assigning a value of type A to a variable of type B fails to compile if they differ
function expectType<T>(_value: T) {}

// Promises
newsapi.v2.topHeadlines({ q: 'bitcoin', category: 'business', country: 'us' }).then(res => {
  expectType<'ok'>(res.status);
  expectType<NewsAPI.Article[]>(res.articles);
  expectType<number>(res.totalResults);
});
newsapi.v2.everything({ q: 'bitcoin', sortBy: 'publishedAt', from: '2017-12-01' }).then(res => expectType<string>(res.articles[0].title));
newsapi.v2.sources({ language: 'en' }).then(res => expectType<NewsAPI.Source[]>(res.sources));
newsapi.v2.sources();

// showHeaders changes what the promise resolves with
newsapi.v2.everything({ q: 'a' }, { showHeaders: true }).then(res => {
  expectType<string | null>(res.headers.get('x-cache'));
  expectType<NewsAPI.Article[]>(res.body.articles);
});
newsapi.v2.everything({ q: 'a' }, { noCache: true }).then(res => expectType<NewsAPI.Article[]>(res.articles));

// Callbacks, with the promise resolving with the callback's return value
newsapi.v2.everything({ q: 'a' }, (err, res) => {
  expectType<Error | null>(err);
  expectType<NewsAPI.ArticlesResponse | undefined>(res);
});
newsapi.v2.topHeadlines((err, res) => 'done').then(value => expectType<string>(value));
newsapi.v2.sources({}, { noCache: true }, (err, res) => {});
newsapi.v2.sources(undefined, { showHeaders: true }, (err, res) => {
  expectType<NewsAPI.ResponseHeaders | undefined>(res?.headers);
});

// Legacy v1
newsapi.articles({ source: 'associated-press', sortBy: 'top' }).then(res => expectType<'ok'>(res.status));
newsapi.sources((err, res) => {});

// Errors
const err = new NewsAPI.NewsAPIError({ code: 'rateLimited', message: 'slow down' }, 429);
expectType<string>(err.code);
expectType<number>(err.status);
expectType<Error>(err);
function isNewsAPIError(e: unknown): e is NewsAPI.NewsAPIError {
  return e instanceof NewsAPI.NewsAPIError;
}

// Things that must not compile
// @ts-expect-error unknown param
newsapi.v2.everything({ query: 'typo' });
// @ts-expect-error `sortBy` is not a top-headlines param
newsapi.v2.topHeadlines({ sortBy: 'popularity' });
// @ts-expect-error invalid category
newsapi.v2.sources({ category: 'weather' });
// @ts-expect-error page must be a number
newsapi.v2.everything({ q: 'a', page: '2' });
// @ts-expect-error the API key is required
new NewsAPI();
// @ts-expect-error the callback result is optional, so it can't be used without a check
newsapi.v2.sources({}, (err, res) => res.sources);
