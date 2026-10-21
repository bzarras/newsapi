'use strict';

const should = require('should');
const nock = require('nock');
const NewsAPI = require('../dist/index');

const host = 'https://newsapi.org';

describe('NewsAPI', function () {
  before(function () {
    nock.disableNetConnect();
  });

  afterEach(function () {
    nock.cleanAll();
  });

  after(function () {
    nock.enableNetConnect();
  });

  describe('constructor', function () {
    it('should throw if no API key is provided', function () {
      should.throws(() => new NewsAPI(), /No API key specified/);
    });

    it('should keep the API key of each instance separate', async function () {
      const first = new NewsAPI('first-key');
      const second = new NewsAPI('second-key');
      const scope = nock(host)
        .get('/v2/sources')
        .matchHeader('X-Api-Key', 'first-key')
        .reply(200, { status: 'ok', sources: [] })
        .get('/v2/sources')
        .matchHeader('X-Api-Key', 'second-key')
        .reply(200, { status: 'ok', sources: [] });
      await first.v2.sources();
      await second.v2.sources();
      scope.done();
    });

    it('should keep the CORS proxy of each instance separate', async function () {
      const proxied = new NewsAPI('key', { corsProxyUrl: 'https://proxy.example.com/' });
      const direct = new NewsAPI('key');
      const proxyScope = nock('https://proxy.example.com')
        .get('/https://newsapi.org/v2/sources')
        .reply(200, { status: 'ok', sources: [] });
      const directScope = nock(host)
        .get('/v2/sources')
        .reply(200, { status: 'ok', sources: [] });
      await proxied.v2.sources();
      await direct.v2.sources();
      proxyScope.done();
      directScope.done();
    });
  });

  describe('requests', function () {
    const newsapi = new NewsAPI('test-key');

    it('should send params as a querystring and the API key as a header', async function () {
      const scope = nock(host)
        .get('/v2/everything')
        .query({ q: 'bitcoin', sources: 'bbc-news,the-verge', page: '2' })
        .matchHeader('X-Api-Key', 'test-key')
        .reply(200, { status: 'ok', articles: [] });
      const res = await newsapi.v2.everything({ q: 'bitcoin', sources: 'bbc-news,the-verge', page: 2 });
      res.should.eql({ status: 'ok', articles: [] });
      scope.done();
    });

    it('should default topHeadlines to english when no params are provided', async function () {
      const scope = nock(host)
        .get('/v2/top-headlines')
        .query({ language: 'en' })
        .reply(200, { status: 'ok', articles: [] });
      await newsapi.v2.topHeadlines();
      scope.done();
    });

    it('should not send CORS request headers', async function () {
      const scope = nock(host, { badheaders: ['Access-Control-Allow-Origin'] })
        .get('/v2/sources')
        .reply(200, { status: 'ok', sources: [] });
      await newsapi.v2.sources();
      scope.done();
    });

    it('should send X-No-Cache when noCache is set', async function () {
      const scope = nock(host)
        .get('/v2/everything')
        .query(true)
        .matchHeader('X-No-Cache', 'true')
        .reply(200, { status: 'ok', articles: [] });
      await newsapi.v2.everything({ q: 'test' }, { noCache: true });
      scope.done();
    });

    it('should return headers and body when showHeaders is set', async function () {
      nock(host)
        .get('/v2/everything')
        .query(true)
        .reply(200, { status: 'ok', articles: [] }, { 'X-Cached-Result': 'false' });
      const res = await newsapi.v2.everything({ q: 'test' }, { showHeaders: true });
      res.headers.get('x-cached-result').should.equal('false');
      res.body.status.should.equal('ok');
    });

    it('should not send the API key to v1 sources', async function () {
      const scope = nock(host, { badheaders: ['X-Api-Key'] })
        .get('/v1/sources')
        .reply(200, { status: 'ok', sources: [] });
      await newsapi.sources();
      scope.done();
    });

    it('should send the API key to v1 articles', async function () {
      const scope = nock(host)
        .get('/v1/articles')
        .query({ source: 'bbc-news' })
        .matchHeader('X-Api-Key', 'test-key')
        .reply(200, { status: 'ok', articles: [] });
      await newsapi.articles({ source: 'bbc-news' });
      scope.done();
    });

    it('should keep v1 methods working when destructured', async function () {
      const { articles } = newsapi;
      const scope = nock(host)
        .get('/v1/articles')
        .query({ source: 'bbc-news' })
        .matchHeader('X-Api-Key', 'test-key')
        .reply(200, { status: 'ok', articles: [] });
      await articles({ source: 'bbc-news' });
      scope.done();
    });
  });

  describe('errors', function () {
    const newsapi = new NewsAPI('test-key');

    it('should reject with a NewsAPIError for API errors', async function () {
      nock(host)
        .get('/v2/everything')
        .reply(401, { status: 'error', code: 'apiKeyInvalid', message: 'Your API key is invalid' });
      const err = await newsapi.v2.everything().then(() => null, e => e);
      should.exist(err);
      err.should.be.instanceOf(NewsAPI.NewsAPIError);
      err.should.be.instanceOf(Error);
      err.name.should.equal('NewsAPIError: apiKeyInvalid');
      err.code.should.equal('apiKeyInvalid');
      err.status.should.equal(401);
      err.message.should.equal('Your API key is invalid');
    });

    it('should resolve unsuccessful HTTP statuses without an error body, as before', async function () {
      nock(host)
        .get('/v2/everything')
        .reply(500, { unexpected: true });
      const res = await newsapi.v2.everything();
      res.should.eql({ unexpected: true });
    });

    it('should reject with a NewsAPIError for non-JSON responses', async function () {
      nock(host)
        .get('/v2/everything')
        .reply(502, '<html>Bad Gateway</html>', { 'Content-Type': 'text/html' });
      const err = await newsapi.v2.everything().then(() => null, e => e);
      should.exist(err);
      err.should.be.instanceOf(NewsAPI.NewsAPIError);
      err.code.should.equal('invalidResponse');
      err.status.should.equal(502);
    });
  });

  describe('callbacks', function () {
    const newsapi = new NewsAPI('test-key');

    it('should resolve the returned promise with the return value of the callback', async function () {
      nock(host)
        .get('/v2/sources')
        .reply(200, { status: 'ok', sources: [] });
      const result = await newsapi.v2.sources(() => 'callback result');
      result.should.equal('callback result');
    });

    it('should call the callback with the response', function (done) {
      nock(host)
        .get('/v2/sources')
        .reply(200, { status: 'ok', sources: [] });
      newsapi.v2.sources((err, res) => {
        should.not.exist(err);
        res.status.should.equal('ok');
        done();
      });
    });

    it('should call the callback with params and options', function (done) {
      nock(host)
        .get('/v2/everything')
        .query({ q: 'test' })
        .matchHeader('X-No-Cache', 'true')
        .reply(200, { status: 'ok', articles: [] });
      newsapi.v2.everything({ q: 'test' }, { noCache: true }, (err, res) => {
        should.not.exist(err);
        res.status.should.equal('ok');
        done();
      });
    });

    it('should call the callback with API errors', function (done) {
      nock(host)
        .get('/v2/everything')
        .reply(400, { status: 'error', code: 'parametersMissing', message: 'Missing params' });
      newsapi.v2.everything({}, (err, res) => {
        should.exist(err);
        should.not.exist(res);
        err.code.should.equal('parametersMissing');
        done();
      });
    });
  });
});
