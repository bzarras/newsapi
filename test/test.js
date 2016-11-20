'use strict';

let should = require('should'),
  NewsAPI = require('../index');

if (!process.env.API_KEY) throw new Error('No API Key specified. Please create an environment variable named API_KEY');
let newsapi = new NewsAPI(process.env.API_KEY);

describe('NewsAPI', function () {
  describe('Sources', function () {
    it('should return "ok" and a list of sources', function (done) {
      newsapi.sources().then(res => {
        res.status.should.equal('ok');
        should.exist(res.sources);
        done();
      }).catch(done);
    });
  });

  describe('Articles', function () {
    it('should return "ok" and a list of articles for a valid source', function (done) {
      const sourceId = 'buzzfeed';
      newsapi.articles({
        source: sourceId
      }).then(articlesRes => {
        articlesRes.status.should.equal('ok');
        should.exist(articlesRes.articles);
        done();
      }).catch(done);
    });
  });
});
