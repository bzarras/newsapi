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
require("core-js/modules/es.symbol.js");
require("core-js/modules/es.symbol.description.js");
require("core-js/modules/es.symbol.iterator.js");
require("core-js/modules/es.symbol.to-primitive.js");
require("core-js/modules/es.array.index-of.js");
require("core-js/modules/es.date.to-primitive.js");
require("core-js/modules/es.date.to-string.js");
require("core-js/modules/es.map.js");
require("core-js/modules/es.number.constructor.js");
require("core-js/modules/es.object.create.js");
require("core-js/modules/es.object.define-property.js");
require("core-js/modules/es.object.get-prototype-of.js");
require("core-js/modules/es.object.set-prototype-of.js");
require("core-js/modules/es.reflect.construct.js");
require("core-js/modules/es.regexp.to-string.js");
require("core-js/modules/es.array.concat.js");
require("core-js/modules/es.array.iterator.js");
require("core-js/modules/es.function.bind.js");
require("core-js/modules/es.function.name.js");
require("core-js/modules/es.object.keys.js");
require("core-js/modules/es.object.to-string.js");
require("core-js/modules/es.string.iterator.js");
require("core-js/modules/es.weak-map.js");
require("core-js/modules/web.dom-collections.iterator.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _wrapNativeSuper(t) { var r = "function" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !_isNativeFunction(t)) return t; if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return _construct(t, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, t); }, _wrapNativeSuper(t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != _typeof(t) || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
var fetch = require('node-fetch'),
  qs = require('querystring'),
  host = 'https://newsapi.org';

// Per-instance configuration, kept out of the public object so that multiple clients
// don't overwrite each other's API key or proxy
var configs = new WeakMap();
var NewsAPI = /*#__PURE__*/function () {
  function NewsAPI(apiKey) {
    var _this = this;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, NewsAPI);
    if (!apiKey) throw new Error('No API key specified');
    configs.set(this, {
      apiKey: apiKey,
      corsProxyUrl: options.corsProxyUrl || ''
    });
    var request = function request() {
      for (var _len = arguments.length, requestArgs = new Array(_len), _key = 0; _key < _len; _key++) {
        requestArgs[_key] = arguments[_key];
      }
      return makeRequest.apply(void 0, [_this].concat(requestArgs));
    };

    // Bound so they keep working when destructured off the client, as they did before
    this.sources = this.sources.bind(this);
    this.articles = this.articles.bind(this);
    this.v2 = {
      topHeadlines: function topHeadlines() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        return request('/v2/top-headlines', args, {
          language: 'en'
        });
      },
      everything: function everything() {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }
        return request('/v2/everything', args);
      },
      sources: function sources() {
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }
        return request('/v2/sources', args);
      }
    };
  }
  return _createClass(NewsAPI, [{
    key: "sources",
    value: function sources() {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }
      return makeRequest(this, '/v1/sources', args, undefined, false);
    }
  }, {
    key: "articles",
    value: function articles() {
      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }
      return makeRequest(this, '/v1/articles', args);
    }
  }]);
}();
var NewsAPIError = /*#__PURE__*/function (_Error) {
  function NewsAPIError(err, httpStatus) {
    var _this2;
    _classCallCheck(this, NewsAPIError);
    _this2 = _callSuper(this, NewsAPIError, [err.message]);
    // The name format is kept for backwards compatibility. Use `code` to check for specific errors.
    _this2.name = "NewsAPIError: ".concat(err.code);
    _this2.code = err.code;
    _this2.status = httpStatus;
    return _this2;
  }
  _inherits(NewsAPIError, _Error);
  return _createClass(NewsAPIError);
}(/*#__PURE__*/_wrapNativeSuper(Error));
/**
 * Sends a request to an endpoint using the configuration of the given client.
 * @param {NewsAPI} client        The client making the request
 * @param {String}  endpoint      The API endpoint, e.g. '/v2/everything'
 * @param {Array}   args          The arguments passed to the public method
 * @param {Object}  [defaultParams] Params to use if none were provided
 * @param {Boolean} [useApiKey]   Whether to send the API key
 * @return {Promise<Object>}
 */
function makeRequest(client, endpoint, args, defaultParams) {
  var useApiKey = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  var config = configs.get(client);
  var _splitArgsIntoOptions = splitArgsIntoOptionsAndCallback(args),
    _splitArgsIntoOptions2 = _splitArgsIntoOptions.params,
    params = _splitArgsIntoOptions2 === void 0 ? defaultParams : _splitArgsIntoOptions2,
    options = _splitArgsIntoOptions.options,
    cb = _splitArgsIntoOptions.cb;
  var url = createUrlFromEndpointAndOptions(config.corsProxyUrl, endpoint, params);
  return getDataFromWeb(url, options, useApiKey ? config.apiKey : null, cb);
}

/**
 * Takes a variable-length array that represents arguments to a function and attempts to split it into
 * an 'options' object and a 'cb' callback function.
 * @param {Array}   args The arguments to the function
 * @return {Object}
 */
function splitArgsIntoOptionsAndCallback(args) {
  var params;
  var options;
  var cb;
  if (args.length > 1) {
    var possibleCb = args[args.length - 1];
    if ('function' === typeof possibleCb) {
      cb = possibleCb;
      options = args.length === 3 ? args[1] : undefined;
    } else {
      options = args[1];
    }
    params = args[0];
  } else if ('object' === _typeof(args[0])) {
    params = args[0];
  } else if ('function' === typeof args[0]) {
    cb = args[0];
  }
  return {
    params: params,
    options: options,
    cb: cb
  };
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
  var query = qs.stringify(options);
  var baseURL = "".concat(corsProxyUrl).concat(host).concat(endpoint);
  return query ? "".concat(baseURL, "?").concat(query) : baseURL;
}

/**
 * Parses a response body as JSON. Responses that aren't JSON (e.g. an HTML error page
 * from a proxy) are turned into a NewsAPIError instead of a JSON parse error.
 * @param  {Response} res
 * @return {Promise<Object>}
 */
function parseResponseBody(res) {
  return res.text().then(function (text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new NewsAPIError({
        code: 'invalidResponse',
        message: "Expected a JSON response from News API but received HTTP ".concat(res.status, " ").concat(res.statusText)
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
  var reqOptions = {
    headers: {}
  };
  if (apiKey) {
    reqOptions.headers['X-Api-Key'] = apiKey;
  }
  if (options && options.noCache === true) {
    reqOptions.headers['X-No-Cache'] = 'true';
  }
  var useCallback = 'function' === typeof cb;
  return fetch(url, reqOptions).then(function (res) {
    return parseResponseBody(res).then(function (body) {
      if (body.status === 'error') throw new NewsAPIError(body, res.status);
      // 'showHeaders' option can be used for clients to debug response headers
      // response will be in form of { headers, body }
      if (options && options.showHeaders) {
        if (useCallback) return cb(null, {
          headers: res.headers,
          body: body
        });
        return {
          headers: res.headers,
          body: body
        };
      }
      if (useCallback) return cb(null, body);
      return body;
    });
  })["catch"](function (err) {
    if (useCallback) return cb(err);
    throw err;
  });
}
NewsAPI.NewsAPIError = NewsAPIError;
module.exports = NewsAPI;