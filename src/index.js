'use strict';
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
const fetch = require('node-fetch'),
  qs = require('querystring'),
  host = 'https://newsapi.org';

// Per-instance configuration, kept out of the public object so that multiple clients
// don't overwrite each other's API key or proxy
const configs = new WeakMap();

class NewsAPI {
  constructor(apiKey, options = {}) {
    if (!apiKey) throw new Error('No API key specified');

    configs.set(this, {
      apiKey,
      corsProxyUrl: options.corsProxyUrl || ''
    });
    const request = (...requestArgs) => makeRequest(this, ...requestArgs);

    // Bound so they keep working when destructured off the client, as they did before
    this.sources = this.sources.bind(this);
    this.articles = this.articles.bind(this);

    this.v2 = {
      topHeadlines(...args) {
        return request('/v2/top-headlines', args, { language: 'en' });
      },

      everything(...args) {
        return request('/v2/everything', args);
      },

      sources(...args) {
        return request('/v2/sources', args);
      }
    };
  }

  sources(...args) {
    return makeRequest(this, '/v1/sources', args, undefined, false);
  }

  articles(...args) {
    return makeRequest(this, '/v1/articles', args);
  }
}

class NewsAPIError extends Error {
  constructor(err, httpStatus) {
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
function makeRequest(client, endpoint, args, defaultParams, useApiKey = true) {
  const config = configs.get(client);
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
function splitArgsIntoOptionsAndCallback(args) {
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
function createUrlFromEndpointAndOptions(corsProxyUrl, endpoint, options) {
  const query = qs.stringify(options);
  const baseURL = `${corsProxyUrl}${host}${endpoint}`;
  return query ? `${baseURL}?${query}` : baseURL;
}

/**
 * Parses a response body as JSON. Responses that aren't JSON (e.g. an HTML error page
 * from a proxy) are turned into a NewsAPIError instead of a JSON parse error.
 * @param  {Response} res
 * @return {Promise<Object>}
 */
function parseResponseBody(res) {
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
function getDataFromWeb(url, options, apiKey, cb) {
  // Note: requests are sent without CORS headers. 'Access-Control-Allow-Origin' is a response header,
  // and sending it with a request only causes browsers to make a preflight request.
  const reqOptions = { headers: {} };
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
      if (useCallback) return cb(null, { headers: res.headers, body });
      return { headers: res.headers, body };
    }
    if (useCallback) return cb(null, body);
    return body;
  })).catch(err => {
    if (useCallback) return cb(err);
    throw err;
  });
}

NewsAPI.NewsAPIError = NewsAPIError;

module.exports = NewsAPI;
