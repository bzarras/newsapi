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
function getDataFromWeb(url, cb) {
  let useCallback = 'function' === typeof cb;
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let buf;
      res.on('data', data => {
        if (!buf) buf = data;
        else buf = Buffer.concat([buf, data]);
      });
      res.on('end', () => {
        try {
          let data = JSON.parse(buf.toString('utf8'));
          if (useCallback) return cb(null, data);
          resolve(data);
        } catch (err) {
          if (useCallback) return cb(err);
          reject(err);
        }
      });
      res.on('error', err => {
        if (useCallback) return cb(err);
        reject(err);
      });
    });
  });
}

function getSources(...args) {
  let params;
  let cb;
  if (args.length > 1) {
    params = args[0];
    cb = args[1];
  } else if ('object' === typeof args[0]) {
    params = args[0];
  } else if ('function' === typeof args[0]) {
    cb = args[0];
  }
  let url = constructSourcesURL(params);
  return getDataFromWeb(url, cb);
}

function getArticles(params, cb) {
  let url = constructArticlesURL(params);
  return getDataFromWeb(url, cb);
}

module.exports = function (apiKey) {
  if (!apiKey) throw new Error('No API key specified');
  API_KEY = apiKey;

  this.sources = getSources;
  this.articles = getArticles;
};
