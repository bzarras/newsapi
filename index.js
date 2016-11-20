'use strict';
/**
 * This module provides access to the News API
 * https://newsapi.org/
 *
 * The API provides access to recent news headlines
 * from many popular news sources.
 */

const https = require('https'),
  Promise = require('bluebird'),
  host = 'https://newsapi.org';

let API_KEY; // To be set by clients

/**
 * Takes a params object and returns a url to the articles endpoint
 * @param  {String} params.source The source identifier
 * @param  {String} [params.sortBy] The way to sort the results
 * @return {String}        The URL to the articles endpoint
 */
function constructArticlesURL (params) {
  if (!params.source) throw new Error('params.source is required');
  const baseURL = `${host}/v1/articles`;
  let sortBy = params.sortBy || 'top';
  return `${baseURL}?source=${params.source}&sortBy=${sortBy}&apiKey=${API_KEY}`;
}

/**
 * Takes a params object and returns a url to the sources endpoint
 * @param  {String} [params.category] The category of source
 * @param  {String} [params.language] The language to get results for
 * @param  {String} [params.country] The country to get results for
 * @return {String}        The URL to the sources endpoint
 */
function constructSourcesURL(params) {
  let url = `${host}/v1/sources`;
  if (params) {
    let keys = Object.keys(params).filter(key => params[key]);
    if (keys.length > 0) {
      url += '?'
      keys.forEach((key, index) => {
        url += `${key}=${params[key]}`;
        if (index != keys.length - 1) url += '&'
      });
    }
  }
  return url;
}

/**
 * Takes a URL string and returns a Promise containing
 * a buffer with the data from the web.
 * @param  {String} url A URL String
 * @return {Promise<Buffer>}     A Promise containing a Buffer
 */
function getDataFromWeb(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let buf;
      res.on('data', data => {
        if (!buf) buf = data;
        else buf = Buffer.concat([buf, data]);
      });
      res.on('end', () => {
        resolve(JSON.parse(buf.toString('utf8')));
      });
      res.on('error', err => {
        console.log(`Got error: ${err.message}`);
        reject(err);
      });
    });
  });
}

function getSources(params) {
  let url = constructSourcesURL(params);
  return getDataFromWeb(url);
}

function getArticles(params) {
  let url = constructArticlesURL(params);
  return getDataFromWeb(url);
}

module.exports = function (apiKey) {
  if (!apiKey) throw new Error('No API key specified');
  API_KEY = apiKey;

  this.sources = getSources;
  this.articles = getArticles;
};
