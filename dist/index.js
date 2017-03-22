'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var crypto = _interopDefault(require('crypto'));

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const uriParser = /^(?:(?![^:@]+:[^:@/]*@)([^:/?#.]+:))?(?:\/\/)?(?:([^:@/]*)(?::([^:@/]*))?@)?(\[[0-9a-fA-F.]+]|[^:/?#]*)(?::(\d+|(?=:)))?((?:[^?#](?![^?#/]*\.(?:[?#]|$)))*\/?)?[^?#/]*(?:(\?[^#]*))?(?:(#.*))?/;
function _parseUri(str) {
    var parserKeys = [ 'href', 'protocol', 'username', 'password', 'hostname', 'port', 'pathname', 'search', 'hash' ];
    var m = uriParser.exec(str);
    var parts = {};
    parserKeys.forEach(function(key, i) {
        parts[key] = m[i];
    });
    return parts;
}
function _searchStringToParams(search) {
    let params = [];
    let queryEntries = search.split('&');
    queryEntries.forEach((entry) => {
        let kvp = entry.split('=');
        params.push([ kvp[0], kvp[1] ]);
    });
    return params;
}
class UriSearchParams {
    constructor(searchString) {
        this.params = [];
        if(searchString && searchString !== '') {
            if(searchString[0] === '?') {
                searchString = searchString.slice(1);
            }
            this.params = _searchStringToParams(searchString);
        }
    }
    append(name, value) {
        this.params.push([ name, value ]);
    }
    delete(name) {
        let newParams = [];
        this.params.forEach((pair) => {
            if(pair[0] !== name) {
                newParams.push(pair);
            }
        });
        this.params = newParams;
    }
    get(name) {
        let found = null;
        for(let i = 0; i < this.params.length; i++) {
            if(this.params[i][0] === name) {
                found = this.params[i][1];
                break;
            }
        }
        return found;
    }
    getAll(name) {
        let found = [];
        this.params.forEach((param) => {
            if(param[0] === name) {
                found.push(param[1]);
            }
        });
        return found;
    }
    has(name) {
        let found = false;
        for(let i = 0; i < this.params.length; i++) {
            if(this.params[i][0] === name) {
                found = true;
                break;
            }
        }
        return found;
    }
    set(name, value) {
        let found = false;
        let result = [];
        this.params.forEach((pair) => {
            if(pair[0] === name && !found) {
                pair[1] = value;
                result.push(pair);
                found = true;
            } else if(pair[0] !== name) {
                result.push(pair);
            }
        });
        this.params = result;
    }
    get entries() {
        return this.params;
    }
    get count() {
        return this.params.length;
    }
    toString() {
        return this.params.reduce((previous, current, index) => {
            return `${previous}${index === 0 ? '' : '&'}${current[0]}=${current[1]}`;
        }, '');
    }
}
class UriParser {
    constructor(urlString = '') {
        if(typeof urlString !== 'string') {
            throw new TypeError('Failed to construct \'URL\': The supplied URL must be a string');
        }
        let parts = _parseUri(urlString);
        let protocolExists = typeof parts.protocol !== 'undefined' && parts.protocol !== '';
        let hostExists = typeof parts.hostname !== 'undefined' && parts.hostname !== '';
        if((protocolExists && !hostExists) || (!protocolExists && hostExists)) {
            throw new TypeError('Failed to construct \'URL\': Protocol and hostname must be supplied together');
        }
        if(!protocolExists && !hostExists) {
            this.hostless = true;
        }
        this.parts = parts;
        this.params = new UriSearchParams(this.parts.search);
    }

    // Properties that come directly from the regex
    get protocol() {
        return this.parts.protocol.toLowerCase();
    }
    set protocol(val) {
        this.parts.protocol = val;
    }
    get hostname() {
        return this.parts.hostname;
    }
    set hostname(val) {
        this.parts.hostname = val;
    }
    get port() {
        return this.parts.port || '';
    }
    set port(val) {
        this.parts.port = val;
    }
    get pathname() {
        return this.parts.pathname || '/';
    }
    set pathname(val) {
        this.parts.pathname = val;
    }
    get search() {
        return this.params.entries.length === 0 ? '' : `?${this.params.toString()}`;
    }
    set search(val) {
        this.parts.search = val;
        this.params = new UriSearchParams(val);
    }
    get hash() {
        return this.parts.hash || '';
    }
    set hash(val) {
        this.parts.hash = val;
    }
    get username() {
        return this.parts.username || '';
    }
    set username(val) {
        this.parts.username = val;
    }
    get password() {
        return this.parts.password || '';
    }
    set password(val) {
        this.parts.password = val;
    }

    // Properties computed from various regex parts
    get href() {
        return this.toString();
    }
    set href(val) {
        this.parts = _parseUri(val);
        this.search = this.parts.search;
    }
    get host() {
        let host = this.hostname.toLowerCase();
        if(this.port) {
            host = `${host}:${this.port}`;
        }
        return host;
    }
    set host(val) {
        let hostParts = val.split(':');
        this.hostname = hostParts[0];
        if(hostParts.length > 1) {
            this.port = hostParts[1];
        } else {
            this.port = '';
        }
    }
    get origin() {
        return `${this.protocol}//${this.host}`;
    }
    get searchParams() {
        return this.params;
    }
    set searchParams(val) {
        this.params = val;
        this.parts.search = `?${val.toString()}`;
    }
    toString() {
        var hrefString = '';
        if(!this.hostless) {
            hrefString = `${this.protocol}//`;
            if(this.username && this.username !== '') {
                hrefString = `${hrefString}${this.username}`;
                if(this.password && this.password !== '') {
                    hrefString = `${hrefString}:${this.password}`;
                }
                hrefString = `${hrefString}@`;
            }
        }
        hrefString = `${hrefString}${this.host}${this.pathname}`;
        if(this.search && this.search !== '') {
            hrefString = `${hrefString}${this.search}`;
        }
        if(this.hash && this.hash !== '') {
            hrefString = `${hrefString}${this.hash}`;
        }
        return hrefString;
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A class for parsing and manipulating URIs.
 */
class Uri {

    /**
     * Construct a Uri from a supplied string.
     * @param {String} [url] The URI string to parse. If not supplied, an empty URI will be initialized.
     */
    constructor(url = '') {
        this.parsedUrl = new UriParser(url);
    }

    /**
     * Get the protocol portion of the Uri.
     */
    get protocol() {
        return this.parsedUrl.protocol;
    }

    /**
     * Set the protocol for the Uri.
     * @param {String} protocol The new protocol for the Uri. Must be one of `http:` or `https:`.
     */
    set protocol(protocol) {
        this.parsedUrl.protocol = protocol;
    }

    /**
     * Get the hostname portion of the Uri.
     */
    get hostname() {
        return this.parsedUrl.hostname;
    }

    /**
     * Set the hostname for the Uri.
     * @param {String} hostname The new hostname for the Uri.
     */
    set hostname(hostname) {
        this.parsedUrl.hostname = hostname;
    }

    /**
     * Get the origin portion of the Uri.
     */
    get origin() {
        return this.parsedUrl.origin;
    }

    /**
     * Get the path portion of the Uri.
     */
    get path() {
        return this.parsedUrl.pathname;
    }

    /**
     * Get the search portion of the Uri detailing the query parameters as a string.
     */
    get search() {
        return this.parsedUrl.params.count === 0 ? '' : `?${this.parsedUrl.params.toString()}`;
    }

    /**
     * Get the hash portion of the Uri.
     */
    get hash() {
        return this.parsedUrl.hash;
    }

    /**
     * Get a query parameter value.
     * @param {String} key The key of the query string value to fetch.
     * @returns {String} The value of the query parameter.
     */
    getQueryParam(key) {
        return this.parsedUrl.searchParams.get(key);
    }

    /**
     * Remove a query string parameter from the Uri.
     * @param {String} key The key of the query parameter to remove.
     */
    removeQueryParam(key) {
        this.parsedUrl.searchParams.delete(key);
    }

    /**
     * Additively sets a query string parameter. It is possible to add multiple query parameter values with the same key using this function.
     * @param {String} key The key of the query parameter to add.
     * @param {String|Number|Boolean} value The value of the added query parameter.
     */
    addQueryParam(key, value) {
        const paramVal = value === null || typeof value === 'undefined' ? '' : encodeURIComponent(value);
        this.parsedUrl.searchParams.append(key, paramVal);
    }

    /**
     * Add a batch of query parameters.
     * @param {Object} queryMap A list of key-value pairs to add as query parameters. It is possible to add multiple query parameter values with the same key using this function.
     */
    addQueryParams(queryMap) {
        Object.keys(queryMap).forEach((key) => {
            this.addQueryParam(key, queryMap[key]);
        });
    }

    /**
     * Set the value of an existing query parameter, or add it if it does not exist.
     * @param {String} key The key of the query parameter to add.
     * @param {String|Number|Boolean} value The value of the added query parameter.
     */
    setQueryParam(key, value) {
        this.removeQueryParam(key);
        this.addQueryParam(key, value);
    }

    /**
     * Set a batch of query parameters.
     * @param {Object} queryMap A list of key-value pairs to set as query parameters. If any of the keys of this input object conflict with existing query parameter keys, they will be replaced.
     */
    setQueryParams(queryMap) {
        Object.keys(queryMap).forEach((key) => {
            this.setQueryParam(key, queryMap[key]);
        });
    }

    /**
     * Add path segments to the Uri.
     * @param {...String} segments The segments to be added to the Uri.
     */
    addSegments(...segments) {
        let path = '';
        segments.forEach((segment) => {
            if(Array.isArray(segment)) {
                segment.forEach((arraySegment) => {
                    if(arraySegment[0] === '/') {
                        arraySegment = arraySegment.slice(1);
                    }
                    path = `${path}/${arraySegment}`;
                });
            } else {
                if(segment[0] === '/') {
                    segment = segment.slice(1);
                }
                path = `${path}/${segment}`;
            }
        });
        let pathName = this.parsedUrl.pathname;
        if(pathName === '/') {
            pathName = '';
        }
        this.parsedUrl.pathname = `${pathName}${path}`;
    }

    /**
     * Get a string representation of the current state of the Uri.
     * @returns {String} The Uri string.
     */
    toString() {
        return this.parsedUrl.toString();
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let _defaultHost = '/';
let _defaultOrigin = null;
let _defaultQueryParams = { 'dream.out.format': 'json' };
let _defaultHeaders = { 'X-Deki-Client': 'mindtouch-martian' };
let _defaultToken = null;
let _cookieManager = null;
function _cloneKVPs(obj) {
    const copy = {};
    Object.keys(obj).forEach((key) => {
        copy[key] = obj[key];
    });
    return copy;
}

/**
 * Manage settings for how martian performs API requests.
 */
class Settings {
    static get cookieManager() {
        return _cookieManager;
    }
    static set cookieManager(manager) {
        _cookieManager = manager;
    }
    static get default() {
        return {
            get token() {
                return _defaultToken;
            },
            set token(token) {
                _defaultToken = token;
            },
            get host() {
                return _defaultHost;
            },
            set host(host) {
                _defaultHost = host;
            },
            get origin() {
                return _defaultOrigin;
            },
            set origin(origin) {
                _defaultOrigin = origin;
            },
            get headers() {
                return _defaultHeaders;
            },
            set headers(headers) {
                _defaultHeaders = headers;
            },
            get queryParams() {
                return _defaultQueryParams;
            },
            set queryParams(params) {
                _defaultQueryParams = params;
            },
            reset() {
                _defaultHost = '/';
                _defaultQueryParams = { 'dream.out.format': 'json' };
                _defaultToken = null;
                _defaultHeaders = { 'X-Deki-Client': 'mindtouch-martian' };
                _defaultOrigin = null;
            }
        };
    }

    /**
     * Create a new martian Settings object.
     * @param {Object} [options] The options for the martian settings object.
     * @param {String} [options.host] The URI of the mindtouch site that is hosting the API to access.
     * @param {Object} [options.queryParams] An object mapping query parameter keys with values. Keys and values will both be converted to strings.
     * @param {Object} [options.headers] An object mapping HTTP header keys with values. Keys must be strings, and values will be converted to strings.
     * @param {String|Function} [options.token] A token to allow API access. This will populate the "X-Deki-Token" header. If a function is supplied, it should return the desired token as a string.
     * @param {String} [options.origin] The origin of the API calls.
     */
    constructor({ host = _defaultHost, queryParams = _defaultQueryParams, headers = _defaultHeaders, token = _defaultToken, origin = _defaultOrigin } = {}) {
        this._host = host;
        this._token = token;
        this._origin = origin;
        this._queryParams = _cloneKVPs(queryParams);
        this._headers = _cloneKVPs(headers);
        if(this._origin !== null) {
            const originUri = new Uri(this._origin);
            const hostUri = new Uri(this._host);
            if(originUri.origin === hostUri.origin) {
                this._headers['X-Deki-Requested-With'] = 'XMLHttpRequest';
            }
        }
    }

    /**
     * Get the currently configured host.
     */
    get host() {
        return this._host;
    }

    /**
     * Get the currently configured token.
     */
    get token() {
        return this._token;
    }

    /**
     * Get the currently configured origin.
     */
    get origin() {
        return this._origin;
    }

    /**
     * Get an object that represents the martian settings as they are used by the Plug object.
     */
    get plugConfig() {
        return {
            uriParts: { query: this._queryParams },
            headers: this._headers,
            beforeRequest: (params) => this._beforeRequest(params),
            cookieManager: _cookieManager
        };
    }
    _beforeRequest(params) {
        if(this._token !== null) {
            let token = this._token;
            if(typeof token === 'function') {
                token = this._token();
            }
            params.headers['X-Deki-Token'] = token;
        }
        return params;
    }
}

let tokenHelper = {
    createHelper(key, secret) {
        return () => {
            let hmac = crypto.createHmac('sha256', secret);
            let epoch = Math.floor(Date.now() / 1000);
            hmac.update(`${key}${epoch}`);
            let hash = hmac.digest('hex');
            return `${key}_${epoch}_${hash}`;
        };
    }
};

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _handleHttpError(response) {
    return new Promise((resolve, reject) => {

        // Throw for all non-2xx status codes, except for 304
        if(!response.ok && response.status !== 304) {
            response.text().then((text) => {
                reject({
                    message: response.statusText,
                    status: response.status,
                    responseText: text
                });
            });
        } else {
            resolve(response);
        }
    });
}
function _readCookies(request) {
    if(this._cookieManager !== null) {
        return this._cookieManager.getCookieString(request.url).then((cookieString) => {
            if(cookieString !== '') {
                request.headers.set('Cookie', cookieString);
            }
        }).then(() => request);
    }
    return Promise.resolve(request);
}
function _handleCookies(response) {
    if(this._cookieManager !== null) {
        return this._cookieManager.storeCookies(response.url, response.headers.getAll('Set-Cookie')).then(() => response);
    }
    return Promise.resolve(response);
}
function _doFetch({ method, headers, body = null }) {
    let requestHeaders = new Headers(headers);
    let requestData = { method: method, headers: requestHeaders, credentials: 'include' };
    if(body !== null) {
        requestData.body = body;
    }
    let request = new Request(this._url.toString(), requestData);
    return _readCookies.call(this, request).then(fetch).then(_handleHttpError).then(_handleCookies.bind(this));
}

/**
 * A class for building URIs and performing HTTP requests.
 */
class Plug {

    /**
     *
     * @param {String} [url=/] The initial URL to start the URL building from and to ultimately send HTTP requests to.
     * @param {Object} [options] Options to direct the construction of the Plug.
     * @param {Object} [options.uriParts] An object representation of additional URI construction parameters.
     * @param {Array} [options.uriParts.segments] An array of strings specifying path segments to be added to the URI.
     * @param {Object} [options.uriParts.query] A set of key-value pairs that specify query string entries to be added to the URI.
     * @param {String} [options.uriParts.excludeQuery] A query string key that will be removed from the URI if it was specified as part of the {@see uri} parameter or as an entry in {@see options.uriParts.query}.
     * @param {Object} [options.headers] A set of key-value pairs that specify headers that will be set for every HTTP request sent by this instance.
     * @param {Number} [options.timeout=null] The time, in milliseconds, to wait before an HTTP timeout.
     * @param {function} [options.beforeRequest] A function that is called before each HTTP request that allows per-request manipulation of the request headers and query parameters.
     * @param {Object} [options.cookieManager] An object that implements a cookie management interface. This should provide implementations for the `getCookieString()` and `storeCookies()` functions.
     */
    constructor(url = '/', { uriParts = {}, headers = {}, timeout = null, beforeRequest = (params) => params, cookieManager = null } = {}) {

        // Initialize the url for this instance
        this._url = new Uri(url);
        if('segments' in uriParts) {
            this._url.addSegments(uriParts.segments);
        }
        if('query' in uriParts) {
            this._url.addQueryParams(uriParts.query);
        }
        if('excludeQuery' in uriParts) {
            this._url.removeQueryParam(uriParts.excludeQuery);
        }

        this._beforeRequest = beforeRequest;
        this._timeout = timeout;
        this._headers = headers;
        this._cookieManager = cookieManager;
    }

    /**
     * Get a string representation of the URL used for HTTP requests.
     */
    get url() {
        return this._url.toString();
    }

    /**
     * Get a Headers instance as defined by the fetch API.
     */
    get headers() {
        return new Headers(this._headers);
    }

    /**
     * Get a new Plug, based on the current one, with the specified path segments added.
     * @param {...String} segments The segments to be added to the new Plug instance.
     * @returns {Plug} The Plug with the segments included.
     */
    at(...segments) {
        var values = [];
        segments.forEach((segment) => {
            values.push(segment.toString());
        });
        return new this.constructor(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { segments: values },
            cookieManager: this._cookieManager
        });
    }

    /**
     * Get a new Plug, based on the current one, with the specified query parameter added.
     * @param {String} key The key name of the query parameter.
     * @param {String|Number|Boolean} value A value that will be serialized to a string and set as the query parameter value.
     * @returns {Plug} A new Plug instance with the query parameter included.
     */
    withParam(key, value) {
        let params = {};
        params[key] = value;
        return new this.constructor(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { query: params },
            cookieManager: this._cookieManager
        });
    }

    /**
     * Get a new Plug, based on the current one, with the specified query parameters added.
     * @param {Object} values A key-value list of the query parameters to include.
     * @returns {Plug} A new Plug instance with the query parameters included.
     */
    withParams(values = {}) {
        return new this.constructor(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { query: values },
            cookieManager: this._cookieManager
        });
    }

    /**
     * Get a new Plug, based on the current one, with the specified query parameter removed.
     * @param {String} key The key name of the query parameter in the current Plug to remove.
     * @returns {Plug} A new Plug instance with the query parameter excluded.
     */
    withoutParam(key) {
        return new this.constructor(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { excludeQuery: key },
            cookieManager: this._cookieManager
        });
    }

    /**
     * Get a new Plug, based on the current one, with the specified header added.
     * @param {String} key The name of the header to add.
     * @param {String} value The value of the header.
     * @returns {Plug} A new Plug instance with the header included.
     */
    withHeader(key, value) {
        let newHeaders = Object.assign({}, this._headers);
        newHeaders[key] = value;
        return new this.constructor(this._url.toString(), {
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            headers: newHeaders,
            cookieManager: this._cookieManager
        });
    }

    /**
     * Get a new Plug, based on the current one, with the specified headers added.
     * @param {Object} values A key-value list of the headers to include.
     * @returns {Plug} A new Plug instance with the headers included.
     */
    withHeaders(values) {
        let newHeaders = Object.assign({}, this._headers);
        Object.keys(values).forEach((key) => {
            newHeaders[key] = values[key];
        });
        return new this.constructor(this._url.toString(), {
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            headers: newHeaders,
            cookieManager: this._cookieManager
        });
    }

    /**
     * Get a new Plug, based on the current one, with the specified header removed.
     * @param {String} key The name of the header in the current Plug to remove.
     * @returns {Plug} A new Plug instance with the header excluded.
     */
    withoutHeader(key) {
        let newHeaders = Object.assign({}, this._headers);
        delete newHeaders[key];
        return new this.constructor(this._url.toString(), {
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            headers: newHeaders,
            cookieManager: this._cookieManager
        });
    }

    /**
     * Perform an HTTP GET Request.
     * @param {String} [method=GET] The HTTP method to set as part of the GET logic.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    get(method = 'GET') {
        let params = this._beforeRequest({ method: method, headers: Object.assign({}, this._headers) });
        return _doFetch.call(this, params);
    }

    /**
     * Perform an HTTP POST request.
     * @param {String} body The body of the POST.
     * @param {String} mime The mime type of the request, set in the `Content-Type` header.
     * @param {String} [method=POST] The HTTP method to use with the POST logic.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    post(body, mime, method = 'POST') {
        if(mime) {
            this._headers['Content-Type'] = mime;
        }
        let params = this._beforeRequest({ method: method, body: body, headers: Object.assign({}, this._headers) });
        return _doFetch.call(this, params);
    }

    /**
     * Perform an HTTP PUT request.
     * @param {String} body The body of the PUT.
     * @param {String} mime The mime type of the request, set in the `Content-Type` header.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    put(body, mime) {
        return this.post(body, mime, 'PUT');
    }

    /**
     * Perform an HTTP HEAD request.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    head() {
        return this.get('HEAD');
    }

    /**
     * Perform an HTTP OPTIONS request.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    options() {
        return this.get('OPTIONS');
    }

    /**
     * Perform an HTTP DELETE request.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    delete() {
        return this.post(null, null, 'DELETE');
    }
}

/**
 * A class for validating HTTP requests to the MindTouch site API.
 */
class Api {

    /**
     * Construct a new API object.
     * @param {Settings} [settings] The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(settings = new Settings()) {
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki');
    }

    /**
     * Validate HTTP request
     * @returns {Promise} A Promise that, when resolved, indicates a successful HTTP request.
     */
    http() {
        return this._plug.at('http').get();
    }

    /**
     * Validate HTTP request
     * @returns {Promise} A Promise that, when resolved, indicates a successful F1 HTTP request.
     */
    f1() {
        return this._plug.at('f1').get();
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const modelParser = {
    to: {
        boolean(value) {
            return value === true || value === 'true' || value === 'True';
        },
        date(value) {
            const dateValue = new Date(value);
            if(isNaN(dateValue.getTime())) {
                throw new Error('Failed converting to date');
            }
            return dateValue;
        },
        apiDate(value) {
            if(!(/^\d{8}$|^\d{14}$/).test(value)) {
                throw new Error('Failed converting an API date: The raw value must be a string of digits and of length 8 or 14');
            }
            const parts = [
                value.slice(0, 4),
                value.slice(4, 6),
                value.slice(6, 8),
                value.slice(8, 10),
                value.slice(10, 12),
                value.slice(12)
            ].map((p) => parseInt(p, 10)).filter((p) => !isNaN(p));

            // The month parameter is zero-based, so we'll need to decrement it before constructing the Date.
            parts[1]--;
            return new Date(...parts);
        },
        number(value) {
            if(typeof value === 'number') {
                return value;
            }
            if(value === '') {
                return null;
            }
            const intValue = Number(value);
            if(String(intValue) !== value) {
                throw new Error('Failed converting to integer');
            }
            return intValue;
        }
    },
    isValid(value) {
        return typeof value !== 'undefined';
    },
    forceArray(value) {
        if(!modelParser.isValid(value) || value === '') {
            return [];
        }
        return Array.isArray(value) ? value : [ value ];
    },
    getValue(obj, ...fields) {
        if(!obj || typeof obj !== 'object') {
            return;
        }
        const currentField = fields.shift();
        if(currentField in obj) {

            // Special '#text' logic to return parent field if it's a string
            const textParentIsString = fields.length === 1 && fields[0] === '#text' && typeof obj[currentField] === 'string';
            if(fields.length === 0 || textParentIsString) {
                return obj[currentField];
            }
            return modelParser.getValue(obj[currentField], ...fields);
        }
    },
    processModelAndData(model, data) {
        let preProcessor = null;
        let dataModel = null;
        if(model && model.model) {
            preProcessor = model.preProcessor;
            dataModel = model.model;
        } else {
            dataModel = model;
        }
        if(typeof preProcessor === 'function') {
            data = preProcessor(data);
        }
        return [ dataModel, data ];
    },
    transformValue(value, transform) {
        let result = value;
        if(typeof transform === 'string') {
            result = modelParser.to[transform](value);
        } else if(Array.isArray(transform) || transform.model) {
            const [ processedModel, processedData ] = modelParser.processModelAndData(transform, value);
            let parser = modelParser.createParser(processedModel);
            result = parser(processedData);
        } else if(typeof transform === 'function') {
            result = transform(value);
        } else {
            throw new Error(`Invalid value used for the transform parameter while trying to convert ${value}`);
        }
        return result;
    },
    parseProperty(data, parsedObj, { field, name, isArray, transform, constructTransform }) {
        if(!data || typeof data !== 'object') {
            throw new TypeError('Cannot parse a non-object');
        }
        if(typeof field === 'undefined') {
            throw new TypeError('The \'field\' property must be included in every model entry');
        }
        const fields = modelParser.forceArray(field);
        let value = modelParser.getValue(data, ...fields);
        if(constructTransform && typeof constructTransform === 'function') {
            transform = constructTransform(value);
            [ transform, value ] = modelParser.processModelAndData(transform, value);
        }
        if(isArray) {
            value = modelParser.forceArray(value);
        }
        if(transform && modelParser.isValid(value) || typeof transform === 'function') {
            if(isArray) {
                value = value.map((val) => modelParser.transformValue(val, transform));
            } else {
                value = modelParser.transformValue(value, transform);
            }
        }
        name = name || fields[0];
        if(name in parsedObj) {
            throw new Error(`Duplicate "${name}" in parsing model`);
        }
        if(modelParser.isValid(value)) {
            parsedObj[name] = value;
        }
    },
    createParser(model) {
        return (data) => {
            if(data === '') {
                return {};
            }
            const [ processedModel, processedData ] = modelParser.processModelAndData(model, data);
            const parsedObj = {};
            processedModel.forEach((propertyModel) => modelParser.parseProperty(processedData, parsedObj, propertyModel));
            return parsedObj;
        };
    }
};

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const contextIdsModel = [
    { field: 'context', name: 'contextIds', isArray: true }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const contextIdModel = {
    preProcessor(data) {
        if(data.context) {
            return data.context;
        }
        return data;
    },
    model: [
        { field: 'description' },
        { field: 'id' }
    ]
};

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let pageRatingModel = [
    { field: '@date', name: 'date', transform: 'date' },
    { field: '@count', name: 'count', transform: 'number' },
    { field: '@seated.count', name: 'seatedCount', transform: 'number' },
    { field: '@unseated.count', name: 'unseatedCount', transform: 'number' },
    { field: '@anonymous.count', name: 'anonymousCount', transform: 'number' },
    { field: '@score', name: 'score', transform: 'number' },
    { field: '@seated.score', name: 'seatedScore', transform: 'number' },
    { field: '@unseated.score', name: 'unseatedScore', transform: 'number' },
    { field: '@anonymous.score', name: 'anonymousScore', transform: 'number' },
    { field: '@score.trend', name: 'scoreTrend', transform: 'number' },
    { field: '@seated.score.trend', name: 'seatedScoreTrend', transform: 'number' },
    { field: '@unseated.score.trend', name: 'unseatedScoreTrend', transform: 'number' },
    {
        field: 'user.ratedby',
        name: 'userRatedBy',
        transform: [
            { field: '@id', name: 'id', transform: 'number' },
            { field: '@score', name: 'score', transform: 'number' },
            { field: '@date', name: 'date', transform: 'date' },
            { field: '@href', name: 'href' },
            { field: '@seated', name: 'seated', transform: 'boolean' }
        ]
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const permissionsModel = [
    {
        field: [ 'operations', '#text' ],
        transform(value) {
            let result = [];
            if(typeof value === 'string') {
                result = value.split(',');
            }
            return result;
        }
    },
    {
        field: 'role',
        transform(value) {
            let roleObj = {};
            if(typeof value === 'string') {
                roleObj.name = value;
            } else if(value && typeof value === 'object') {
                if('#text' in value) {
                    roleObj.name = value['#text'];
                }
                if('@id' in value) {
                    roleObj.id = parseInt(value['@id'], 10);
                }
                if('@href' in value) {
                    roleObj.href = value['@href'];
                }
            }
            return roleObj;
        }
    },
    {
        field: 'restriction', transform: [
            { field: '@id', name: 'id', transform: 'number' },
            { field: '#text', name: 'name' }
        ]
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const groupModel = [
    { field: '@id', name: 'id', transform: 'number' },
    { field: '@href', name: 'href' },
    { field: 'groupname', name: 'groupName' },
    { field: 'permissions.group', name: 'groupPermissions', transform: permissionsModel },
    {
        field: 'users',
        transform: [
            { field: '@count', name: 'count' },
            { field: '@href', name: 'href' }
        ]
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const userModel = [
    { field: '@id', name: 'id', transform: 'number' },
    { field: '@anonymous', name: 'anonymous', transform: 'boolean' },
    { field: '@wikiid', name: 'wikiId' },
    { field: '@href', name: 'href' },
    { field: 'date.created', name: 'dateCreated', transform: 'date' },
    { field: 'date.lastlogin', name: 'lastLoginDate', transform: 'date' },
    { field: 'email' },
    { field: 'fullname' },
    { field: [ 'license.seat', '#text' ], name: 'seated', transform: 'boolean' },
    { field: [ 'license.seat', '@owner' ], name: 'siteOwner', transform: 'boolean' },
    { field: 'nick' },
    { field: [ 'password', '@exists' ], name: 'passwordExists', transform: 'boolean' },
    { field: 'status' },
    { field: 'username' },
    { field: 'name' },
    { field: 'permissions.user', name: 'userPermissions', transform: permissionsModel },
    { field: [ 'groups', 'group' ], name: 'groups', isArray: true, transform: groupModel }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const pageModel = [
    { field: '@id', name: 'id', transform: 'number' },
    { field: 'title' },
    { field: '@guid', name: 'guid' },
    { field: 'uri.ui', name: 'uri' },
    { field: '@href', name: 'href' },
    { field: '@state', name: 'state' },
    { field: '@draft.state', name: 'draftState' },
    { field: 'article' },
    { field: 'language' },
    { field: 'namespace' },
    { field: 'language.effective', name: 'languageEffective' },
    { field: 'timeuuid' },
    { field: [ 'path', '#text' ] },
    { field: 'restriction' },
    { field: '@revision', name: 'revision', transform: 'number' },
    { field: 'path.original', name: 'originalPath', transform: decodeURIComponent },
    { field: '@deleted', name: 'deleted', transform: 'boolean' },
    { field: '@publish', name: 'publish', transform: 'boolean' },
    { field: '@unpublish', name: 'unpublish', transform: 'boolean' },
    { field: '@deactivate', name: 'deactivate', transform: 'boolean' },
    { field: '@virtual', name: 'virtual', transform: 'boolean' },
    { field: '@subpages', name: 'hasSubpages', transform: 'boolean' },
    { field: '@terminal', name: 'terminal', transform: 'boolean' },
    { field: 'overview' },
    { field: 'user.author', name: 'userAuthor', transform: userModel },
    { field: 'date.created', name: 'dateCreated', transform: 'date' },
    { field: 'date.modified', name: 'dateModified', transform: 'date' },
    { field: 'date.edited', name: 'dateEdited', transform: 'date' },
    { field: [ 'revisions', '@count' ], name: 'revisionCount', transform: 'number' },
    { field: [ 'comments', '@count' ], name: 'commentCount', transform: 'number' },
    { field: [ 'permissions', 'permissions.page' ], name: 'permissions', transform: permissionsModel },
    {
        field: 'rating',
        constructTransform(rating) {
            if(typeof rating === 'object' && rating !== null) {
                return pageRatingModel;
            }
        }
    },
    {
        field: 'metrics',
        transform: [
            { field: 'metric.charcount', name: 'charCount', transform: 'number' },
            { field: 'metric.views', name: 'views', transform: 'number' }
        ]
    },
    {
        field: [ 'tags', 'tag' ],
        isArray: true,
        transform: [
            { field: '@href', name: 'href' },
            { field: '@id', name: 'id', transform: 'number' },
            { field: '@value', name: 'value' },
            { field: 'title' },
            { field: 'type' },
            { field: 'uri' }
        ]
    }
];
pageModel.push({ field: 'page.parent', name: 'pageParent', transform: pageModel });
pageModel.push({ field: 'draft', transform: pageModel });

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const contextMapModel = [
    { field: '@default', name: 'default', transform: 'boolean' },
    { field: '@exists', name: 'exists', transform: 'boolean' },
    { field: 'description' },
    { field: 'id' },
    { field: 'language' },
    { field: 'page', transform: pageModel },
    { field: [ 'pageid', '#text' ], transform: 'number' }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const contextMapsModel = [
    { field: 'contextmap', name: 'contextMaps', isArray: true, transform: contextMapModel },
    { field: [ 'languages', 'language' ], isArray: true }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const apiErrorModel = {
    preProcessor(data) {
        try {
            data.errorInfo = JSON.parse(data.responseText);
        } catch(e) {
            data.errorText = data.responseText;
        }
        delete data.responseText;
        return data;
    },
    model: [
        { field: 'status' },
        { field: 'message' },
        {
            field: 'errorInfo',
            name: 'info',
            transform: [
                { field: [ 'arguments', 'argument' ], name: 'arguments', isArray: true },
                { field: 'exception' },
                { field: 'message' },
                { field: 'resource' },
                { field: 'data' }
            ]
        },
        { field: 'errorText' }
    ]
};

/**
 * A class to manage individual Context IDs.
 */
class ContextDefinition {

    /**
     * Create a ContextDefinition.
     * @param {String} id The ID of the context definition.
     * @param {Settings} [settings] The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(id, settings = new Settings()) {
        if(!id) {
            throw new Error('an ID must be supplied to create a new ContextDefinition');
        }
        this.id = id;
        this.plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'contexts', id);
    }

    /**
     * Get the Context ID information from the API.
     * @returns {Promise.<contextIdModel>} A promise that, when resolved, yields a {@link contextIdModel} object.
     */
    getInfo() {
        return this.plug.get().then((r) => r.json()).then(modelParser.createParser(contextIdModel));
    }

    /**
     * Set or overwrite the description of the Context ID
     * @param {String} description The new description to use for the Context ID.
     * @returns {Promise.<contextIdModel>} A promise that, when resolved, yields a contextIdModel object.
     */
    updateDescription(description = '') {
        const updateRequest = `<context><id>${this.id}</id><description>${description}</description></context>`;
        return this.plug.put(updateRequest, 'application/xml; charset=utf-8').then((r) => r.json()).then(modelParser.createParser(contextIdModel));
    }

    /**
     * Remove this Context ID from the system.
     * @returns {Promise} A Promise that, when resolved, indicates a successful deletion of the Context ID.
     */
    delete() {
        return this.plug.delete();
    }
}

/**
 * A class to manage a mapping between a {@link ContextDefinition} and a page on a MindTouch site; taking language into account.
 */
class ContextMap {

    /**
     * Construct a new ContextMap
     * @param {String} language The language of the mapping.
     * @param {String} id The ID of the associated {@link ContextDefinition}.
     * @param {Settings} [settings] The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(language, id, settings = new Settings()) {
        if(!id || !language) {
            throw new Error('an ID and language must be supplied to create a new ContextMap');
        }
        this.id = id;
        this.language = language;
        this.plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'contextmaps', language, id).withParam('verbose', 'true');
    }

    /**
     * Gets the information for the Context Mapping.
     * @returns {Promise.<contextMapModel>} A promise that, when resolved, yields a {@link contextMapModel} object.
     */
    getInfo() {
        return this.plug.get().then((r) => r.json()).then(modelParser.createParser(contextMapModel));
    }

    /**
     * Sets or changes the page ID for the Context ID mapping.
     * @param {Number} pageId The page ID to use for the Context ID mapping.
     * @returns {Promise.<contextMapModel>} A promise that, when resolved, yields a {@link contextMapModel} object.
     */
    update(pageId) {
        if(!pageId) {
            return Promise.reject(new Error('a page ID must be supplied in order to update a mapping'));
        }
        const updateRequest = `<contextmap><id>${this.id}</id><pageid>${pageId}</pageid><language>${this.language}</language></contextmap>`;
        return this.plug.put(updateRequest, 'application/xml; charset=utf-8').then((r) => r.json()).then(modelParser.createParser(contextMapModel));
    }

    /**
     * Removes a mapping between a Context ID and an associated page.
     * @returns {Promise} A Promise that, when resolved, indicates a successful removal of the mapping.
     */
    remove() {
        return this.plug.delete();
    }
}

/**
 * A class to manage the Context ID subsystem for access to the Context IDs and Context ID Mappings.
 */
class ContextIdManager {

    /**
     * Construct a new ContextIdManager.
     * @param {Settings} [settings] The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(settings = new Settings()) {
        this.mapsPlug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'contextmaps').withParam('verbose', 'true');
        this.definitionsPlug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'contexts');
        this._settings = settings;
        this._errorParser = modelParser.createParser(apiErrorModel);
    }

    /**
     * Get all of the Context ID Mappings that are defined.
     * @returns {Promise.<contextMapsModel>} A promise that, when resolved, yields a {@link contextMapsModel} object.
     */
    getMaps() {
        return this.mapsPlug.get().then((r) => r.json()).then(modelParser.createParser(contextMapsModel));
    }

    /**
     * Get all of the Context ID Definitions that are defined.
     * @returns {Promise.<contextIdsModel>} A promise that, when resolved, yields a {@link contextIdsModel} object.
     */
    getDefinitions() {
        return this.definitionsPlug.get().then((r) => r.json()).then((response) => {

            // response is an empty string when site has no context IDs.
            if(response === '') {
                response = { context: [] };
            }
            return response;
        }).then(modelParser.createParser(contextIdsModel));
    }

    /**
     * Add a new Context ID Definition to the system.
     * @param {String} id The ID to use for the new definition.
     * @param {String} [description=''] The initial description to set for the definition.
     * @returns {Promise.<contextIdModel>} A promise that, when resolved, yields a {@link contextIdModel} object.
     */
    addDefinition(id, description = '') {
        if(!id) {
            return Promise.reject(new Error('an ID must be supplied to add a definition'));
        }
        const addRequest = `<contexts><context><id>${id}</id><description>${description}</description></context></contexts>`;
        return this.definitionsPlug.post(addRequest, 'application/xml; charset=utf-8')
            .catch((err) => Promise.reject(this._errorParser(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(contextIdModel));
    }

    /**
     * Get a new {@link ContextDefinition} object for the supplied ID.
     * @param {String} id The ID of the Context Definition to create.
     * @returns {ContextDefinition} A new {@link ContextDefinition} object.
     */
    getDefinition(id) {
        return new ContextDefinition(id, this._settings);
    }

    /**
     * Get a new {@link ContextMap} object for the supplied language and ID combination.
     * @param {String} language The language code to use to identify the mapping.
     * @param {String} id The Context ID identifier to use to identify the mapping.
     * @returns {ContextMap} A new {@link ContextMap} object.
     */
    getMap(language, id) {
        return new ContextMap(language, id, this._settings);
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const _htmlEscapeChars = {

    // '¢': 'cent',
    // '£': 'pound',
    // '¥': 'yen',
    // '€': 'euro',
    // '©': 'copy',
    // '®': 'reg', Removed due to Dream unable to encode properly
    '<': 'lt',
    '>': 'gt',
    '"': 'quot',
    '&': 'amp',
    '\'': '#39'
};
const _regexString = new RegExp(`${Object.keys(_htmlEscapeChars).reduce((prev, key) => `${prev}${key}`, '[')}]`, 'g');

const utility = {
    xmlRequestType: 'application/xml; charset=utf-8',
    textRequestType: 'text/plain; charset=utf-8',
    jsonRequestType: 'application/json; charset=utf-8',
    escapeHTML(unescaped = '') {
        return unescaped.replace(_regexString, (m) => '&' + _htmlEscapeChars[m] + ';');
    },
    searchEscape(query) {
        let result = query.toString();
        let charArr = [ '\\', '+', '-', '&', '|', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':' ];
        charArr.forEach((c) => {
            let regex = new RegExp('\\' + c, 'g');
            result = result.replace(regex, '\\' + c);
        });
        return result;
    },
    getResourceId(id, defaultId) {
        if(!id && !defaultId) {
            throw new Error('Unable to resolve the input ID to an API resource ID');
        }
        let resourceId = defaultId;
        if(typeof id === 'string' && id !== defaultId) {
            resourceId = `=${encodeURIComponent(encodeURIComponent(id))}`;
        } else if(id) {
            resourceId = id;
        }
        return resourceId;
    },
    getNormalizedUserActivityToken(token) {
        let resourceId = null;
        if(typeof token === 'string') {
            if(token.includes(':')) {
                resourceId = token;
            } else {
                resourceId = `=${encodeURIComponent(encodeURIComponent(token))}`;
            }
        } else if(typeof token === 'number') {
            resourceId = token;
        } else {
            throw new Error('The user activity token must be a string or number');
        }
        return resourceId;
    },
    getFilenameId(filename) {
        if(typeof filename !== 'string') {
            throw new Error('The filename must be a string');
        }
        let encodedName = encodeURIComponent(encodeURIComponent(filename));
        if(!filename.includes('.')) {

            // File name has no dot (or the dot is at the first position).
            // Assume that means it doesn't have an extension.
            encodedName = `=${encodedName}`;
        }
        return encodedName;
    },
    getApiDateString(date) {
        const dateParts = {
            year: date.getFullYear(),
            month: `0${date.getMonth() + 1}`.slice(-2),
            day: `0${date.getDate()}`.slice(-2),
            hours: `0${date.getHours()}`.slice(-2),
            minutes: `0${date.getMinutes()}`.slice(-2),
            seconds: `0${date.getSeconds()}`.slice(-2)
        };
        return `${dateParts.year}${dateParts.month}${dateParts.day}${dateParts.hours}${dateParts.minutes}${dateParts.seconds}`;
    }
};

function _doXhr({ xhr, body, progressInfo }) {
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4) {
                const status = xhr.status;
                if(status >= 200 && status <= 300) {
                    progressInfo.callback({ loaded: progressInfo.size, total: progressInfo.size });
                    resolve(xhr);
                } else {
                    reject({
                        message: xhr.statusText,
                        status: xhr.status,
                        responseText: xhr.responseText
                    });
                }
            }
        };
        xhr.onerror = () => {
            reject(new Error('An error occurred while initiating the file upload'));
        };
        xhr.send(body);
    });
}
function _readCookies$1(request) {
    if(this._cookieManager !== null) {
        return this._cookieManager.getCookieString(this.url).then((cookieString) => {
            if(cookieString !== '') {
                request.xhr.setRequestHeader('Cookie', cookieString);
            }
        }).then(() => request);
    }
    return Promise.resolve(request);
}
function _handleCookies$1(xhr) {
    if(this._cookieManager !== null) {
        return this._cookieManager.storeCookies(this.url, xhr.getResponseHeader('Set-Cookie')).then(() => xhr);
    }
    return Promise.resolve(xhr);
}
function _doRequest({ method, headers, body = null, progressInfo }) {
    const xhr = new XMLHttpRequest();  // eslint-disable-line no-undef
    xhr.open(method, this.url, true);
    xhr.upload.onprogress = (e) => {
        progressInfo.callback({ loaded: e.loaded, total: progressInfo.size });
    };
    for(const [ header, val ] of Object.entries(headers)) {
        xhr.setRequestHeader(header, val);
    }
    const request = { xhr: xhr, body: body, progressInfo: progressInfo };
    progressInfo.callback({ loaded: 0, total: progressInfo.size });
    return _readCookies$1.call(this, request).then(_doXhr).then(_handleCookies$1.bind(this));
}

/**
 * A class that performs HTTP POST and PUT requests, and allows for the progress of the uploaded data to be reported.
 */
class ProgressPlug extends Plug {

    /**
     * Construct a ProgressPlug object.
     * @param {String} [url] The initial URL for the Plug.
     * @param {Object} params The parameters that direct the construction and behavior of the Plug. See {@see Plug} for details.
     */
    constructor(url, params) {
        super(url, params);
    }

    /**
     * Perform an HTTP POST request, enabling progress callback notifications.
     * @param {String} body The body of the POST.
     * @param {String} mime The mime type of the request, set in the `Content-Type` header.
     * @param {String} [method=POST] The HTTP method to use with the POST logic.
     * @param {Object} [progressInfo] An object containing parameters to receive the progress notifications.
     * @param {Number} [progressInfo.size] The Number of bytes that are uploaded before a notification callback occurs.
     * @param {function} [progressInfo.callback] A function that is called to notify about a progress event.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    post(body, mime, method = 'POST', progressInfo = { size: 0, callback: () => {} }) {
        if(mime) {
            this._headers['Content-Type'] = mime;
        }
        let params = this._beforeRequest({ method: method, body: body, headers: Object.assign({}, this._headers) });
        params.progressInfo = progressInfo;
        return _doRequest.call(this, params);
    }

    /**
     * Perform an HTTP PUT request, enabling progress callback notifications.
     * @param {String} body The body of the PUT.
     * @param {String} mime The mime type of the request, set in the `Content-Type` header.
     * @param {Object} [progressInfo] An object containing parameters to receive the progress notifications.
     * @param {Number} [progressInfo.size] The Number of bytes that are uploaded before a notification callback occurs.
     * @param {function} [progressInfo.callback] A function that is called to notify about a progress event.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    put(body, mime, progressInfo) {
        return this.post(body, mime, 'PUT', progressInfo);
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let pageContentsModel = [
    {
        field: '@type',
        name: 'type'
    },
    {
        field: '@title',
        name: 'title'
    },
    {
        field: '@unsafe',
        name: 'unsafe',
        transform: 'boolean'
    },
    {
        field: '@draft',
        name: 'draft',
        transform: 'boolean'
    },
    {
        field: 'head'
    },
    {
        field: 'tail'
    },
    {
        field: 'body',
        transform(body) {
            return (Array.isArray(body)) ? body[0] : body;
        }
    },
    {
        field: 'body',
        name: 'targets',
        transform(body) {
            let targets = [];
            if(Array.isArray(body)) {
                for(let i = 1; i < body.length; i++) {
                    targets.push({
                        [body[i]['@target']]: body[i]['#text']
                    });
                }
            }
            return targets;
        }
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const pageTagsModel = [
    { field: '@count', name: 'count', transform: 'number' },
    { field: '@href', name: 'href' },
    {
        field: 'tag',
        name: 'tags',
        isArray: true,
        transform: [
            { field: '@id', name: 'id', transform: 'number' },
            { field: '@value', name: 'value' },
            { field: '@href', name: 'href' },
            { field: 'title' },
            { field: 'type' },
            { field: 'uri' }
        ]
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const fileModel = [
    { field: '@id', name: 'id', transform: 'number' },
    { field: '@revision', name: 'revision', transform: 'number' },
    { field: '@res-id', name: 'resId', transform: 'number' },
    { field: '@href', name: 'href' },
    { field: '@res-is-head', name: 'resIsHead', transform: 'boolean' },
    { field: '@res-is-deleted', name: 'resIsDeleted', transform: 'boolean' },
    { field: '@res-rev-is-head', name: 'resRevIsHead', transform: 'boolean' },
    { field: '@res-contents-id', name: 'resContentsId', transform: 'number' },
    { field: 'date.created', name: 'dateCreated', transform: 'date' },
    { field: 'description' },
    { field: 'filename' },
    { field: 'location' },
    {
        field: 'contents',
        transform: [
            { field: '@type', name: 'type' },
            { field: '@size', name: 'size', transform: 'number' },
            { field: '@href', name: 'href' },
            { field: '@height', name: 'height', transform: 'number' },
            { field: '@width', name: 'width', transform: 'number' }
        ]
    },
    { field: 'user.createdby', name: 'userCreatedBy', transform: userModel },
    { field: 'page.parent', name: 'pageParent', transform: pageModel }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let pageFilesModel = [
    {
        field: '@count',
        name: 'count',
        transform: 'number'
    },
    {
        field: '@offset',
        name: 'offset',
        transform: 'number'
    },
    {
        field: '@totalcount',
        name: 'totalCount',
        transform: 'number'
    },
    {
        field: '@href',
        name: 'href'
    },
    {
        field: 'file',
        name: 'files',
        isArray: true,
        transform: fileModel
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let pageEditModel = [
    {
        field: '@status',
        name: 'status'
    },
    {
        field: 'page',
        transform: pageModel
    },
    {
        field: 'draft',
        transform: pageModel
    },
    {
        field: 'page.base',
        name: 'pageBase',
        transform: pageModel
    },
    {
        field: 'page.overwritten',
        name: 'pageOverwritten',
        transform: pageModel
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let relatedPagesModel = [
    {
        field: '@count',
        name: 'count',
        transform: 'number'
    },
    {
        field: '@href',
        name: 'href'
    },
    {
        field: 'page',
        name: 'pages',
        isArray: true,
        transform: pageModel
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const pageOverviewModel = [
    { field: '#text', name: 'text' },
    { field: '@needsmigration', name: 'needsMigration', transform: 'boolean' }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const pageDiffModel = [
    { field: '@type', name: 'type' },
    { field: '#text', name: 'combined' },
    { field: 'combined' },
    { field: 'before' },
    { field: 'after' }
];

const _errorParser = modelParser.createParser(apiErrorModel);

function _handleVirtualPage(error) {
    if(error.status === 404 && error.responseText) {
        let responseJson = JSON.parse(error.responseText);
        if(responseJson['@virtual'] === 'true') {
            let pageModelParser = modelParser.createParser(pageModel);
            return Promise.resolve(pageModelParser(responseJson));
        }
    }
    throw error;
}
function _getSaveXML(data) {
    let template = '';
    if(Array.isArray(data)) {
        data.forEach((tag) => {
            template = `${template}<tag value="${utility.escapeHTML(tag)}" />`;
        });
    }
    template = `<tags>${template}</tags>`;
    return template;
}
class PageBase {
    constructor(id) {
        if(this.constructor.name === 'PageBase') {
            throw new TypeError('PageBase must not be constructed directly.  Use one of Page() or Draft()');
        }
        this._id = utility.getResourceId(id, 'home');
    }
    getFullInfo(params = {}) {
        let pageModelParser = modelParser.createParser(pageModel);
        return this._plug.withParams(params).get().then((r) => r.json()).then(pageModelParser).catch(_handleVirtualPage);
    }
    getContents(params) {
        let pageContentsModelParser = modelParser.createParser(pageContentsModel);
        return this._plug.at('contents').withParams(params).get().then((r) => r.json()).then(pageContentsModelParser);
    }
    setContents(contents, params = {}) {
        if(typeof contents !== 'string') {
            return Promise.reject(new Error('Contents should be string.'));
        }
        let contentsParams = {
            edittime: 'now'
        };
        Object.keys(params).forEach((key) => {
            contentsParams[key] = params[key];
        });
        let pageEditModelParser = modelParser.createParser(pageEditModel);
        return this._plug.at('contents').withParams(contentsParams).post(contents, utility.textRequestType)
            .catch((err) => Promise.reject(_errorParser(err)))
            .then((r) => r.json()).then(pageEditModelParser);
    }
    getFiles(params = {}) {
        let pageFilesModelParser = modelParser.createParser(pageFilesModel);
        return this._plug.at('files').withParams(params).get().then((r) => r.json()).then(pageFilesModelParser);
    }
    attachFile(file, { name = file.name, size = file.size, type = file.type, progress = null } = {}) {
        if(progress !== null) {
            const progressPlug = new ProgressPlug(this._plug.url, this._settings.plugConfig);
            const progressInfo = { callback: progress, size };
            return progressPlug.at('files', encodeURIComponent(encodeURIComponent(name))).put(file, type, progressInfo).then((r) => JSON.parse(r.responseText)).then(modelParser.createParser(fileModel));
        }
        return this._plug.withHeader('Content-Length', size).at('files', encodeURIComponent(name)).put(file, type).then((r) => r.json());
    }
    getOverview() {
        return this._plug.at('overview').get().then((r) => r.json()).then(modelParser.createParser(pageOverviewModel));
    }
    setOverview(options = {}) {
        if(!('body' in options)) {
            return Promise.reject(new Error('No overview body was supplied'));
        }
        let request = `<overview>${utility.escapeHTML(options.body)}</overview>`;
        return this._plug.at('overview').put(request, utility.xmlRequestType);
    }
    getTags() {
        let pageTagsModelParser = modelParser.createParser(pageTagsModel);
        return this._plug.at('tags').get().then((r) => r.json()).then(pageTagsModelParser);
    }
    setTags(params = {}) {
        const XMLData = _getSaveXML(params);
        const pageTagsModelParser = modelParser.createParser(pageTagsModel);
        return this._plug.at('tags').put(XMLData, 'application/xml').then((r) => r.json()).then(pageTagsModelParser);
    }

    /**
     * Show changes between 2 different versions.
     * @param {Object} [params] Parameters that direct the fetching of the page diff.
     * @param {String|Number} params.previous Positive integer or a TimeUUID of the previous page revision to retrieve.
     * @param {String|Number} [params.revision=head] Positive integer or a TimeUUID of the page revision to retrieve.
     * @param {String} [params.includeVersions=false] Specifies whether the returned diff will include only the combined diff, or if the previous and current revision changes will also be included.
     * @param {String} [params.format=html] The format of the resulting diff. Must be one of "html" or "xhtml".
     * @returns {Promise} A Promise that, when resolved, yields a pageDiffModel containing the HTML representations of the diff.
     */
    getDiff({ previous, revision = 'head', includeVersions = false, format = 'html' } = {}) {
        if(!previous) {
            return Promise.reject(new Error('The `previous` parameter must be supplied.'));
        }
        if(typeof previous !== 'string' && typeof previous !== 'number') {
            return Promise.reject(new Error('The `previous` parameter must be a number or a string.'));
        }
        if(typeof revision !== 'string' && typeof revision !== 'number') {
            return Promise.reject(new Error('The revision parameter must be a number or a string.'));
        }
        if(typeof includeVersions !== 'boolean') {
            return Promise.reject(new Error('The `includeRevisionis` parameter must be a Boolean value.'));
        }
        if(format !== 'html' && format !== 'xhtml') {
            return Promise.reject(new Error('The `format` parameter must be a string equal to "html" or "xhtml".'));
        }
        return this._plug.at('diff').withParams({ previous, revision, diff: includeVersions ? 'all' : 'combined', format }).get()
            .catch((err) => Promise.reject(_errorParser(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(pageDiffModel));
    }
    getRelated(params = {}) {
        return this._plug.at('related').withParams(params).get().then((r) => r.json()).then(modelParser.createParser(relatedPagesModel));
    }

    /**
     * Revert page to an earlier revision
     * @param {Object} options - The options that direct the revert operation
     * @param {String|Number} options.fromRevision - Revision number of page or a TimeUUID string that will become the new head revision.
     * @param {String} [options.abort=conflict] - The condition under which to prevent the revert operation. Must be one of 'never' or 'conflict'.
     * @param {Boolean} [options.verbose=false] - Specifies whether or not the conflicted elements will be returned in the response.
     * @returns {Promise} - A Promise that will be resolved when the revert operation is complete, or rejected with an error specifying the reason for rejection.
     */
    revert(options) {
        if(!options) {
            return Promise.reject(new Error('The revert options must be specified.'));
        }
        if(typeof options.fromRevision !== 'string' && typeof options.fromRevision !== 'number') {
            return Promise.reject(new Error('The fromRevision parameter must be specified, and must be a string or a number.'));
        }
        const params = { fromrevision: options.fromRevision };
        if(options.abort) {
            if(typeof options.abort !== 'string' || (options.abort !== 'never' && options.abort !== 'conflict')) {
                return Promise.reject(new Error('The `abort` parameter must be set to "conflict" or "never".'));
            }
            params.abort = options.abort;
        }
        if('verbose' in options && options.verbose !== true && options.verbose !== false) {
            return Promise.reject(new Error('The `verbose` parameter must be a Boolean value.'));
        }
        params.abort = options.abort;
        return this._plug.at('revert').withParams(params).post(null, utility.textRequestType);
    }
}

/**
 * A class for managing a single unpublished draft page.
 */
class Draft extends PageBase {

    /**
     * Construct a Draft object.
     * @param {Number|String} [id=home] - The id of the draft to construct.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(id = 'home', settings = new Settings()) {
        super(id);
        this._settings = settings;
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'drafts', this._id);
    }

    /**
     * Deactivate the current draft and revert to the published page.
     * @returns {Promise.<pageModel>} - A Promise that, when resolved, yields a {@link pageModel} for the deactivated page.
     */
    deactivate() {
        let pageModelParser = modelParser.createParser(pageModel);
        return this._plug.at('deactivate').post().then((r) => r.json()).then(pageModelParser);
    }

    /**
     * Publish the draft.
     * @returns {Promise} - A Promise that, when resolved, indicates a successful publish operation.
     */
    publish() {
        return this._plug.at('publish').post();
    }

    /**
     * Unpublish a live page and create a draft out of it.
     * @returns {Promise.<pageModel>} - A Promise that, when resolved, yields a {@link pageModel} for the unpublished page.
     */
    unpublish() {
        return this._plug.at('unpublish').post().then((r) => r.json()).then(modelParser.createParser(pageModel));
    }

    /**
     * Update display title for a draft
     * @param {String} title - The new title for the draft
     * @returns {Promise.<pageModel|Error>} - A Promise that will be resolved with the page data for the draft that had its title changed, or rejected with an error specifying the reason for rejection.
     */
    setTitle(title) {
        if(!title) {
            return Promise.reject(new Error('A valid title must be supplied for the draft.'));
        }
        return this._plug.at('title').put(title, utility.textRequestType).then((r) => r.json()).then(modelParser.createParser(pageModel));
    }
}

/**
 * A class for managing unpublished draft pages.
 */
class DraftManager {

    /**
     * Create a new DraftManager.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(settings = new Settings()) {
        this._settings = settings;
        this._plug = new Plug(this._settings.host, this._settings.plugConfig).at('@api', 'deki', 'drafts');
    }

    /**
     * Create a new draft on the site where a page does not already exist.
     * @param {String} newPath - The path of the new draft.
     * @returns {Promise.<pageModel>} - A Promise that, when resolved, yields a {@link pageModel} for the newly-created draft.
     */
    createDraft(newPath) {
        return this._plug.at(utility.getResourceId(newPath), 'create')
            .post()
            .then((r) => r.json())
            .then(modelParser.createParser(pageModel));
    }

    /**
     * Get a list of drafts filtered by options.
     * @param {Object} [options] - The options that will filter the resulting list of drafts.
     * @param {Number|String} [options.parentId] - Only return pages that live under this page id.
     * @param {Array} [options.tags] - An array of tags to filter the pages by.
     * @param {Number} [options.limit=10] - The maximum number of pages to return (not to exceed 1000)
     * @param {Array} [options.include] - An array of elements to include. Currently, only 'tags' is allowed.
     * @returns {Promise.<Object|Error>} - A Promise that will be resolved with the drafts listing data, or rejected with an error specifying the reason for rejection.
     */
    getDrafts(options = {}) {
        const params = {};
        if(options.parentId) {
            params.parentid = utility.getResourceId(options.parentId, 'home');
        }
        if(options.tags) {
            if(!Array.isArray(options.tags)) {
                return Promise.reject(new Error('The `tags` parameter must be an array.'));
            }
            params.tags = options.tags.join(',');
        }
        if('limit' in options) {
            if(typeof options.limit !== 'number') {
                return Promise.reject(new Error('The `limit` parameter must be an number.'));
            }
            params.limit = options.limit;
        }
        if(options.include) {
            if(!Array.isArray(options.include)) {
                return Promise.reject(new Error('The `include` parameter must be an array.'));
            }
            params.include = options.include.join(',');
        }
        return this._plug.withParams(params)
            .get()
            .then((r) => r.json())
            .then(modelParser.createParser([ { field: [ 'pages', 'page' ], name: 'pages', isArray: true, transform: pageModel } ]));
    }

    /**
     * Fetch a new Draft object by ID.
     * @param {Number|String} [id=home] - The id of the draft to return.
     * @returns {Draft} - A new {@link Draft} object.
     */
    getDraft(id) {
        return new Draft(id, this._settings);
    }
}

/**
 * A base class for managing file attachments on both published pages and drafts.  This class can not be instantiated directly.
 */
class PageFileBase {
    constructor(pageId, filename) {
        if(this.constructor.name === 'PageFileBase') {
            throw new TypeError('PageFileBase must not be constructed directly.  Use one of PageFile() or DraftFile()');
        }
        this._pageId = utility.getResourceId(pageId, 'home');
        this._filename = utility.getFilenameId(filename);
    }

    /**
     * Get the URI for direct access to the file attachment.
     * @returns {String} - The file URI.
     */
    get fileUrl() {
        return this._plug.url;
    }

    /**
     * Gets the information for the file attachment.
     * @returns {Promise.<fileModel>} - A Promise that, when resolved, yields a {@link fileModel} containing the file information.
     */
    getInfo() {
        let fileModelParser = modelParser.createParser(fileModel);
        return this._plug.at('info').get().then((r) => r.json()).then(fileModelParser);
    }

    /**
     * Delete the file attachment fron the page.
     * @returns {Promise} - A Promise that, when resolved, indicates a successful delete operation.
     */
    delete() {
        return this._plug.delete();
    }

    /**
     * Get the description of the file attachment.
     * @returns {Promise.<String>} - A Promise that, when resolved, yields the file description.
     */
    getDescription() {
        return this._plug.at('description').get().then((r) => r.json());
    }

    /**
     * Remove the description from the file attachment.
     * @returns {Promise} - A Promise that, when resolved, indicates a successful removal.
     */
    clearDescription() {
        return this._plug.at('description').delete();
    }

    /**
     * Update the description of the file attachment.
     * @param {String} [description=''] - The new description to set.
     * @returns {Promise.<fileModel>} - A Promise that, when resolved, yields a {@link fileModel} containing the file information.
     */
    updateDescription(description = '') {
        let fileModelParser = modelParser.createParser(fileModel);
        return this._plug.at('description').put(description, utility.textRequestType).then((r) => r.json()).then(fileModelParser);
    }
}

/**
 * A class for managing a file attachment on an unpublished page.
 */
class DraftFile extends PageFileBase {

    /**
     * Construct a new DraftFile
     * @param {Number|String} [pageId='home'] - The ID of the unpublished page.
     * @param {String} filename - The filename of the file to manage.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(pageId, filename, settings = new Settings()) {
        super(pageId, filename);
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'drafts', this._pageId, 'files', this._filename);
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const propertyContentsModel = [
    { field: '#text', name: 'text' },
    { field: '@href', name: 'href' },
    { field: '@type', name: 'type' },
    { field: '@size', name: 'size' }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let pagePropertyModel = [
    {
        field: '@revision',
        name: 'revision'
    },
    {
        field: '@name',
        name: 'name'
    },
    {
        field: '@href',
        name: 'href'
    },
    {
        field: 'date.modified',
        name: 'dateModified',
        transform: 'date'
    },
    {
        field: 'page',
        transform: pageModel
    },
    {
        field: 'contents',
        transform: propertyContentsModel
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let pagePropertiesModel = [
    {
        field: '@count',
        name: 'count',
        transform: 'number'
    },
    {
        field: '@href',
        name: 'href'
    },
    {
        field: 'property',
        name: 'properties',
        isArray: true,
        transform: pagePropertyModel
    }
];

class PagePropertyBase {
    constructor(id) {
        if(this.constructor.name === 'PagePropertyBase') {
            throw new TypeError('PagePropertyBase must not be constructed directly.  Use one of PageProperty() or DraftProperty()');
        }
        this._id = utility.getResourceId(id, 'home');
    }

    /**
     * Get all of the properties of the page.
     * @param {Array} [names=[]] - An array of names to fetch so that the results are filtered.
     * @returns {Promise.<pagePropertiesModel>} - A Promise that, when resolved, yields a {@link pagePropertiesModel} object that contains the listing of properties.
     */
    getProperties(names = []) {
        if(!Array.isArray(names)) {
            return Promise.reject(new Error('The property names must be an array'));
        }
        let plug = this._plug;
        if(names.length > 0) {
            plug = plug.withParams({ names: names.join(',') });
        }
        return plug.get().then((r) => r.json()).then(modelParser.createParser(pagePropertiesModel));
    }

    /**
     * Get the contents of a page property.
     * @param {String} key - The key of the property to fetch.
     * @returns {Promise} - A Promise that, when resolved, yields the property contents.  The property can be of any type allowed by the MindTouch property subsystem.
     */
    getPropertyContents(key) {
        if(!key) {
            return Promise.reject(new Error('Attempting to fetch a page property contents without providing a property key'));
        }
        return this._plug.at(encodeURIComponent(key)).get();
    }

    /**
     * Gets a single page property by property key.
     * @param {String} key - The key of the property to fetch.
     * @returns {Promise.<pagePropertyModel>} - A Promise that, when resolved, yields a {@link pagePropertyModel} object that contains the property information.
     */
    getProperty(key) {
        if(!key) {
            return Promise.reject(new Error('Attempting to fetch a page property without providing a property key'));
        }
        return this._plug.at(encodeURIComponent(key), 'info').get().then((r) => r.json()).then(modelParser.createParser(pagePropertyModel));
    }

    /**
     * Set a property on the page
     * @param {String} key - The key of the property to set
     * @param {Object} value - An object conteining information regarding the value to set.
     * @param {String} value.text - The string value representing the property value to set.
     * @param {String} [value.type=@see utility.textRequestType] - The mime type of the value's text field.
     * @param {Object} params - An object that contains values that will direct the behavior of the operation.
     * @returns {Promise} - A Promise that, when resolved, indicates the property was set successfully.
     */
    setProperty(key, value = { }, params = { abort: 'modified' }) {
        if(!key) {
            return Promise.reject(new Error('Attempting to set a property without providing a property key'));
        }
        if(!value.text) {
            return Promise.reject(new Error('Attempting to set a property without providing a property value'));
        }
        if(!value.type) {
            value.type = utility.textRequestType;
        }
        return this._plug.at(encodeURIComponent(key)).withParams(params).put(value.text, value.type);
    }
}

class DraftProperty extends PagePropertyBase {

    /**
     * @constructor
     * @param {String|Number} id - The numeric ID or page path string.
     * @param {Settings} [settings] - The martian Settings object to direct the requests performed.
     */
    constructor(id, settings = new Settings()) {
        super(id);
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'drafts', this._id, 'properties');
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function dateOrStringTransformer(value) {
    const date = new Date(value);
    const dateValue = date.getDate();

    // eslint-disable-next-line no-self-compare
    if(dateValue !== dateValue) {
        return value;
    }
    return date;
}

const learningPathTransform = [
    { field: '@id', name: 'id', transform: 'number' },
    { field: '@timestamp', transform: 'date' },
    { field: 'name' },
    { field: 'title' }
];

const eventModel = [
    { field: '@cascading', name: 'cascading', transform: 'boolean' },
    { field: '@datetime', name: 'datetime', transform: 'date' },
    { field: '@id', name: 'id' },
    { field: '@journaled', name: 'journaled', transform: 'boolean' },
    { field: '@language', name: 'language' },
    { field: 'change-comment', name: 'changeComment' },
    { field: 'previous.restriction-id', name: 'previousRestrictionId', transform: 'number' },
    { field: 'restriction-id', name: 'restrictionId', transform: 'number' },
    { field: 'legacy-commit', name: 'legacyComment' },
    { field: 'root.page', name: 'rootPage', transform: pageModel },
    { field: '@type', name: 'type' },
    { field: '@version', name: 'version', transform: 'number' },
    { field: 'to', transform: dateOrStringTransformer },
    { field: 'from', transform: dateOrStringTransformer },
    { field: 'afternode.page', name: 'afternodePage', transform: pageModel },
    { field: 'displayname.current', name: 'currentDisplayName' },
    { field: 'displayname.previous', name: 'previousDisplayName' },
    { field: 'create-reason', name: 'createReason' },
    { field: 'source.page', name: 'sourcePage', transform: pageModel },
    { field: 'page', transform: pageModel },
    { field: 'user', transform: userModel },
    { field: 'file', transform: fileModel },
    { field: 'source.file', name: 'sourceFile', transform: fileModel },
    { field: '@move-source', name: 'moveSource', transform: 'boolean' },
    {
        field: 'data',
        transform: [
            { field: 'constraint' },
            { field: 'path' },
            { field: 'query' },
            { field: 'limit', transform: 'number' },
            { field: 'qid', transform: 'number' },
            { field: 'totalrecommended', name: 'totalRecommended', transform: 'number' },
            { field: 'totalresults', name: 'totalResults', transform: 'number' },
            { field: '_uri.host', name: 'host' },
            { field: '_uri.query', name: 'uriQuery' },
            { field: '_uri.scheme', name: 'scheme' }
        ]
    },
    {
        field: 'diff',
        transform: [
            { field: '@toolarge', name: 'tooLarge', transform: 'boolean' },
            { field: 'added', transform: 'number' },
            { field: 'attributes', transform: 'number' },
            { field: 'removed', transform: 'number' },
            { field: 'structural', transform: 'number' },
            { field: 'categorychanged', transform: 'boolean' },
            { field: 'pagesadded', transform: 'number' },
            { field: 'pagesremoved', transform: 'number' },
            { field: 'pagesreordered', transform: 'boolean' },
            { field: 'summarychanged', transform: 'boolean' },
            { field: 'titlechanged', transform: 'boolean' }
        ]
    },
    {
        field: 'grant',
        transform: [
            { field: 'group', transform: groupModel },
            { field: 'id', transform: 'number' },
            {
                field: 'role',
                transform: [
                    { field: '@id', name: 'id', transform: 'number' }
                ]
            },
            { field: 'type' },
            { field: 'user', transform: userModel }
        ]
    },
    {
        field: 'property',
        transform: [
            { field: 'name' }
        ]
    },
    {
        field: 'request',
        transform: [
            { field: '@count', name: 'count', transform: 'number' },
            { field: '@id', name: 'id' },
            { field: '@seq', name: 'seq', transform: 'number' },
            { field: 'ip' },
            { field: 'session-id', name: 'sessionId' },
            { field: 'signature' },
            { field: 'user', transform: userModel }
        ]
    },
    {
        field: [ 'tags-added', 'tag' ],
        name: 'tagsAdded',
        isArray: true,
        transform: [
            { field: 'name' }
        ]
    },
    {
        field: [ 'tags-removed', 'tag' ],
        name: 'tagsRemoved',
        isArray: true,
        transform: [
            { field: 'name' }
        ]
    },
    { field: 'learningpath', name: 'learningPath', transform: learningPathTransform },
    { field: 'root.learningpath', name: 'learningPathRoot', transform: learningPathTransform }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let userActivityModel = [
    { field: '@count', name: 'count', transform: 'number' },
    { field: '@upto', name: 'upTo' },
    { field: '@since', name: 'since' },
    { field: 'event', name: 'events', isArray: true, transform: eventModel }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const pageHistoryModel = [
    { field: '@count', name: 'count', transform: 'number' },
    { field: '@upto', name: 'upTo' },
    { field: '@since', name: 'since' },
    {
        field: 'summary',
        isArray: true,
        transform: [
            { field: '@id', name: 'id' },
            { field: '@datetime', name: 'datetime', transform: 'date' },
            { field: '@count', name: 'count', transform: 'number' },
            { field: '@detailid', name: 'detailId' },
            { field: '@journaled', name: 'journaled', transform: 'boolean' },
            { field: '@diffable', name: 'diffable', transform: 'boolean' },
            { field: '@uri.detail', name: 'detailUri' },
            { field: '@uri.hierarchy', name: 'hierarchyUri' },
            { field: 'event', transform: eventModel },
            {
                field: 'page',
                transform: [
                    { field: '@id', name: 'id', transform: 'number' },
                    { field: 'path' }
                ]
            },
            { field: [ 'users', 'user' ], name: 'users', isArray: true, transform: userModel }
        ]
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const pageHistoryDetailModel = [
    { field: '@count', name: 'count', transform: 'number' },
    { field: 'event', name: 'events', isArray: true, transform: eventModel }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2016 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const reportLogsModel = [
    {
        field: 'log',
        name: 'logs',
        isArray: true,
        transform: [
            { field: '@complete', name: 'complete', transform: 'boolean' },
            { field: 'modified', name: 'modified', transform: 'date' },
            { field: 'month', name: 'month', transform: 'date' },
            { field: 'name', name: 'name' }
        ]
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2016 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let logUrlModel = [
    { field: 'url' }
];

const _errorParser$1 = modelParser.createParser(apiErrorModel);

/**
 * A class for fetching and managing events.
 */
class Events {

    /**
     * Construct a new Events object.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(settings = new Settings()) {
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'events');
    }

    /**
     * Get the available drafts history logs.
     * @returns {Promise.<reportLogsModel>} - A Promise that, when resolved, yields a {@link reportLogsModel} containing the available logs for drafts history.
     */
    getSiteDraftsHistoryLogs() {
        return this._plug.at('draft-hierarchy', 'logs').get()
            .then((r) => r.json()).then(modelParser.createParser(reportLogsModel));
    }

    /**
     * Get the draft history log url.
     * @param {String} logName - Name of log to retrive URL from.
     * @returns {Promise.<logUrlModel>} - A Promise that, when resolved, yields a {@link logUrlModel} containing log url.
     */
    getSiteDraftsHistoryLogUrl(logName) {
        if(!logName) {
            return Promise.reject(new Error('Attempting to get log url without required name'));
        }
        return this._plug.at('draft-hierarchy', 'logs', logName, 'url').get()
            .then((r) => r.json()).then(modelParser.createParser(logUrlModel));
    }

    /**
     * Get the drafts history
     * @param {Object} [options] - An object that directs the history fetching.
     * @param {String|Number} [options.pageId=home] - The page in the site hierarchy to return the history.
     * @param {Number} [options.limit=25] - The maximum number results to retrieve. Regardless of what is passed in, no more than 1000 results will be returned.
     * @param {String} [options.upTo] - The history event ID to start fetching at.
     * @param {Array} [options.include] - An array of entity details to include. Valid entries are 'page', 'user', 'group', 'file', and 'request'
     * @returns {Promise.<pageHistoryModel|Error>} - A Promise that will be resolved with the page history data, or rejected with an error specifying the reason for rejection.
     */
    getSiteDraftsHistory(options = {}) {
        const params = {};
        if(options.limit) {
            if(typeof options.limit !== 'number') {
                return Promise.reject(new Error('The `limit` parameter must be a number less than or equal to 1000.'));
            }
            params.limit = options.limit;
        }
        if(options.include) {
            if(!Array.isArray(options.include)) {
                return Promise.reject(new Error('The `include` parameter must be an array.'));
            }
            params.include = options.include.join(',');
        }
        if(options.upTo) {
            if(typeof options.upTo !== 'string') {
                return Promise.reject(new Error('The `upTo` parameter must be a string.'));
            }
            params.upto = options.upTo;
        }
        return this._plug.at('draft-hierarchy', utility.getResourceId(options.pageId, 'home')).withParams(params).get()
            .then((r) => r.json()).then(modelParser.createParser(pageHistoryModel));
    }

    /**
     * Get the detail of a site history event
     * @param {String} detailId - The GUID specifying the detail to fetch.
     * @param {Object} [options] - Information about the detail to fetch
     * @param {Array} [options.include] - An array of entity details to include. Valid entries are 'page', 'user', 'group', 'file', and 'request'
     * @returns {Promise.<pageHistoryModel|Error>} - A Promise that will be resolved with the page history data, or rejected with an error specifying the reason for rejection.
     */
    getSiteDraftsHistoryDetail(detailId, options = {}) {
        if(!detailId || typeof detailId !== 'string') {
            return Promise.reject(new Error('The detail ID must be specified, and it must be a string.'));
        }
        const params = {};
        if(options.include) {
            if(!Array.isArray(options.include)) {
                return Promise.reject(new Error('The `include` option must be an array'));
            }
            params.include = options.include.join(',');
        }
        return this._plug.at('page-hierarchy', 'details', options.detailId).withParams(params).get()
            .then((r) => r.json()).then(modelParser.createParser(pageHistoryModel));
    }

    /**
     * Get draft history summary.
     * @param {Number|String} [pageId=home] - The page ID or path.
     * @param {Object} [options] - An object that directs the history fetching.
     * @param {Number} [options.limit=25] - The maximum number results to retrieve. Regardless of what is passed in, no more than 1000 results will be returned.
     * @param {String} [options.upTo] - The history event ID to start fetching at.
     * @param {Array} [options.include] - An array of entity details to include. Valid entries are 'page', 'user', 'group', 'file', and 'request'
     * @returns {Promise.<pageHistoryModel>} - A Promise that, when resolved, yields a {@link pageHistoryModel} that contains the listing of the page events.
     */
    getDraftHistory(pageId = 'home', options = {}) {
        const params = {};
        if(options.limit) {
            if(typeof options.limit !== 'number') {
                return Promise.reject(new Error('The `limit` parameter must be a number.'));
            }
            params.limit = options.limit;
        }
        if(options.upTo) {
            if(typeof options.upTo !== 'string') {
                return Promise.reject(new Error('The `upTo` parameter must be a string.'));
            }
            params.upto = options.upTo;
        }
        if(options.include) {
            if(!Array.isArray(options.include)) {
                return Promise.reject(new Error('The `include` parameter must be an array.'));
            }
            params.include = options.include.join(',');
        }
        return this._plug.at('draft', utility.getResourceId(pageId, 'home')).withParams(params).get()
            .then((r) => r.json()).then(modelParser.createParser(pageHistoryModel));
    }

    /**
     * Get draft history detail.
     * @param {Number|String} pageId = 'home' - The page ID or path.
     * @param {String} detailId - The detail ID.
     * @param {Object} [options] - Options to direct the fetching of the detail.
     * @param {Array} [options.include] - An array of strings identifying elements to expand in the result. Valid identifiers are: 'page', 'user', 'file', and 'request'.
     * @returns {Promise.<pageHistoryModel>} - A Promise that, when resolved, yields a {@link pageHistoryModel} that contains the listing of the page events.
     */
    getDraftHistoryDetail(pageId, detailId, options = {}) {
        if(!pageId) {
            return Promise.reject(new Error('The page ID is required to fetch a draft history detail.'));
        }
        if(!detailId) {
            return Promise.reject(new Error('The detail ID is required to fetch a draft history detail.'));
        }
        const params = {};
        if(options.include) {
            if(!Array.isArray(options.include)) {
                return Promise.reject(new Error('The `include` parameter must be an array.'));
            }
            params.include = options.include.join(',');
        }
        return this._plug.at('draft', utility.getResourceId(pageId, 'home'), detailId).withParams(params).get()
            .then((r) => r.json()).then(modelParser.createParser(pageHistoryDetailModel));
    }

    /**
     * Get the history summary for a Learning Path
     * @param {String} learningPathId - The string identifier of the learning path.
     * @param {Object} [options] - Options to direct the fetching of the learning path history.
     * @param {Number} [options.limit=25] - The maximum number of results to fetch.
     * @param {String} [options.upTo] - The GUID identifier to use for paging.
     * @param {Array} [options.include] - An array of strings identifying elements to expand in the result. Valid identifiers are: 'page', 'user', 'file', and 'request'.
     * @returns {Promise.<Object|Error>} - A Promise that will be resolved with the learning path history data, or rejected with an error specifying the reason for rejection.
     */
    getLearningPathHistory(learningPathId, options = {}) {
        if(!learningPathId || typeof learningPathId !== 'string') {
            return Promise.reject(new Error('The learning path ID must be supplied, and must be a string'));
        }
        const params = {};
        if(options.limit) {
            if(typeof options.limit !== 'number') {
                return Promise.reject(new Error('The `limit` parameter must be a number.'));
            }
            params.limit = options.limit;
        }
        if(options.upTo) {
            if(typeof options.upTo !== 'string') {
                return Promise.reject(new Error('The `upTo` parameter must be a string.'));
            }
            params.upto = options.upTo;
        }
        if(options.include) {
            if(!Array.isArray(options.include)) {
                return Promise.reject(new Error('The `include` parameter must be an array.'));
            }
            params.include = options.include.join(',');
        }
        return this._plug.at('learningpath', utility.getResourceId(learningPathId)).withParams(params).get()
            .then((r) => r.json()).then(modelParser.createParser(pageHistoryModel));
    }

    /**
     * Get the available site history logs.
     * @param {String} No params necessary.
     * @returns {Promise.<reportLogsModel>} - A Promise that, when resolved, yields a {@link reportLogsModel} containing the available logs for site history.
     */
    getSiteHistoryLogs() {
        return this._plug.at('page-hierarchy', 'logs').get()
            .then((r) => r.json()).then(modelParser.createParser(reportLogsModel));
    }

    /**
     * Get the site history log url.
     * @param {String} logName - Name of log to retrive URL from.
     * @returns {Promise.<logUrlModel>} - A Promise that, when resolved, yields a {@link logUrlModel} containing log url.
     */
    getSiteHistoryLogUrl(logName) {
        if(!logName) {
            return Promise.reject(new Error('Attempting to get log url without required name'));
        }
        return this._plug.at('page-hierarchy', 'logs', logName, 'url').get()
            .then((r) => r.json()).then(modelParser.createParser(logUrlModel));
    }

    /**
     * Get site history summary
     * @param {Object} [options] - An object that directs the history fetching.
     * @param {String|Number} [options.pageId=home] - The page in the site hierarchy to return the history.
     * @param {Number} [options.limit=25] - The maximum number results to retrieve. Regardless of what is passed in, no more than 1000 results will be returned.
     * @param {String} [options.upTo] - The history event ID to start fetching at.
     * @param {Array} [options.include] - An array of entity details to include. Valid entries are 'page', 'user', 'group', 'file', and 'request'
     * @returns {Promise.<pageHistoryModel|Error>} - A Promise that will be resolved with the site history data, or rejected with an error specifying the reason for rejection.
     */
    getSiteHistory(options = {}) {
        const params = {};
        if(options.limit) {
            if(typeof options.limit !== 'number') {
                return Promise.reject(new Error('The `limit` parameter must be a number less than or equal to 1000.'));
            }
            params.limit = options.limit;
        }
        if(options.include) {
            if(!Array.isArray(options.include)) {
                return Promise.reject(new Error('The `include` parameter must be an array.'));
            }
            params.include = options.include.join(',');
        }
        if(options.upTo) {
            if(typeof options.upTo !== 'string') {
                return Promise.reject(new Error('The `upTo` parameter must be a string.'));
            }
            params.upto = options.upTo;
        }
        return this._plug.at('page-hierarchy', utility.getResourceId(options.pageId, 'home')).withParams(params).get()
            .then((r) => r.json()).then(modelParser.createParser(pageHistoryModel));
    }

    /**
     * Get the detail of a site history event
     * @param {String} detailId - The GUID specifying the detail to fetch.
     * @param {Object} [options] - Information about the detail to fetch
     * @param {Array} [options.include] - An array of entity details to include. Valid entries are 'page', 'user', 'group', 'file', and 'request'
     * @returns {Promise.<pageHistoryModel|Error>} - A Promise that will be resolved with the site history detail data, or rejected with an error specifying the reason for rejection.
     */
    getSiteHistoryDetail(detailId, options = {}) {
        if(!detailId || typeof detailId !== 'string') {
            return Promise.reject(new Error('The detail ID must be specified, and it must be a string.'));
        }
        const params = {};
        if(options.include) {
            if(!Array.isArray(options.include)) {
                return Promise.reject(new Error('The `include` option must be an array'));
            }
            params.include = options.include.join(',');
        }
        return this._plug.at('page-hierarchy', 'details', detailId).withParams(params).get()
            .then((r) => r.json()).then(modelParser.createParser(pageHistoryModel));
    }

    /**
     * Notify the system that a page was viewed by a user
     * @param {String|Number} pageId - The numeric ID or path of the page to log a view event for.
     * @param {Object} [eventData] - Specific data about the search that was performed.
     * @returns {Promise.<pageHistoryModel|Error>} - A Promise that will be resolved, or rejected with an error specifying the reason for rejection.
     */
    logPageView(pageId, eventData = {}) {
        return this._plug.at('page-view', utility.getResourceId(pageId, 'home')).post(JSON.stringify(eventData), utility.jsonRequestType);
    }

    /**
     * Get page history summary.
     * @param {Number|String} [pageId=home] - The page ID or path.
     * @param {Object} [options] - An object that directs the history fetching.
     * @param {Number} [options.limit=25] - The maximum number results to retrieve. Regardless of what is passed in, no more than 1000 results will be returned.
     * @param {String} [options.upTo] - The history event ID to start fetching at.
     * @param {Array} [options.include] - An array of entity details to include. Valid entries are 'page', 'user', 'group', 'file', and 'request'
     * @returns {Promise.<pageHistoryModel>} - A Promise that, when resolved, yields a {@link pageHistoryModel} that contains the listing of the page events.
     */
    getPageHistory(pageId = 'home', options = {}) {
        const params = {};
        if(options.limit) {
            if(typeof options.limit !== 'number') {
                return Promise.reject(new Error('The `limit` parameter must be a number less than or equal to 1000.'));
            }
            params.limit = options.limit;
        }
        if(options.include) {
            if(!Array.isArray(options.include)) {
                return Promise.reject(new Error('The `include` parameter must be an array.'));
            }
            params.include = options.include.join(',');
        }
        if(options.upTo) {
            if(typeof options.upTo !== 'string') {
                return Promise.reject(new Error('The `upTo` parameter must be a string.'));
            }
            params.upto = options.upTo;
        }
        return this._plug.at('page', utility.getResourceId(pageId, 'home')).withParams(params).get()
            .then((r) => r.json()).then(modelParser.createParser(pageHistoryModel));
    }

    /**
     * Get page history detail.
     * @param {Number|String} pageId = 'home' - The page ID or path.
     * @param {String} detailId - The detail ID.
     * @param {Object} [options] - Options to direct the fetching of the detail.
     * @param {Array} [options.include] - An array of strings identifying elements to expand in the result. Valid identifiers are: 'page', 'user', 'file', and 'request'.
     * @returns {Promise.<pageHistoryModel>} - A Promise that, when resolved, yields a {@link pageHistoryDetailModel} that contains the listing of the page events.
     */
    getPageHistoryDetail(pageId, detailId, options = {}) {
        if(!pageId) {
            return Promise.reject(new Error('The page ID is required to fetch a page history detail.'));
        }
        if(!detailId) {
            return Promise.reject(new Error('The detail ID is required to fetch a page history detail.'));
        }
        const params = {};
        if(options.include) {
            if(!Array.isArray(options.include)) {
                return Promise.reject(new Error('The `include` parameter must be an array.'));
            }
            params.include = options.include.join(',');
        }
        return this._plug.at('page', utility.getResourceId(pageId, 'home'), detailId).withParams(params).get()
            .then((r) => r.json()).then(modelParser.createParser(pageHistoryDetailModel));
    }

    /**
     * Log a search event that is performed by a specific user.
     * @param {Number|String} [userId=current] - The user's numeric ID or username.
     * @param {Object} [eventData] - Specific data about the search that was performed.
     * @returns {Promise} - A Promise that, when resolved, indicates a successful posting of the search event.
     */
    logSearch(userId, eventData) {
        return this._plug.at('search', utility.getResourceId(userId, 'current')).post(JSON.stringify(eventData), utility.jsonRequestType);
    }

    /**
     * Get the available user activity logs.
     * @returns {Promise.<reportLogsModel>} - A Promise that, when resolved, yields a {@link reportLogsModel} containing the available logs for user activity.
     */
    getUserActivityLogs() {
        return this._plug.at('support-agent', 'logs').get()
            .then((r) => r.json()).then(modelParser.createParser(reportLogsModel));
    }

    /**
     * Get the user activity log url.
     * @param {String} logName - Name of log to retrive URL from.
     * @returns {Promise.<logUrlModel>} - A Promise that, when resolved, yields a {@link logUrlModel} containing log url.
     */
    getUserActivityLogUrl(logName) {
        if(!logName) {
            return Promise.reject(new Error('Attempting to get log url without required name'));
        }
        return this._plug.at('support-agent', 'logs', logName, 'url').get()
            .then((r) => r.json()).then(modelParser.createParser(logUrlModel));
    }

    /**
     * Get the user activity.
     * @param {Number|String} userActivityToken - A token that identifies the user from an user activity perspective. It can be the user's numeric ID, username, or another system-defined token.
     * @param {Object} [options] - Additional information to direct the activity fetching.
     * @param {Number} [options.limit=10] - The maximum number results to retrieve.
     * @param {Array} [options.include] - An array of strings identifying elements to expand in the result. Valid identifiers are: 'user', 'page', and 'request'.
     * @param {String|Date} [options.upTo] - The marker used to paginate.
     * @returns {Promise.<userActivityModel>} - A Promise that, when resolved, yields a {@link userActivityModel} containing the user's activity events.
     */
    getUserActivity(userActivityToken, options = {}) {
        if(!userActivityToken) {
            return Promise.reject(new Error('The user activity token must be supplied'));
        }
        let token;
        try {
            token = utility.getNormalizedUserActivityToken(userActivityToken);
        } catch(e) {
            return Promise.reject(e);
        }
        const params = {};
        if(options.limit) {
            if(typeof options.limit !== 'number') {
                return Promise.reject(new Error('The `limit` parameter must be a number.'));
            }
            params.limit = options.limit;
        }
        if(options.include) {
            if(!Array.isArray(options.include)) {
                return Promise.reject(new Error('The `include` parameter must be an array.'));
            }
            params.include = options.include.join(',');
        }
        if(options.upTo) {
            if(typeof options.upTo !== 'string' && !(options.upTo instanceof Date)) {
                return Promise.reject(new Error('The `upTo` parameter must be a string or a Date.'));
            }
            if(options.upTo instanceof Date) {
                params.upto = utility.getApiDateString(options.upTo);
            } else {
                params.upto = options.upTo;
            }
        }
        return this._plug.at('support-agent', token).withParams(params).get()
            .then((r) => r.json()).then(modelParser.createParser(userActivityModel));
    }

    /**
     * Get the user's history events.
     * @param {Number|String} [userId=current] - The user's numeric ID or username.
     * @param {Object} [options] - Additional options to direct the history fetching.
     * @param {Number} [options.limit=10] - The maximum number results that we want to retrieve.
     * @param {Array} [options.include] - An array of elements you'd like to expand. If specified, valid entries are 'user', 'page', and 'request'.
     * @param {String|Date} [options.upTo] - The marker used to paginate.
     * @returns {Promise.<userHistoryModel>} - A Promise that, when resolved, yields a {@link userHistoryModel} that contains the listing of the user's events.
     */
    getUserHistory(userId = 'current', options = {}) {
        const params = {};
        if(options.limit) {
            if(typeof options.limit !== 'number') {
                return Promise.reject(new Error('The `limit` parameter must be a number.'));
            }
            params.limit = options.limit;
        }
        if(options.include) {
            if(!Array.isArray(options.include)) {
                return Promise.reject(new Error('The `include` parameter must be an array.'));
            }
            params.include = options.include.join(',');
        }
        if(options.upTo) {
            if(typeof options.upTo !== 'string' && !(options.upTo instanceof Date)) {
                return Promise.reject(new Error('The `upTo` parameter must be a string or a Date.'));
            }
            if(options.upTo instanceof Date) {
                params.upto = utility.getApiDateString(options.upTo);
            } else {
                params.upto = options.upTo;
            }
        }
        return this._plug.at('user-page', utility.getResourceId(userId, 'current')).withParams(params).get()
            .catch((e) => Promise.reject(_errorParser$1(e)))
            .then((r) => r.json())
            .then(modelParser.createParser(pageHistoryModel));
    }

    /**
     * Get the details of a specific user event.
     * @param {String} detailId - The detail ID of the event.
     * @param {Object} [options] - Information to direct the detail to fetch.
     * @param {Array} [options.include] - An array of strings identifying elements to expand in the result. Valid identifiers are: 'page', 'user', 'file', and 'request'.
     * @returns {Promise.<userHistoryDetailModel>} - A Promise that, when resolved, yields a {@link userHistoryDetailModel} that contains the event information.
     */
    getUserHistoryDetail(detailId, options = {}) {
        if(!detailId) {
            return Promise.reject(new Error('The detail ID must be supplied'));
        }
        const params = {};
        if(options.include) {
            if(!Array.isArray(options.include)) {
                return Promise.reject(new Error('The `include` parameter must be an array.'));
            }
            params.include = options.include.join(',');
        }
        return this._plug.at('user-page', 'current', detailId).withParams(params).get()
            .then((r) => r.json()).then(modelParser.createParser(pageHistoryModel));
    }

    /**
     * Log a web widget impression event. This request will fail if not called from a MindTouch web widget.
     * @returns {Promise} - A Promise that, when resolved, contains the status of the web widget impression request.
     */
    logWebWidgetImpression() {
        return this._plug.at('web-widget-impression').post();
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const fileRevisionsModel = [
    { field: '@count', name: 'count', transform: 'number' },
    { field: '@totalcount', name: 'totalCount', transform: 'number' },
    { field: '@href', name: 'href' },
    { field: 'file', isArray: true, transform: fileModel }
];

/**
 * A class for working with file attachments within the MindTouch site.
 */
class File {

    /**
     * Construct a new File object.
     * @param {Number} id - The resource ID of the file.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(id, settings = new Settings()) {
        this._id = id;
        this._settings = settings;
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'files', id);
        this._progressPlug = new ProgressPlug(settings.host, settings.plugConfig).at('@api', 'deki', 'files', id);
        this._errorParser = modelParser.createParser(apiErrorModel);
    }

    /**
     * Get the file attachment information.
     * @returns {Promise.<fileModel>} - A Promise that, when resolved, yields a {@link fileModel} containing the attachment information.
     */
    getInfo() {
        let fileModelParser = modelParser.createParser(fileModel);
        return this._plug.at('info').get().then((r) => r.json()).then(fileModelParser);
    }

    /**
     * Get the revision list of the file attachment.
     * @returns {Promise.<fileRevisionsModel>} - A Promise that, when resolved, yields a {@link fileRevisionsModel} containing the revision listing.
     */
    getRevisions() {
        return this._plug.at('revisions').get().then((r) => r.json()).then(modelParser.createParser(fileRevisionsModel));
    }

    /**
     * Set the description for the file.
     * @param {String} description - The new file description.
     * @returns {Promise.<fileModel>} - A Promise that, when resolved, yields a {@link fileModel} containing the file information.
     */
    setDescription(description) {
        let fileModelParser = modelParser.createParser(fileModel);
        return this._plug.at('description').put(description, utility.textRequestType).then((r) => r.json()).then(fileModelParser);
    }

    /**
     * Delete the file from the MindTouch site.
     * @returns {Promise} - A Promise that, when resolved, indicates a successful file deletion.
     */
    delete() {
        return this._plug.delete();
    }

    /**
     * Upload a new file to serve as a revision in place of the current file.
     * @param {File} file - The file object to upload.
     * @param {String} filename - The filename of the new revision.
     * @param {function} progress - A function that is called to indicate upload progress before the upload is complete.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the updated file data, or rejected with an error specifying the reason for rejection.
     */
    addRevision(file, { name = file.name, size = file.size, type = file.type, progress = null } = {}) {
        if(progress !== null) {
            const progressInfo = { callback: progress, size };
            return this._progressPlug.at(utility.getResourceId(name)).put(file, type, progressInfo).then((r) => JSON.parse(r.responseText)).then(modelParser.createParser(fileModel));
        }
        return this._plug.withHeader('Content-Length', size).at(utility.getResourceId(name)).put(file, type).then((r) => r.json()).then(modelParser.createParser(fileModel));
    }

    /**
     * Move the file to a new page.
     * @param {Object} params - The parameters that direct the API request.
     * @param {Number} params.to - The page ID of the page to move to.
     * @param {String} params.name - The name of the new, moved file.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the updated file data, or rejected with an error specifying the reason for rejection.
     */
    move(params = {}) {
        if(!params.to) {
            return Promise.reject(new Error('The `to` parameter must be specified to move a file.'));
        }
        if(!params.name) {
            return Promise.reject(new Error('The `name` parameter must be specified to move a file.'));
        }
        return this._plug.at('move')
            .withParams(params)
            .post(null, utility.textRequestType)
            .then((r) => r.json())
            .then(modelParser.createParser(fileModel))
            .catch((err) => Promise.reject(this._errorParser(err)));
    }
}

class FileDraft extends File {

    /**
     * @param {Number} id - The resource ID of the file.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(id, settings = new Settings()) {
        super(id, settings);
        this._plug = this._plug.withParam('draft', 'true');
        this._progressPlug = this._progressPlug.withParam('draft', 'true');
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const groupListModel = [
    { field: '@count', name: 'count', transform: 'number' },
    { field: '@querycount', name: 'queryCount', transform: 'number' },
    { field: '@totalcount', name: 'totalCount', transform: 'number' },
    { field: '@href', name: 'href' },
    { field: 'group', name: 'groups', isArray: true, transform: groupModel }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const userListModel = [
    { field: '@count', name: 'count', transform: 'number' },
    { field: '@querycount', name: 'queryCount', transform: 'number' },
    { field: '@totalcount', name: 'totalCount', transform: 'number' },
    { field: '@href', name: 'href' },
    { field: 'user', name: 'users', isArray: true, transform: userModel }
];

/**
 * A class for managing a single group of users.
 */
class Group {

    /**
     * Construct a new Group object.
     * @param {Number|String} id - The integer group ID, or the group name string.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(id, settings = new Settings()) {
        if(!id) {
            throw new Error('A group ID must be supplied');
        }
        this._id = utility.getResourceId(id);
        this._groupPlug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'groups', this._id);
        this._errorParser = modelParser.createParser(apiErrorModel);
    }

    /**
     * Get the group information.
     * @returns {Promise.<groupModel>} - A Promise that, when resolved, yields a {@link groupModel} containing the group information.
     */
    getInfo() {
        return this._groupPlug.get().then((r) => r.json()).then(modelParser.createParser(groupModel));
    }

    /**
     * Get a list of optionally-filtered group users.
     * @param {Object} options - The filtering options for fetching the listing.
     * @param {String} [options.usernamefilter] - Search for users by name or part of a name.
     * @param {Number} [options.offset=0] - Number of items to skip. Must be a positive number or 0 to not skip any.
     * @param {Number|String} [options.limit=100] - Maximum number of items to retrieve. Must be a positive number or 'all' to retrieve all items.
     * @param {Boolean} [options.activatedfilter] - Search for users by their active status.
     * @param {String} [options.rolefilter] - Search for users by a role name.
     * @param {String} [options.sortby] - Sort field. Prefix value with '-' to sort descending. Valid values are: `id`, `username`, `nick`, `email`, `fullname`, `date.lastlogin`, `status`, `role`, `service`
     * @returns {Promise.<userListModel>} - A Promise that, when resolved, yields a {@link userListModel} with the users listing.
     */
    getUsers(options) {
        return this._groupPlug.at('users').withParams(options).get().then((r) => r.json()).then(modelParser.createParser(userListModel));
    }

    /**
     * Remove given member from a group
     * @param {Number|String} userId - either an integer user ID, "current", or the username of the user to remove from the group.
     * @returns {Promise} A Promise that, when resolved, yields a groupModel containing information about the group that the user was removed from.
     */
    removeUser(userId) {
        return this._groupPlug.at('users', utility.getResourceId(userId, 'current'))
            .delete()
            .catch((err) => Promise.reject(this._errorParser(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(groupModel));
    }

    /**
     * Remove the group from the site
     * @returns {Promise} A Promise that, when resolved, indicates the group was deleted successfully.
     */
    delete() {
        return this._groupPlug.delete();
    }
}

/**
 * A class to manage the groups defined on the MindTouch site.
 */
class GroupManager {

    /**
     * Construct a GroupManager object.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(settings = new Settings()) {
        this.plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'groups');
        this.settings = settings;
    }

    /**
     * Get the listing of all of the groups defined on the site.
     * @param {Object} options - The options to direct the fetching of the groups
     * @param {String} options.nameFilter - Search for groups by name or part of a name
     * @param {Number} options.authProvider - Return groups belonging to given authentication service id
     * @param {Number|String} options.limit - Maximum number of items to retrieve. Must be a positive number or 'all' to retrieve all items. (default: 100)
     * @param {Number} options.offset - Number of items to skip. Must be a positive number or 0 to not skip any. (default: 0)
     * @param {String} options.sortBy - Sort field. Prefix value with '-' to sort descending. default: No sorting. Must be one of 'id', 'name', 'role', 'service'
     * @returns {Promise.<groupListModel>} - A Promise that, when resolved, yields a {@link groupListModel} containing the group listing.
     */
    getGroupList(options = {}) {
        const params = {};
        if('nameFilter' in options) {
            if(typeof options.nameFilter !== 'string') {
                return Promise.reject(new Error('The group name filter must be a string'));
            }
            if(options.nameFilter !== '') {
                params.groupnamefilter = options.nameFilter;
            }
        }
        if('authProvider' in options) {
            if(typeof options.authProvider !== 'number') {
                return Promise.reject(new Error('The auth provider ID must be a number'));
            }
            params.authprovider = options.authProvider;
        }
        if('limit' in options) {
            if(typeof options.limit !== 'number' && options.limit !== 'all') {
                return Promise.reject(new Error('The limit parameter must be a number or "all"'));
            }
            params.limit = options.limit;
        }
        if('offset' in options) {
            if(typeof options.offset !== 'number') {
                return Promise.reject(new Error('The offset parameter must be a number'));
            }
            params.offset = options.offset;
        }
        if('sortBy' in options) {
            if(typeof options.sortBy !== 'string') {
                return Promise.reject(new Error('The sortBy option must be a string'));
            }
            const validSortParams = [ 'id', 'name', 'role', 'service', '-id', '-name', '-role', '-service' ];
            if(!validSortParams.includes(options.sortBy)) {
                return Promise.reject(new Error(`The sortBy option must be one of ${validSortParams.join(', ')}`));
            }
            params.sortby = options.sortBy;
        }
        return this.plug.withParams(params).get().then((r) => r.json()).then(modelParser.createParser(groupListModel));
    }

    /**
     * Get a Group object based on ID.
     * @param {Number|String} id - The integer group ID, or the group name string.
     * @returns {Group} - A new {@link Group} object for managing the group.
     */
    getGroup(id) {
        return new Group(id, this.settings);
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const learningPathModel = [
    { field: 'title' },
    { field: '@name', name: 'name' },
    { field: 'summary' },
    { field: 'pages', isArray: true, transform: pageModel },
    { field: 'edittime', name: 'editTime' },
    { field: 'uri.learningpath', name: 'uri' },
    { field: 'category' }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const learningPathsModel = [
    { field: 'learningpath', name: 'learningPaths', isArray: true, transform: learningPathModel }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const learningPathCategoriesModel = [
    { field: [ 'categories', 'category' ], name: 'categories', isArray: true }
];

class LearningPath {

    /**
     * Create a new Learning Path.
     * @param {String} name The name of the Learning Path represented by this instance.
     * @param {Settings} settings The martian settings to direct the Learning Path API calls.
     */
    constructor(name, settings = new Settings()) {
        this._name = name;
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'learningpaths', `=${name}`);
    }

    /**
     * Get the learning path data.
     * @param {String|Number} revision The positive integer or GUID that refers to a specific revision to fetch. If not supplied, the latest revision will be fetched.
     * @returns {Promise} A promise that, when resolved, yields a learningPathModel representing the learning path.
     */
    getInfo(revision) {
        const params = {};
        if(revision) {
            params.revision = revision;
        }
        return this._plug.withParams(params).get()
            .then((r) => r.json()).then(modelParser.createParser(learningPathModel));
    }

    /**
     * Update the contents of the learning path
     * @param {Object} content The content fields to update
     * @param {String} content.title The new title of the learning path.
     * @param {String} [content.summary] The new summary of the learning path. If not supplied, the summary is cleared.
     * @param {String} [content.category] The new category of the learning path. If not supplied, the category is cleared.
     * @param {Array} [content.pageIds] An array of page IDs that represents the new orderde set of pages in the learning path. If not supplied, the pages are cleared.
     * @param {Date|String} [editTime=now] Current learning path's edit timestamp, or the string 'now' bypass concurrent edit check.
     * @returns {Promise} A promise that, when resolved, yields a learningPathModel representing the updated learning path.
     */
    update(content, editTime = 'now') {
        if(!content) {
            return Promise.reject('The content parameter must be supplied to update a learning path');
        }
        if(!content.title || typeof content.title !== 'string' || content.title === '') {
            return Promise.reject('The title parameter must be supplied, and must be a non-empty string.');
        }
        let xmlData = `<title>${content.title}</title>`;
        if(content.summary) {
            if(typeof content.summary !== 'string') {
                return Promise.reject('The summary parameter must be a string');
            }
            xmlData += `<summary>${content.summary}</summary>`;
        }
        if(content.category) {
            if(typeof content.category !== 'string') {
                return Promise.reject('The summary parameter must be a string');
            }
            xmlData += `<category>${content.category}</category>`;
        }
        if(content.pageIds) {
            if(!Array.isArray(content.pageIds)) {
                return Promise.reject('The pages parameter must be an array');
            }
            xmlData += content.pageIds.reduce((acc, id) => acc + `<pages>${id}</pages>`, xmlData);
        }
        const reqBody = `<learningpath>${xmlData}</learningpath>`;
        return this._plug.withParam('edittime', editTime).post(reqBody, utility.xmlRequestType)
            .then((r) => r.json()).then(modelParser.createParser(learningPathModel));
    }

    /**
     * Remove the learning path.
     * @returns {Promise} A promise that, when resolved, indicates successful removal of the learning path.
     */
    remove() {
        return this._plug.delete();
    }

    /**
     * Clone the learning path, and give it the specified name.
     * @param {String} newName The new name for the learning path clone.
     * @returns {Promise} A promise that, when resolved, yields a learningPathModel containing the information about the cloned learning path.
     */
    clone(newName) {
        if(typeof newName !== 'string' || newName === '') {
            return Promise.reject('The new name for the clone must be a non-empty string.');
        }
        return this._plug.at('clone').withParam('name', newName).post(null, utility.textRequestType)
            .then((r) => r.json()).then(modelParser.createParser(learningPathModel));
    }

    /**
     * Revert the Learning Path to a specific revision.
     * @param {String|Number} revision The positive integer or GUID that refers to a specific revision to revert to.
     * @param {Date|String} [editTime=now] The previous revision's edit timestamp. Defaults to "now" to bypass concurrent edit check.
     * @returns {Promise} A Promise that, when resolved, yields a learningPathModel that represents the state of the learning path after the revert has completed.
     */
    revertToRevision(revision, editTime = 'now') {
        if(!revision) {
            return Promise.reject(new Error('The revision parameter is required'));
        }
        return this._plug.at('revert').withParams({ torevision: revision, edittime: editTime }).post()
            .then((r) => r.json()).then(modelParser.createParser(learningPathModel));
    }

    /**
     * Add a page to the learning path
     * @param {Number} pageId The numeric ID of the page to add to the Learning Path.
     * @param {Date|String} [editTime=now] The previous revision's edit timestamp. Defaults to "now" to bypass concurrent edit check.
     * @returns {Promise} A Promise that, when resolved, returns a pageModel representing the page that was added.
     */
    addPage(pageId, editTime = 'now') {
        return this._plug.at('pages', pageId).withParam('edittime', editTime).post()
            .then((r) => r.json()).then(modelParser.createParser(pageModel));
    }

    /**
     * Remove a page from a learning path
     * @param {Number} pageId The numeric ID of the page to remove from the Learning Path.
     * @param {Date|String} [editTime=now] The previous revision's edit timestamp. Defaults to "now" to bypass concurrent edit check.
     * @returns {Promise} A Promise that, when resolved, indicates that the page was successfully removed.
     */
    removePage(pageId, editTime = 'now') {
        return this._plug.at('pages', pageId).withParam('edittime', editTime).delete();
    }

    /**
     * Change the index of a page in a learning path
     * @param {Number} pageId The numeric ID of the page that is the target of the reorder operation.
     * @param {Number} [afterId=0] The page id after which this page should be placed. A value of 0 will place it at the beginning.
     * @param {Date|String} [editTime=now] The previous revision's edit timestamp. Defaults to "now" to bypass concurrent edit check.
     * @returns {Promise} A Promise that, when resolved, yields a learningPathModel representing the learning path after a successful page reorder.
     */
    reorderPage(pageId, afterId = 0, editTime = 'now') {
        return this._plug.at('pages', pageId, 'order').withParams({ edittime: editTime, afterid: afterId }).post()
            .then((r) => r.json()).then(modelParser.createParser(learningPathModel));
    }
}
class LearningPathManager {

    /**
     * Create a new LearningPathManager
     * @param {Settings} settings The martian settings to direct the Learning Path API calls.
     */
    constructor(settings = new Settings()) {
        this.settings = settings;
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'learningpaths');
    }

    /**
     * Get information for all of the site learning paths.
     * @returns {Promise} A Promise that, when resolved, yields a learningPathsModel containing the information of all of the learning paths.
     */
    getLearningPaths() {
        return this._plug.get().then((r) => r.json()).then(modelParser.createParser(learningPathsModel));
    }

    /**
     * Create a new learning path
     * @param {Object} data The data parameters for the new Learning Path.
     * @param {String} data.name The string ID for the new Learning Path.
     * @param {String} data.title The title for the new Learning Path.
     * @param {String} [data.summary] A brief description for the new Learning Path.
     * @param {String} [data.category] The category to put the learning path in.
     * @returns {Promise} A Promise that, when resolved, yields a learningPathModel containing the information for the new learning path.
     */
    createLearningPath(data) {
        if(!data) {
            return Promise.reject(new Error('Unable to create a learning path without data.'));
        }
        if(!data.name || typeof data.name !== 'string' || data.name === '') {
            return Promise.reject(new Error('The `name` parameter must be supplied, and must be a non-empty string.'));
        }
        if(!data.title || typeof data.title !== 'string' || data.title === '') {
            return Promise.reject(new Error('The `title` parameter must be supplied, and must be a non-empty string.'));
        }
        if(data.summary) {
            if(typeof data.summary !== 'string') {
                return Promise.reject(new Error('The `summary` parameter must be a string.'));
            }
        }
        if(data.category) {
            if(typeof data.category !== 'string') {
                return Promise.reject(new Error('The `category` parameter must be a string.'));
            }
        }
        return this._plug.withParams(data).post().then((r) => r.json()).then(modelParser.createParser(learningPathModel));
    }

    /**
     * Get a list of all of the categories used amongst all learning paths.
     * @returns {Promise} A Promise that, when resolved, yields an object containing the list of all of the learning path categories.
     */
    getCategories() {
        return this._plug.at('categories').get().then((r) => r.json())
            .then(modelParser.createParser(learningPathCategoriesModel));
    }

    /**
     * Get a {@see LearningPath} instance based on the name identifier
     * @param {String} name The name for the learning path object to create.
     * @returns {LearningPath} A LearningPath instance that provides API access to a single learning path.
     */
    getLearningPath(name) {
        return new LearningPath(name, this.settings);
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const helpRequestData = [
    { field: '@name', name: 'name' },
    { field: '@count', name: 'count', transform: 'number' }
];
const licenseUsageModel = [
    { field: '@count', name: 'count', transform: 'number' },
    { field: '@date.start', name: 'startDate', transform: 'apiDate' },
    { field: '@date.expiration', name: 'expirationDate', transform: 'apiDate' },
    { field: '@anually-licensed-help-requests', name: 'annuallyLicensedHelpRequests' },
    {
        field: 'totals',
        isArray: true,
        transform: [
            { field: '@date', name: 'date', transform: 'apiDate' },
            { field: [ 'custom', 'origin' ], name: 'customRequests', isArray: true, transform: helpRequestData },
            { field: [ 'mt-requests', 'origin' ], name: 'mtRequests', isArray: true, transform: helpRequestData }
        ]
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const licenseUsageLogsModel = [
    {
        field: 'log',
        name: 'logs',
        isArray: true,
        transform: [
            { field: '@complete', name: 'complete', transform: 'boolean' },
            { field: 'name' },
            { field: 'modified', transform: 'date' },
            { field: 'month' }
        ]
    }
];

class License {

    /**
     * Construct a new License object.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(settings = new Settings()) {
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'license');
    }

    /**
     * Retrieve license usage totals for the current license period
     * @param {Object} [options] - Parameters that will direct the usage information that is returned.
     * @param {Date} [options.since] - Get license usage starting at this date.
     * @param {Date} [options.upTo=Date.now()] - Get license usage ending at this date.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the license usage data, or rejected with an error specifying the reason for rejection.
     */
    getUsage(options = {}) {
        const params = {};
        if(options.since) {
            if(!(options.since instanceof Date)) {
                return Promise.reject(new Error('The `since` parameter must be of type Date.'));
            }
            params.since = utility.getApiDateString(options.since);
        }
        if(options.upTo) {
            if(!(options.upTo instanceof Date)) {
                return Promise.reject(new Error('The `upTo` parameter must be of type Date.'));
            }
            params.upto = utility.getApiDateString(options.upTo);
        }
        return this._plug.at('usage').withParams(params).get().then((r) => r.json()).then(modelParser.createParser(licenseUsageModel));
    }

    /**
     * Retrieve license usage totals for the current license period.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the usage logs data, or rejected with an error specifying the reason for rejection.
     */
    getUsageLogs() {
        return this._plug.at('usage', 'logs').get().then((r) => r.json()).then(modelParser.createParser(licenseUsageLogsModel));
    }

    /**
     * Retrieve the download URL for a license usage log.
     * @param {String} name - The name identifier for the usage log.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the log URL data, or rejected with an error specifying the reason for rejection.
     */
    getUsageLogUrl(name) {
        if(!name) {
            return Promise.reject(new Error('The log name must be supplied.'));
        }
        return this._plug.at('usage', 'logs', name, 'url')
            .get()
            .then((r) => r.json())
            .then(modelParser.createParser([ { field: 'url' } ]));
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let subpagesModel = [
    { field: '@totalcount', name: 'totalCount', transform: 'number' },
    { field: '@count', name: 'count', transform: 'number' },
    { field: '@href', name: 'href' },
    {
        field: 'page.subpage',
        name: 'subpages',
        isArray: true,
        transform: pageModel
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const pageTreeModel = {
    preProcessor(data) {
        if(data.page) {
            return data.page;
        }
    },
    model: [
        { field: '@id', name: 'id', transform: 'number' },
        { field: '@guid', name: 'guid' },
        { field: '@draft.state', name: 'draftState' },
        { field: '@href', name: 'href' },
        { field: '@deleted', name: 'deleted', transform: 'boolean' },
        { field: 'date.created', name: 'dateCreated', transform: 'date' },
        { field: 'namespace', name: 'namespace' },
        { field: [ 'path', '#text' ], name: 'path' },
        { field: 'title', name: 'title' },
        { field: 'uri.ui', name: 'uri' }
    ]
};
pageTreeModel.model.push({
    field: 'subpages',
    isArray: true,
    constructTransform(val) {
        if(val.page) {
            return pageTreeModel;
        }
    }
});

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let pageMoveModel = [
    {
        field: '@count',
        name: 'count',
        transform: 'number'
    },
    {
        field: 'page',
        name: 'pages',
        isArray: true,
        transform: pageModel
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let pageRatingsModel = [
    {
        field: '@count',
        name: 'count',
        transform: 'number'
    },
    {
        field: '@href',
        name: 'href'
    },
    {
        field: 'page',
        name: 'pages',
        isArray: true,
        transform: pageModel
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let pageDeleteModel = [
    {
        field: '@count',
        name: 'count',
        transform: 'number'
    },
    {
        field: 'page',
        name: 'pages',
        isArray: true,
        transform: pageModel
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const importArchiveModel = [
    { field: 'uri.status', name: 'statusUri' }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const pageExportModel = [
    { field: 'uri.download', name: 'downloadUri' }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const pageFindModel = [
    { field: '@count', name: 'count', transform: 'number' },
    { field: '@totalcount', name: 'totalCount', transform: 'number' },
    { field: 'page', name: 'pages', isArray: true, transform: pageModel }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const pageLinkDetailsModel = [
    { field: 'count', transform: 'number' },
    { field: 'querycount', name: 'queryCount', transform: 'number' },
    {
        field: 'pages',
        isArray: true,
        transform: [
            {
                field: 'links',
                isArray: true,
                transform: [
                    { field: '@sequence', name: 'sequence', transform: 'number' },
                    { field: '@isredirect', name: 'isRedirect', transform: 'boolean' },
                    { field: '@isbroken', name: 'isBroken', transform: 'boolean' },
                    { field: 'class' },
                    { field: 'href' },
                    { field: 'rel' },
                    { field: 'text' },
                    { field: 'type' },
                    { field: [ 'destination', 'page' ], name: 'destinationPage', transform: pageModel },
                    { field: [ 'destination', 'file' ], name: 'destinationFile', transform: fileModel }
                ]
            },
            { field: 'page', transform: pageModel }
        ]
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const healthReportModel = [
    { field: 'count', transform: 'number' },
    { field: 'querycount', name: 'queryCount', transform: 'number' },
    {
        field: 'inspections',
        isArray: true,
        transform: [
            { field: '@severity', name: 'severity' },
            { field: '@type', name: 'type' },
            { field: 'message' },
            {
                field: 'page',
                transform: [
                    { field: '@uri', name: 'uri' },
                    { field: '@id', name: 'id', transform: 'number' }
                ]
            }
        ]
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const templateListModel = [
    { field: '@count', name: 'count', transform: 'number' },
    {
        field: 'template',
        name: 'templates',
        isArray: true,
        transform: [
            { field: 'description' },
            { field: 'id', transform: 'number' },
            { field: 'path' },
            { field: 'title' }
        ]
    }
];

const _errorParser$2 = modelParser.createParser(apiErrorModel);

/**
 * A class for managing a published page.
 */
class Page extends PageBase {

    /**
     * Construct a new Page.
     * @param {Number|String} [id='home'] The numeric page ID or the page path.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(id = 'home', settings = new Settings()) {
        super(id);
        this._settings = settings;
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'pages', this._id);
    }

    /**
     * Gets the basic page information.
     * @param {Object} [params] - Additional parameters to direct the API request.
     * @returns {Promise.<pageModel>} - A Promise that, when resolved, yields a {@link pageModel} containing the basic page information.
     */
    getInfo(params = {}) {
        let infoParams = { exclude: 'revision' };
        Object.keys(params).forEach((key) => {
            infoParams[key] = params[key];
        });
        let pageModelParser = modelParser.createParser(pageModel);
        return this._plug.at('info').withParams(infoParams).get().then((r) => r.json()).then(pageModelParser);
    }

    /**
     * Get the subpages of the page.
     * @param {Object} [params] - Additional parameters to direct the API request.
     * @returns {Promise.<subpagesModel>} - A Promise that, when resolved, yields a {@link subpagesModel} containing the basic page information.
     */
    getSubpages(params) {
        return this._plug.at('subpages').withParams(params).get().then((r) => r.json()).then(modelParser.createParser(subpagesModel));
    }

    /**
     * Get a hierarchy tree based on the current page.
     * @param {Object} [params] - Additional parameters to direct the API request.
     * @returns {Promise.<pageTreeModel>} - A Promise that, when resolved, yields a {@link pageTreeModel} containing the basic page information.
     */
    getTree(params) {
        let pageTreeModelParser = modelParser.createParser(pageTreeModel);
        return this._plug.at('tree').withParams(params).get().then((r) => r.json()).then(pageTreeModelParser);
    }

    /**
     * Get the hierarchical list of pages IDs from the current page to the home page.
     * @returns {Promise.<Array>} - The array of hierarchical page IDs.
     */
    getTreeIds() {
        return this._plug.at('tree').withParam('format', 'ids').get().then((r) => r.text()).then((idString) => {
            return idString.split(',').map((id) => {
                let numId = parseInt(id, 10);
                if(isNaN(numId)) {
                    throw new Error('Unable to parse the tree IDs.');
                }
                return numId;
            });
        }).catch((e) => {
            return Promise.reject({ message: e.message });
        });
    }

    /**
     * Gets the rating information for the page.
     * @returns {Promise.<pageRatingModel>} - A Promise that, when resolved, yields a {@link pageRatingModel} containing the rating information.
     */
    getRating() {
        return this._plug.at('ratings').get().then((r) => r.json()).then(modelParser.createParser(pageRatingModel));
    }

    /**
     * Set the rating for the page.
     * @param {Number|null} [rating=null] - The new rating for the page.
     * @param {Number|null} [oldRating=null] - The old rating for the page that is being replaced by {@see rating}.
     * @returns {Promise.<pageRatingModel>} - A Promise that, when resolved, yields a {@link pageRatingModel} containing the new rating information.
     */
    rate(rating = null, oldRating = null) {
        if(rating !== 1 && rating !== 0 && rating !== null) {
            throw new Error('Invalid rating supplied');
        }
        if(oldRating !== 1 && oldRating !== 0 && oldRating !== null) {
            throw new Error('Invalid rating supplied for the old rating');
        }
        if(rating === null) {
            rating = '';
        }
        if(oldRating === null) {
            oldRating = '';
        }
        return this._plug.at('ratings').withParams({ score: rating, previousScore: oldRating }).post(null, utility.textRequestType).then((r) => r.json()).then(modelParser.createParser(pageRatingModel));
    }

    /**
     * Gets a MindTouch template rendered in the context of the current page, as HTML.
     * @param {String} path - The template path.
     * @param {Object} [params] - Additional parameters to direct the API request.
     * @returns {Promise.<pageContentsModel>} - A Promise that, when resolved, yields the rendered HTML within a {@link pageContentsModel}.
     */
    getHtmlTemplate(path, params = {}) {
        params.pageid = this._id;

        // Double-URL-encode the path and add '=' to the beginning.  This makes
        //  it a proper page ID to be used in a URI segment.
        let templatePath = '=' + encodeURIComponent(encodeURIComponent(path));
        let contentsPlug = new Plug(this._settings.host, this._settings.plugConfig).at('@api', 'deki', 'pages', templatePath, 'contents').withParams(params);
        let pageContentsModelParser = modelParser.createParser(pageContentsModel);
        return contentsPlug.get().then((r) => r.json()).then(pageContentsModelParser);
    }

    /**
     * Copy a page to a specified location
     * @param {Object} params - The params that direct the copy operation.
     * @param {String} params.to - The new page location including the path and name of the page.
     * @param {String} [params.title] - Set the title of the page. If not specified, default to the original title.
     * @param {Boolean} [params.tags=true] - Copy the tags of the page on copy.
     * @param {Boolean} [params.attachments=true] - Copy the attachments of the page on copy.
     * @param {Boolean} [params.recursive=false] - Copy the child hierarchy of the original page.
     * @param {String} [params.abort='exists'] - Specifies condition under which to prevent the update. Allowed values are 'exists' and 'never'.
     * @param {String} [params.allow] - Specifies condition under which to allow the update when an error would normally be thrown.
     * @returns {Promise.<pageMoveModel>} - A Promise that, when resolved, yields a {@link pageMoveModel} containing information regarding the move operation.
     */
    copy(params = {}) {
        if(!params.to) {
            return Promise.reject(new Error('The copy target location must be specified in the `to` parameter.'));
        }
        if(params.abort && params.abort !== 'exists' && params.abort !== 'never') {
            return Promise.reject(new Error('The `abort` parameter must be either "exists" or "never".'));
        }
        if(params.allow && params.allow !== 'deleteredirects') {
            return Promise.reject('The `allow` parameter, if specified, must have a value of "deleteredirects"');
        }
        return this._plug.at('copy')
            .withParams(params)
            .post(null, utility.textRequestType)
            .then((r) => r.json())
            .then(modelParser.createParser(pageMoveModel))
            .catch((err) => Promise.reject(_errorParser$2(err)));
    }

    /**
     * Move a page to a new location in the hierarchy.
     * @param {Object} [params] - Additional parameters to direct the API request.
     * @returns {Promise.<pageMoveModel>} - A Promise that, when resolved, yields a {@link pageMoveModel} containing information regarding the move operation.
     */
    move(params = {}) {
        return this._plug.at('move')
            .withParams(params)
            .post(null, utility.textRequestType)
            .then((r) => r.json())
            .then(modelParser.createParser(pageMoveModel))
            .catch((err) => Promise.reject(_errorParser$2(err)));
    }

    /**
     * Delete a page
     * @param {Boolean} [recursive=false] - Indicates whether or not the delete operation will also delete all child pages.
     * @returns {Promise.<pageDeleteModel>} - A Promise that, when resolved, yields a {@link pageDeleteModel} containing information regearding pages that were deleted.
     */
    delete(recursive = false) {
        const pageDeleteModelParser = modelParser.createParser(pageDeleteModel);
        return this._plug.withParam('recursive', recursive).delete().then((r) => r.json()).then(pageDeleteModelParser);
    }

    /**
     * Using the current page, activates a draft; copying the page's content and attachments.
     * @returns {Promise.<pageModel>} - A Promise that, when resolved, yields a {@link pageModel} containing the page information following the activation.
     */
    activateDraft() {
        let pageModelParser = modelParser.createParser(pageModel);
        return this._plug.at('activate-draft').post().then((r) => r.json()).then(pageModelParser);
    }

    /**
     * Import a MindTouch archive file as a child node of the page.
     * @param {File} file - A File object that either represents the file to import, or contains information about the upload target.
     * @param {Object} [options] - The file information options that is, by default populated from the `file` parameter.
     * @param {Object} [params] - Additional API parameters to send along with the request.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the import info data, or rejected with an error specifying the reason for rejection.
     */
    importArchive(file, { name = file.name, size = file.size, type = file.type, progress = null } = {}, params = {}) {
        const apiParams = Object.assign({ filename: name, behavior: 'async' }, params);
        if(progress !== null) {
            const progressPlug = new ProgressPlug(this._settings.host, this._settings.plugConfig).at('@api', 'deki', 'pages', this._id);
            const progressInfo = { callback: progress, size: size };
            return progressPlug.at('import').withParams(apiParams).put(file, type, progressInfo)
                .then((r) => JSON.parse(r.responseText))
                .catch((e) => Promise.reject(JSON.parse(e.responseText)))
                .then(modelParser.createParser(importArchiveModel));
        }
        return this._plug.withHeader('Content-Length', size).withParams(apiParams).at('import').put(file, type)
            .then((r) => r.json())
            .catch((e) => Promise.reject(JSON.parse(e.responseText)))
            .then(modelParser.createParser(importArchiveModel));
    }

    /**
     * Generates the information so that clients can stream down the exported page(s) in mtarc format.
     * @returns {Promise.<Object>} - A Promise that will be resolved with data describing the exported file, or rejected with an error specifying the reason for rejection.
     */
    getExportInformation() {
        return this._plug.at('export').post(null, utility.textRequestType).then((r) => r.json()).then(modelParser.createParser(pageExportModel));
    }

    /**
     * Export the page as a PDF.
     * @param {Object} [options] Options to direct the fetching of the PDF.
     * @param {String} [options.filename] The filename to save the PDF as.  If not supplied, uses the page's title.
     * @param {String} [options.format=pdf] The format to export. Must be one of "pdf" or "html".
     * @param {String} [options.stylesheet] The name of a custom stylesheet to apply.
     * @param {Boolean} [options.deep=false] If true, exports the page and all of its subpages.
     * @param {Boolean} [options.showToc=false] If true, includes a table of contents in the exported document.
     * @param {Boolean} [options.dryRun=false] If true, perform a simulated export to verify if an actual, subsequent export will be successful.
     * @returns {Promise} A Promise that when resolved, indicates that the export has completed successfully. If dryRun was set to false, the Promise resolution will provide a Blob containing the PDF contents.
     */
    exportPdf({ fileName, format = 'pdf', stylesheet, deep = false, showToc = false, dryRun = false } = {}) {
        const params = {};
        if(fileName) {
            if(typeof fileName !== 'string') {
                return Promise.reject(new Error('The fileName parameter must be a non-empty string'));
            }
            params.filename = fileName;
        }
        if(stylesheet) {
            if(typeof stylesheet !== 'string') {
                return Promise.reject(new Error('The stylesheet parameter must be a non-empty string'));
            }
            params.stylesheet = stylesheet;
        }
        if(format !== 'pdf' && format !== 'html') {
            return Promise.reject(new Error('The `format` parameter must be either "pdf" or "html".'));
        }
        params.format = format;
        if(typeof deep !== 'boolean') {
            return Promise.reject(new Error('The `deep` parameter must be a Boolean value.'));
        }
        params.deep = deep;
        if(typeof showToc !== 'boolean') {
            return Promise.reject(new Error('The `showToc` parameter must be a Boolean value.'));
        }
        params.showtoc = showToc;
        if(typeof dryRun !== 'boolean') {
            return Promise.reject(new Error('The `dryRun` parameter must be a Boolean value.'));
        }
        params.dryrun = dryRun;
        const respPromise = this._plug.at('pdf').withParams(params).get();
        if(dryRun) {
            return respPromise;
        }
        return respPromise.then((r) => r.blob());
    }

    /**
     * Set the order in which this page will occur in relation to its siblings.
     * @param {Number} afterId The page id after which this page should be placed. Defaults to 0 to place it at the beginning.
     * @returns {Promise} A Promise that, when resolved, indicates that the reorder operation succeeded.
     */
    setOrder(afterId = 0) {
        if(typeof afterId !== 'number') {
            return Promise.reject(new Error('The afterId must be a numeric page ID.'));
        }
        return this._plug.at('order').withParam('afterId', afterId).put();
    }

    /**
     * Retrieve the links that are in the page.
     * @param {Object} [options] Options to direct the fetching of the page's links.
     * @param {Boolean} [options.includeSubpages=false] Return information about links in subpages.
     * @param {Array} [options.linkTypes] An array of the link types to include ("broken" only if not specified).
     * @param {Boolean} [options.broken] The broken state of the links to include.
     * @param {Boolean} [options.redirect] The redirect state of the links to include.
     * @param {Number} [options.limit] The maximum number of results to return.
     * @param {Number} [options.offset] The number of items to skip.
     * @returns {Promise} A Promise that, when resolved, returns a pageLinkDetailsModel with the list of link details that were fetched.
     */
    getLinkDetails({ includeSubpages = false, linkTypes = [], broken, redirect, limit = 100, offset = 0 } = {}) {
        const params = {};
        if(typeof includeSubpages !== 'boolean') {
            return Promise.reject(new Error('The `includeSubpages` parameter must be a Boolean value.'));
        }
        params.subpages = includeSubpages;
        if(!Array.isArray(linkTypes)) {
            return Promise.reject(new Error('The `linkTypes` parameter must be an array.'));
        }
        if(linkTypes.length > 0) {
            params.linktypes = linkTypes.join(',');
        }
        if(typeof broken !== 'undefined') {
            if(typeof broken !== 'boolean') {
                return Promise.reject(new Error('The `broken` parameter must be a Boolean value.'));
            }
            params.broken = broken;
        }
        if(typeof redirect !== 'undefined') {
            if(typeof redirect !== 'boolean') {
                return Promise.reject(new Error('The `redirect` parameter must be a Boolean value.'));
            }
            params.redirect = redirect;
        }
        if(typeof limit !== 'number') {
            return Promise.reject(new Error('The `limit` parameter must be a number.'));
        }
        params.limit = limit;
        if(typeof offset !== 'number') {
            return Promise.reject(new Error('The `offset` parameter must be a number.'));
        }
        params.offset = offset;
        return this._plug.at('linkdetails').withParams(params).get()
            .catch((err) => Promise.reject(_errorParser$2(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(pageLinkDetailsModel));
    }

    /**
     * Get a listing of health inspections for a page.
     * @param {Object} [options] Options to direct the fetching of the health inspections.
     * @param {Array} [options.analyzers] An array of analyzers to include in the report (all analyzers included if not specified)
     * @param {Array} [options.severities] An array of severity levels to include in the report (all levels included if none specified)
     * @param {Array} [options.includeSubpages] Indicates whether or not to include the subpages in the report.
     * @param {Array} [options.limit] The maximum number of health reports to include.
     * @param {Array} [options.offset] The number of items to skip.
     * @returns {Promise} A Promise that, when resolved, yields a healthReportModel with the listing of health inspections for the page.
     */
    getHealthInspections({ analyzers, severities, includeSubpages, limit, offset } = {}) {
        const params = {};
        if(analyzers) {
            if(!Array.isArray(analyzers)) {
                return Promise.reject(new Error('The `analyzers` parameter must be an array.'));
            }
            params.analyzers = analyzers.join(',');
        }
        if(severities) {
            if(!Array.isArray(severities)) {
                return Promise.reject(new Error('The `severities` parameter must be an array.'));
            }
            params.severity = severities.join(',');
        }
        if(typeof includeSubpages !== 'undefined') {
            if(typeof includeSubpages !== 'boolean') {
                return Promise.reject(new Error('The `includeSubpages` parameter must be a boolean value.'));
            }
            params.subpages = includeSubpages;
        }
        if(limit) {
            if(typeof limit !== 'number') {
                return Promise.reject(new Error('The `limit` parameter must be a number.'));
            }
            params.limit = limit;
        }
        if(offset) {
            if(typeof offset !== 'number') {
                return Promise.reject(new Error('The `offset` parameter must be a number.'));
            }
            params.offset = offset;
        }
        return this._plug.at('health').withParams(params).get()
            .catch((err) => Promise.reject(_errorParser$2(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(healthReportModel));
    }
}

/**
 * A class for managing all of the published pages on a site.
 */
class PageManager {
    constructor(settings = new Settings()) {
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'pages');
    }

    /**
     * Get the ratings that have been set for a series of pages.
     * @param {Array} pageIds - The list of pages for which ratings data is fetched.
     * @returns {Promise.<pageRatingsModel>} - A Promise that, when resolved, yields a {@link pageRatingsModel} object with the ratings information.
     */
    getRatings(pageIds) {
        const ratingsPlug = this._plug.at('ratings').withParams({ pageids: pageIds.join(',') });
        return ratingsPlug.get().then((r) => r.json()).then(modelParser.createParser(pageRatingsModel));
    }

    /**
     * Find pages based on supplied constraints
     * @param {Object} options - The options to direct the results of the find operation.
     * @param {Number|String} [options.parentId=home] - The parent ID of the hierarchy to search. Either a numeric page ID or a page path string.
     * @param {Array} [options.tags=[]] - An array of tags that the found pages must contain.
     * @param {Array} [options.missingClassifications=[]] - An array of classification prefixes that must not exist on the pages.
     * @param {Date} [options.since] - Find pages last modified since this date.
     * @param {Date} [options.upTo=Date.now()] - Find pages last modified up to this date.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the results of the find request, or rejected with an error specifying the reason for rejection.
     */
    findPages(options = {}) {
        let paramFound = false;
        const params = {};
        if(options.parentId) {
            params.parentid = utility.getResourceId(options.parentId, 'home');
            paramFound = true;
        }
        if(options.tags) {
            if(!Array.isArray(options.tags)) {
                return Promise.reject(new Error('The `tags` parameter must be an Array.'));
            }
            if(options.tags.length > 0) {
                params.tags = options.tags.join(',');
                paramFound = true;
            }
        }
        if(options.missingClassifications) {
            if(!Array.isArray(options.missingClassifications)) {
                return Promise.reject(new Error('The `missingClassifications` parameter must be an Array.'));
            }
            if(options.missingClassifications.length > 0) {
                params.missingclassifications = options.missingClassifications.join(',');
                paramFound = true;
            }
        }
        if(options.since) {
            if(!(options.since instanceof Date)) {
                return Promise.reject(new Error('The `since` parameter must be of type Date.'));
            }
            params.since = utility.getApiDateString(options.since);
            paramFound = true;
        }
        if(options.upTo) {
            if(!(options.upTo instanceof Date)) {
                return Promise.reject(new Error('The `upTo` parameter must be of type Date.'));
            }
            params.upto = utility.getApiDateString(options.upTo);
            paramFound = true;
        }
        if(paramFound === false) {
            return Promise.reject(new Error('At least one constraint must be supplied to find pages.'));
        }
        return this._plug.at('find')
            .withParams(params)
            .get()
            .then((r) => r.json())
            .catch((err) => Promise.reject(_errorParser$2(err)))
            .then(modelParser.createParser(pageFindModel));
    }

    /**
     * Get the templates that may be used to create new pages or insert content.
     * @param {Object} [options] Options to direct the templates that are returned.
     * @param {String} [options.type=page] The type of the templates to retrun. Must be one of either "page" or "content".
     * @param {Boolean} [options.includeDescription=true] Whether or not to include the template descriptions.
     * @returns {Promise} A Promise that, when resolved returns a listing of the available templates.
     */
    getTemplates({ type = 'page', includeDescription = true } = {}) {
        if(typeof type !== 'string' || (type !== 'page' && type !== 'content')) {
            return Promise.reject(new Error('The `type` parameter must be set to either "page" or "content".'));
        }
        if(typeof includeDescription !== 'boolean') {
            return Promise.reject(new Error('The `includeDescription` parameter must be a Boolean value'));
        }
        return this._plug.at('templates').withParams({ type, includeDescription }).get()
            .then((r) => r.json())
            .then(modelParser.createParser(templateListModel));
    }
}

/**
 * A class for managing a file attachment on an published page.
 */
class PageFile extends PageFileBase {

    /**
     * Construct a new PageFile.
     * @param {Number|String} [pageId='home'] - The ID of the published page.
     * @param {String} filename - The filename of the file to manage.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(pageId, filename, settings = new Settings()) {
        super(pageId, filename);
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'pages', this._pageId, 'files', this._filename);
    }
}

/**
 * A class for managing the properties of a page.
 */
class PageProperty extends PagePropertyBase {

    /**
     * Construct a new PageProperty object.
     * @param {Number|String} [id='home'] The numeric page ID or the page path.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(id = 'home', settings = new Settings()) {
        super(id);
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'pages', this._id, 'properties');
    }

    /**
     * Get a listing of page properties for a hierarchy of pages.
     * @param {String} key - The key of the property to fetch.
     * @param {Number} [depth=1] - Between 0 and 2 levels deep in the search are allowed. If depth is 1 or 2, the names argument only can be a single property to be looked up, and no wildcards are allowed.
     * @returns {Promise} - A Promise that, when resolved, yields the listing of the properties.
     */
    getPropertyForChildren(key, depth = 1) {
        if(!key) {
            return Promise.reject(new Error('Attempting to fetch properties for children without providing a property key'));
        }
        return this._plug.withParams({ depth: depth, names: key }).get().then((r) => r.json());
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const pageSecurityModel = [
    { field: '@href', name: 'href' },
    {
        field: [ 'grants', 'grant' ],
        name: 'grants',
        isArray: true,
        transform: [
            { field: 'date.modified', name: 'dateModified', transform: 'date' },
            { field: 'permissions', transform: permissionsModel },
            { field: 'user', transform: userModel },
            { field: 'user.modifiedBy', name: 'userModifiedBy', transform: userModel }
        ]
    },
    { field: 'permissions.effective', name: 'effectivePermissions', transform: permissionsModel },
    { field: 'permissions.page', name: 'pagePermissions', transform: permissionsModel },
    { field: 'permissions.revoked', name: 'revokedPermissions', transform: permissionsModel }
];

function _validateGrantsArray(grants) {
    if(!Array.isArray(grants)) {
        return [ false, 'The specified grants must be an array' ];
    }
    for(const grant of grants) {
        const userDefined = typeof grant.user !== 'undefined';
        const groupDefined = typeof grant.group !== 'undefined';
        if((userDefined && groupDefined) || (!userDefined && !groupDefined)) {
            return [ false, 'The grant must only define a single user or group, but not both.' ];
        }
        if(userDefined && typeof grant.user !== 'string' && typeof grant.user !== 'number') {
            return [ false, 'The grant user parameter must be a numeric ID or an username' ];
        } else if(groupDefined && typeof grant.group !== 'string' && typeof grant.group !== 'number') {
            return [ false, 'The grant group parameter must be a numeric ID or an username' ];
        }
        if(typeof grant.role !== 'string') {
            return [ false, 'The grant role must be defined and must be a string.' ];
        }
    }
    return [ true, 'success' ];
}
function _getGrantsXml(grants, modifier) {
    let tagName = 'grants';
    if(modifier) {
        tagName += `.${modifier}`;
    }
    const grantsXml = grants.map((grant) => {
        let userOrGroup;
        if(grant.user) {
            userOrGroup = 'user';
        } else {
            userOrGroup = 'group';
        }
        const idOrName = grant[userOrGroup];
        let userOrGroupXml;
        if(typeof idOrName === 'number') {
            userOrGroupXml = `<${userOrGroup} id="${idOrName}"></${userOrGroup}>`;
        } else {
            userOrGroupXml = `<${userOrGroup}><${userOrGroup}name>${idOrName}</${userOrGroup}name></${userOrGroup}>`;
        }
        const roleXml = `<permissions><role>${grant.role}</role></permissions>`;
        return `<grant>${userOrGroupXml}${roleXml}</grant>`;
    }).join('');
    return `<${tagName}>${grantsXml}</${tagName}>`;
}
function _getPageRestrictionXml(restriction) {
    if(!restriction) {
        return '';
    }
    return `<permissions.page><restriction>${restriction}</restriction></permissions.page>`;
}

/**
 * A class for manipulating the restrictions and grants on a page.
 */
class PageSecurity {

    /**
     * Create a new PageSecurity object.
     * @param {Number|String} [id=home] The numeric page ID or page path string for the page.
     * @param {Settings} [settings] The martian Settings used to direct the API requests for the PageSecurity instance.
     */
    constructor(id = 'home', settings = new Settings()) {
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'pages', utility.getResourceId(id, 'home'), 'security');
    }

    /**
     * Gets the page's security info.
     * @returns {Promise} A Promise that, when resolved, yields a securityModel containing the page security information.
     */
    get() {
        return this._plug.get().then((r) => r.json()).then(modelParser.createParser(pageSecurityModel));
    }

    /**
     * Resets the page's security.
     * @returns {Promise} A Promise that, when resolved, indicates the page's security was successfully reset.
     */
    reset() {
        return this._plug.delete();
    }

    /**
     * Set the page security by adding and removing grants.
     * @param {Object} options Options to direct the setting of the security information.
     * @param {String} [options.cascade] A string indicating the behavior of the operation to child pages. Must be one of "none", "delta" or "absolute".
     * @param {Object} options.pageRestriction The restriction to set for the page.
     * @param {Object[]} [options.grants] An array of information about the grants to set.
     * @param {String|Number} [options.grants.user] The username or numeric ID of the user receiving the grant.
     * @param {String|Number} [options.grants.group] The group name or numeric ID of the group receiving the grant.
     * @param {String} [options.grants.role] The name of the grant to set for specified user.
     * @returns {Promise} A Promise that, when resolved, yields a pageSecurityModel containing the new security information.
     */
    set({ cascade = 'none', pageRestriction, grants } = {}) {
        if(typeof pageRestriction !== 'string') {
            return Promise.reject(new Error('The pageRestriction parameter must be provided and must be a string.'));
        }
        let grantsXml = '';
        if(grants) {
            const [ validGrants, err ] = _validateGrantsArray(grants);
            if(!validGrants) {
                return Promise.reject(new Error(err));
            }
            grantsXml = _getGrantsXml(grants);
        }
        const restrictionXml = _getPageRestrictionXml(pageRestriction);
        const securityRequest = `<security>${restrictionXml}${grantsXml}</security>`;
        return this._plug.withParams({ cascade }).put(securityRequest, utility.xmlRequestType)
            .then((r) => r.json()).then(modelParser.createParser(pageSecurityModel));
    }

    /**
     * Modify page security by adding and removing grants.
     * @param {Object} options Options to direct the security modification.
     * @param {String} [options.cascade] A string indicating the behavior of the operation to child pages. Must be one of "none" or "delta".
     * @param {String} [options.pageRestriction] The restriction to set for the page.
     * @param {Object[]} [options.grantsAdded] An array of grant information to add to the current grants for the page.
     * @param {String|Number} [options.grantsAdded.user] The username or numeric ID of the user receiving the grant.
     * @param {String|Number} [options.grantsAdded.group] The group name or numeric ID of the group receiving the grant.
     * @param {String} [options.grantsAdded.role] The name of the grant to set for specified user or group.
     * @param {Object[]} [options.grantsRemoved] An array of grant information to remove from the current grants for the page.
     * @param {String|Number} [options.grantsRemoved.user] The username or numeric ID of the user losing the grant.
     * @param {String|Number} [options.grantsRemoved.group] The group name or numeric ID of the group losing the grant.
     * @param {String} [options.grantsRemoved.role] The name of the grant to revoke for specified user or group.
     * @returns {Promise} A Promise that, when resolved, yields a pageSecurityModel containing the new security information.
     */
    update({ cascade = 'none', pageRestriction, grantsAdded, grantsRemoved } = {}) {
        let addedXml = '';
        if(grantsAdded) {
            const [ valid, err ] = _validateGrantsArray(grantsAdded);
            if(!valid) {
                return Promise.reject(new Error(err));
            }
            addedXml = _getGrantsXml(grantsAdded, 'added');
        }
        let removedXml = '';
        if(grantsRemoved) {
            const [ valid, err ] = _validateGrantsArray(grantsRemoved);
            if(!valid) {
                return Promise.reject(new Error(err));
            }
            removedXml = _getGrantsXml(grantsRemoved, 'removed');
        }
        const restrictionXml = _getPageRestrictionXml(pageRestriction);
        const securityRequest = `<security>${restrictionXml}${addedXml}${removedXml}</security>`;
        return this._plug.withParams({ cascade }).post(securityRequest, utility.xmlRequestType)
            .then((r) => r.json()).then(modelParser.createParser(pageSecurityModel));
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const searchModel = [
    { field: '@ranking', name: 'ranking' },
    { field: '@queryid', name: 'queryId', transform: 'number' },
    { field: '@querycount', name: 'queryCount', transform: 'number' },
    { field: '@count.recommendations', name: 'recommendationCount', transform: 'number' },
    { field: '@count', name: 'count', transform: 'number' },
    { field: 'parsedQuery' },
    {
        field: 'result',
        name: 'results',
        isArray: true,
        transform: [
            { field: 'author' },
            { field: 'content' },
            { field: 'date.modified', name: 'dateModified', transform: 'date' },
            { field: 'id', transform: 'number' },
            { field: 'mime' },
            { field: 'rank', transform: 'number' },
            { field: 'title' },
            { field: 'type' },
            { field: 'uri' },
            { field: 'uri.track', name: 'uriTrack' },
            { field: 'page', transform: pageModel },
            { field: 'preview' },
            {
                field: 'tag',
                name: 'tags',
                transform(value) {
                    if(value) {
                        return value.split('\n');
                    }
                }
            }
        ]
    },
    {
        field: 'summary',
        transform: [
            { field: '@path', name: 'path' },
            {
                field: 'results',
                isArray: true,
                transform: [
                    { field: '@path', name: 'path' },
                    { field: '@count', name: 'count', transform: 'number' },
                    { field: '@title', name: 'title' }
                ]
            }
        ]
    },
    { field: 'page', name: 'pages', isArray: true, transform: pageModel }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const siteTagsModelGet = [
    { field: '@count', name: 'count', transform: 'number' },
    {
        field: 'tag',
        name: 'tags',
        isArray: true,
        transform: [
            { field: '@value', name: 'value' },
            { field: '@id', name: 'id', transform: 'number' },
            { field: '@href', name: 'href' },
            { field: 'title' },
            { field: 'type' },
            { field: 'uri' }
        ]
    }
];

const siteTagsModelPost = [
    {
        field: 'skipped-pageids',
        name: 'skippedPageIds',
        transform(value) {
            if(typeof value === 'string') {
                return value.split(',');
            }
            return [];
        }
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const siteActivityModel = [
    { field: '@type', name: 'type' },
    {
        field: 'entry',
        name: 'entries',
        isArray: true,
        transform: [
            { field: '@date', name: 'date', transform: 'date' },
            { field: 'pages.created', name: 'pagesCreated', transform: 'number' },
            { field: 'pages.deleted', name: 'pagesDeleted', transform: 'number' },
            { field: 'pages.edited', name: 'pagesEdited', transform: 'number' },
            { field: 'pages.total', name: 'pagesTotal', transform: 'number' },
            { field: 'users.created', name: 'usersCreated', transform: 'number' },
            { field: 'users.total', name: 'usersTotal', transform: 'number' }
        ]
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const siteRolesModel = [
    { field: 'permissions', isArray: true, transform: permissionsModel }
];

function _buildSearchConstraints(params) {
    let constraints = [];
    if('path' in params) {
        let path = params.path;
        if(path.substr(0, 1) === '/') {
            path = path.substr(1);
        }
        constraints.push('+path.ancestor:' + utility.searchEscape(path));
    }
    if('tags' in params) {
        let tags = params.tags;
        if(typeof tags === 'string' && (tags)) {
            tags = tags.split(',');
        }
        tags.forEach((tag) => {
            constraints.push('+tag:"' + utility.searchEscape(tag) + '"');
        });
    }
    if('type' in params) {
        let types = params.type;
        if(typeof types === 'string' && (types)) {
            types = types.split(',');
        }
        types.forEach((type) => {
            constraints.push('+type:' + utility.searchEscape(type));
        });
    }
    if('namespaces' in params) {
        let namespaces = params.namespaces;
        if(typeof namespaces === 'string') {
            namespaces = namespaces.split(',');
        }
        namespaces.forEach((ns) => {
            constraints.push(`+namespace:${utility.searchEscape(ns)}`);
        });
    }
    return constraints.length > 0 ? '+(' + constraints.join(' ') + ')' : '';
}

function _getBatchTagsTemplate(data) {
    var postBatchTagsTemplate = '<?xml version="1.0"?><tags>';
    if(Array.isArray(data.add) && data.add.length > 0) {
        data.add.forEach((elm) => {
            let tagStr = `<tag.add value="${utility.escapeHTML(elm.name)}">`;
            elm.pageids.forEach((id) => {
                tagStr += `<page id="${id}"></page>`;
            });
            tagStr += '</tag.add>';

            postBatchTagsTemplate = postBatchTagsTemplate + tagStr;
        });
    }
    if(Array.isArray(data.remove) && data.remove.length > 0) {
        data.remove.forEach((elm) => {
            let tagStr = `<tag.remove value="${utility.escapeHTML(elm.name)}">`;
            elm.pageids.forEach((id) => {
                tagStr += `<page id="${id}"></page>`;
            });
            tagStr += '</tag.remove>';
            postBatchTagsTemplate = postBatchTagsTemplate + tagStr;
        });
    }
    postBatchTagsTemplate = `${postBatchTagsTemplate}</tags>`;
    return postBatchTagsTemplate;
}

/**
 * A class for administering aspects of a MindTouch site.
 */
class Site {

    /**
     * Construct a Site object.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(settings = new Settings()) {
        this.plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'site');
    }

    /**
     * Get the available site activity logs.
     * @returns {Promise.<reportLogsModel>} - A Promise that, when resolved, yields a {@link reportLogsModel} containing the available logs for site activity.
     */
    getSiteActivityLogs() {
        return this.plug.at('activity', 'logs').get().then((r) => r.json()).then(modelParser.createParser(reportLogsModel));
    }

    /**
     * Get the available search query logs.
     * @returns {Promise.<reportLogsModel>} - A Promise that, when resolved, yields a {@link reportLogsModel} containing the available logs for search query.
     */
    getSearchQueryLogs() {
        return this.plug.at('query', 'logs').get().then((r) => r.json()).then(modelParser.createParser(reportLogsModel));
    }

    /**
     * Get the localized string corresponding to the supplied resource key.
     * @param {Object} options - Options to direct the fetching of the localized string.
     * @param {String} options.key - The key that identifies the string to fetch.
     * @param {String} [options.lang] - A language code used to fetch the string in a specific language.  If not supplied, the current system language will be used.
     * @returns {Promise.<String>} - A Promise that, when resolved, yields the fetched string.
     */
    getResourceString(options = {}) {
        if(!('key' in options)) {
            return Promise.reject('No resource key was supplied');
        }
        let locPlug = this.plug.at('localization', options.key);
        if('lang' in options) {
            locPlug = locPlug.withParam('lang', options.lang);
        }
        return locPlug.get().then((r) => r.text());
    }

    /**
     * Get the available search query log url.
     * @param {String} logName - Name of log to retrive URL from.
     * @returns {Promise.<availableLogsModel>} - A Promise that, when resolved, yields a {@link availableLogsModel} containing log url.
     */
    getSearchQueryLogUrl(logName) {
        if(typeof logName === 'undefined' || logName.length === 0) {
            return Promise.reject(new Error('Attempting to get log url without required name'));
        }
        return this.plug.at('query', 'logs', logName, 'url').get().then((r) => r.json()).then(modelParser.createParser(logUrlModel));
    }

    /**
     * Get the available site activity log url.
     * @param {String} logName - Name of log to retrive URL from.
     * @returns {Promise.<availableLogsModel>} - A Promise that, when resolved, yields a {@link logUrlModel} containing log url.
     */
    getSiteActivityLogUrl(logName) {
        if(typeof logName === 'undefined' || logName.length === 0) {
            return Promise.reject(new Error('Attempting to get log url without required name'));
        }
        return this.plug.at('activity', 'logs', logName, 'url').get().then((r) => r.json()).then(modelParser.createParser(logUrlModel));
    }

    /**
     * Get tags list.
     * @param {String} [params] - Parameters to send along to the API.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the tags data, or rejected with an error specifying the reason for rejection.
     */
    getTags(params = {}) {
        const siteTagsModelParser = modelParser.createParser(siteTagsModelGet);
        return this.plug.at('tags').withParams(params).get().then((r) => r.json()).then(siteTagsModelParser);
    }

    /**
     * Post tags list for each page that each tag in contained in.
     * @param {Object} [params] - Options to direct the fetching of the localized tags.
     * @param {Array} [params.add] - A tag array containing all the pages containing this tag where they need to be added.
     * @param {Array} [params.remove] - A tag array containing all the pages containing this tag where they need to be removed.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the tags data, or rejected with an error specifying the reason for rejection.
     */
    setTags(params = {}) {
        const XMLBatchData = _getBatchTagsTemplate(params);
        const siteTagsModelParser = modelParser.createParser(siteTagsModelPost);
        return this.plug.at('tags').post(XMLBatchData, 'application/xml').then((r) => r.json()).then(siteTagsModelParser);
    }

    /**
     * Perform a search across the site.
     * This function takes a single parameter with the following options.
     * @param {Number} [limit=10] - Limit search results to the specified number of items per paginated page.
     * @param {Number} [offset=10] - The index in the total query results at which to begin the returned result set.
     * @param {String|Array} [tags=''] - A comma-separated list or array of tags to constrain search results to items containing one of the tags.
     * @param {String|Array} [type=''] - Type or types to filter the results in a comma delimited list or an array.  Valid types: `wiki`, `document`, `image`, `binary`
     * @param {String} [q=''] - Search keywords or advanced search syntax.
     * @param {String} [path=''] - A page path to constrain the search results to items located under the specified path.
     * @param {String|Array} [namespace='main'] - A comma-separated list or array of namespaces to filter the results by. Valid namespaces: 'main', 'template', 'user'.
     * @param {Boolean} [recommendations=true] - `true` to include recommended search results based off site configuration. `false` to suppress them.
     * @returns {Promise.<searchModel>} - A Promise that, when resolved, yields the results from the search in a {@link searchModel}.
     */
    search({ limit = 10, offset = 0, q = '', path = '', recommendations = true, tags = '', type = '', namespaces = 'main' } = {}) {
        const constraint = {};
        if(path !== '' && path !== '/') {
            constraint.path = path;
        }
        if(tags !== '') {
            constraint.tags = tags;
        }
        if(type !== '') {
            constraint.type = type;
        }
        constraint.namespaces = namespaces;
        const searchParams = {
            limit: limit,
            offset: offset,
            sortBy: '-date,-rank',
            q: q,
            summarypath: encodeURI(path),
            constraint: _buildSearchConstraints(constraint),
            recommendations: recommendations
        };
        return this.plug.at('query').withParams(searchParams).get().then((r) => r.json()).then(modelParser.createParser(searchModel));
    }

    /**
     * Search the site index
     * @param {Object} options - The options to direct the search operation.
     * @param {String} options.q The search string
     * @param {Number|String} [options.limit=100] The maximum number of items to retrieve. Must be a positive number or 'all' to retrieve all items.
     * @param {Number} [options.offset=0] Number of items to skip. Must be a positive number or 0 to not skip any.
     * @param {String} [options.sortBy='-score'] Sort field. Prefix value with '-' to sort descending.
     * @param {String} options.constraintString The pre-built constraint string to use. If not supplied, it will be built from the options.constraints object. If both options.constraintString and options.constraints are supplied, this parameter will take precedence.
     * @param {Object} [options.constraints={}] Addidional search constraints
     * @param {String} options.constraints.type The article type to filter from the results.
     * @param {String} options.constraints.path The path to use for path.ancestor in the search constraint.
     * @param {Array} options.constraints.tags An array of tags to only consider when returning page results.
     * @param {Array} options.constraints.namespaces An array of namespaces to limit the results by.
     * @param {Boolean} [options.verbose=true] Show verbose page xml
     * @param {String} [options.parser='bestguess'] - The parser to use for the query. Must be one of "bestguess", "term", "filename", "lucene"
     * @returns {Promise.<Object>} - A Promise that will be resolved with the search results, or rejected with an error specifying the reason for rejection.
     */
    searchIndex({ q = '', limit = 100, offset = 0, sortBy = '-score', constraintString = null, constraints = {}, verbose = true, parser = 'bestguess', format = 'xml' } = {}) {
        if(typeof limit === 'string') {
            if(limit !== 'all') {
                return Promise.reject(new Error('The limit for index searching must be a number or "all"'));
            }
        }
        const searchParams = {
            q,
            limit,
            offset,
            sortby: sortBy,
            constraint: constraintString || _buildSearchConstraints(constraints),
            verbose,
            parser,
            format
        };
        return this.plug.at('search').withParams(searchParams).get().then((r) => r.json()).then(modelParser.createParser(searchModel));
    }

    /**
     * Get the activity stats for the site.
     * @param {Date} [since] Start date for report.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the activity data, or rejected with an error specifying the reason for rejection.
     */
    getActivity(since = null) {
        let activityPlug = this.plug.at('activity');
        if(since !== null) {
            if(!(since instanceof Date)) {
                return Promise.reject(new Error('The `since` parameter must be of type Date.'));
            }

            // Create a date string of the format `yyyyMMddHHmmss`
            const sinceString = utility.getApiDateString(since);
            activityPlug = activityPlug.withParam('since', sinceString);
        }
        return activityPlug.get().then((r) => r.json()).then(modelParser.createParser(siteActivityModel));
    }

    /**
     * Retrieve list of defined roles
     * @returns {Promise.<Object>} - A Promise that will be resolved with the roles info, or rejected with an error specifying the reason for rejection.
     */
    getRoles() {
        return this.plug.at('roles').get().then((r) => r.json()).then(modelParser.createParser(siteRolesModel));
    }

    /**
     * Send feedback to the site owner.
     * @param {Object} feedbackData The data to send as the feedback.
     * @param {String} feedbackData.comment The comment body.
     * @param {String} [feedbackData.title] The title/subject for the feedback.
     * @param {Object} [feedbackData.metadata] Additional data to accompany the feedback submission.
     * @returns {Promise} A Promise that, when resolved, indicates a successful feedback submission.
     */
    sendFeedback({ comment, title, metadata = {} } = {}) {
        if(typeof comment !== 'string') {
            return Promise.reject(new Error('The `comment` parameter must be supplied, and must be a string.'));
        }
        let feedbackXml = '<feedback>';
        feedbackXml += `<body>${comment}</body>`;
        if(title) {
            if(typeof title !== 'string') {
                return Promise.reject(new Error('The title parameter must be a string.'));
            }
            feedbackXml += `<title>${title}</title>`;
        }
        feedbackXml += '<metadata>';
        if(typeof metadata !== 'object') {
            return Promise.reject(new Error('The `metadata` parameter must be an object.'));
        }
        Object.keys(metadata).forEach((key) => {
            feedbackXml += `<${key}>${metadata[key].toString()}</${key}>`;
        });
        feedbackXml += '</metadata>';
        feedbackXml += '</feedback>';
        return this.plug.at('feedback').post(feedbackXml, utility.xmlRequestType);
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const siteJobModel = [
    { field: '@id', name: 'id' },
    { field: '@type', name: 'type' },
    { field: '@status', name: 'status' },
    { field: 'lastmodified', name: 'lastModified', transform: 'date' },
    { field: 'submitted', transform: 'date' },
    { field: 'user', transform: userModel }
];
const siteJobsModel = [
    { field: 'job', name: 'jobs', isArray: true, transform: siteJobModel }
];

const _errorParser$3 = modelParser.createParser(apiErrorModel);

class SiteJobs {

    /**
     * Create a new SiteImportExport object.
     * @param {Settings} [settings] - The martian settings that will direct the requests for this instance.
     */
    constructor(settings = new Settings()) {
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'site');
    }

    /**
     * Schedules a site export.
     * @param {Object} options - Options to configure the export job.
     * @param {String} [options.email] - The email address to notify when the job completes. Required if a URL is not supplied.
     * @param {String} [options.url] - The URL to notify when the job completes. Required if an email address is not supplied.
     * @param {Object[]} [options.pages] - An array of objects with information about the pages to export.
     * @param {Number} [options.pages[].id] - The ID of a page to export. Required if the path is not supplied.
     * @param {String} [options.pages[].path] - The path of a page to export. Required if the ID is not supplied.
     * @param {Boolean} [options.pages[].includeSubpages] - Idicates whether or not to export the subpages of the specified page.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the scheduled job info, or rejected with an error specifying the reason for rejection.
     */
    scheduleExport(options) {
        if(!options) {
            return Promise.reject(new Error('The export options must be supplied'));
        }
        let notificationSupplied = false;
        if('email' in options) {
            notificationSupplied = true;
        }
        if('url' in options) {
            notificationSupplied = true;
        }
        if(notificationSupplied === false) {
            return Promise.reject(new Error('Notification email and url are missing. Need an email or url to notify when the job completes.'));
        }
        if('pages' in options) {
            if(!Array.isArray(options.pages)) {
                return Promise.reject('The pages option must be an array.');
            }
        } else {
            return Promise.reject('One or more pages must be specified for export.');
        }
        const pagesElements = options.pages.reduce((acc, page) => {
            let element = '<page';
            if(page.id) {
                element += ` id="${page.id}"`;
            }
            if('includeSubpages' in page) {
                element += ` includesubpages="${page.includeSubpages}"`;
            }
            element += '>';
            if(page.path) {
                element += `<path>${page.path}</path>`;
            }
            element += '</page>';
            return acc + element;
        }, '');
        let postData = '<job><notification>';
        if(options.email) {
            postData += `<email>${options.email}</email>`;
        }
        if(options.url) {
            postData += `<url>${options.url}</url>`;
        }
        postData += '</notification>';
        postData += `<pages>${pagesElements}</pages>`;
        postData += '</job>';
        return this._plug.at('jobs', 'export').post(postData, utility.xmlRequestType)
            .then((r) => r.json())
            .then(modelParser.createParser(siteJobModel));
    }

    /**
     * Schedules a site import
     * @param {Object} options - Options to configure the import job.
     * @param {Boolean} [options.dryRun=false] - Perform a dry run of the import to diagnose potential content problems.
     * @param {String} [options.email] - The email address to notify when the job completes. Required if a URL is not supplied.
     * @param {String} [options.url] - The URL to notify when the job completes. Required if an email address is not supplied.
     * @param {String} options.archiveUrl - The URL pointing to the archive to import.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the scheduled job info, or rejected with an error specifying the reason for rejection.
     */
    scheduleImport(options) {
        if(!options) {
            return Promise.reject(new Error('The export options must be supplied'));
        }
        let notificationSupplied = false;
        if('email' in options) {
            notificationSupplied = true;
        }
        if('url' in options) {
            notificationSupplied = true;
        }
        if(notificationSupplied === false) {
            return Promise.reject(new Error('Notification email and url are missing. Need an email or url to notify when the job completes.'));
        }
        if(typeof options.archiveUrl !== 'string' || options.archiveUrl === '') {
            return Promise.reject(new Error('An archive url is required, and must be a non-empty string to perform an import.'));
        }
        let postData = '<job><notification>';
        if(options.email) {
            postData += `<email>${options.email}</email>`;
        }
        if(options.url) {
            postData += `<url>${options.url}</url>`;
        }
        postData += '</notification>';
        postData += `<archive><url>${options.archiveUrl}</url></archive>`;
        postData += '</job>';
        return this._plug.at('jobs', 'import').withParam('dryrun', Boolean(options.dryRun)).post(postData, utility.xmlRequestType)
            .then((r) => r.json())
            .then(modelParser.createParser(siteJobModel));
    }

    /**
     * Gets the job statuses for a site.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the jobs status info, or rejected with an error specifying the reason for rejection.
     */
    getJobsStatuses() {
        return this._plug.at('jobs', 'status').get()
            .catch((err) => Promise.reject(_errorParser$3(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(siteJobsModel));
    }
}

const _errorParser$4 = modelParser.createParser(apiErrorModel);

class SiteReports {
    constructor(settings = new Settings()) {
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'site', 'reports');
    }

    /**
     * Get the site health report.
     * @param {Object} [options] - Optons to filter the results returned.
     * @param {Array} [options.analyzers] - An array of analyzers to include in the report (all analyzers included if none specified)
     * @param {Array} [options.severities] - An array of severity levels to include in the report (all error levels if none specified)
     * @returns {Promise.<Object>} - A Promise that will be resolved with the site health report data, or rejected with an error specifying the reason for rejection.
     */
    getSiteHealth(options = {}) {
        const params = {};
        if(options.analyzers) {
            if(!Array.isArray(options.analyzers)) {
                return Promise.reject(new Error('The `analyzers` option must be an array of analyzers'));
            }
            params.analyzers = options.analyzers.join(',');
        }
        if(options.severities) {
            if(!Array.isArray(options.severities)) {
                return Promise.reject(new Error('The `severities` option must be an array of analyzers'));
            }
            params.severity = options.severities.join(',');
        }
        return this._plug.at('sitehealth').withParams(params).get()
            .catch((err) => Promise.reject(_errorParser$4(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(healthReportModel));
    }
}

/* eslint-disable no-undef */
const _platformId = typeof window === 'undefined' ? 'node' : 'browser';
const platform = {
    base64: {
        encode(rawString) {
            if(_platformId === 'node') {

                // In node, use `Buffer` to encode.
                return (new Buffer(rawString)).toString('base64');
            }

            // In the browser, use btoa() to encode.
            return window.btoa(rawString);
        },
        decode(b64String) {
            if(_platformId === 'node') {

                // In node, use `Buffer` to decode.
                return (new Buffer(b64String, 'base64')).toString('utf8');
            }

            // In the browser, use atob() to decode.
            return window.atob(b64String);
        }
    },
    fileReader: {
        toBuffer(fileObj) {
            if(_platformId === 'browser') {
                const fileReader = new FileReader();
                return fileReader.readAsArrayBuffer(fileObj);
            }
        },
        getContentType(fileObj) {
            if(_platformId === 'browser') {
                return fileObj.type;
            }
        }
    }
};

/* eslint-enable no-undef */

/**
 * A class for managing a MindTouch user.
 */
class User {

    /**
     * Construct a new User object.
     * @param {Number|String} [id='current'] - The user's numeric ID or username.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(id = 'current', settings = new Settings()) {
        this._id = utility.getResourceId(id, 'current');
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'users', this._id);
        this._errorParser = modelParser.createParser(apiErrorModel);
    }

    /**
     * Get the user information.
     * @param {Object} params - The various params that provide context to the request
     * @param {Array} params.excludes - elements to exclude from response (ex: ['groups', 'properties'])
     * @returns {Promise.<userModel>} - A Promise that, when resolved, returns a {@link userModel} containing the user information.
     */
    getInfo({ excludes = [] } = {}) {
        let userModelParser = modelParser.createParser(userModel);
        let plug = this._plug;
        if(Array.isArray(excludes) && excludes.length) {
            plug = plug.withParam('exclude', excludes.join());
        }
        return plug.get().then((r) => r.json()).then(userModelParser);
    }

    /**
     * Check one or more resources if given operation is allowed.
     * @param {Array} pageIds - An array of numeric page IDs to check if the operations specified in `options` are allowed.
     * @param {Object} [options] - An object that contains the parameters to direct the request.
     * @param {Number} [options.mask] - The permission bit mask required for the pages.
     * @param {Array} [options.operations=[]] - An array of operations to verify.
     * @param {Boolean} [options.verbose=true] - Return verbose information on permitted pages.
     * @param {Boolean} [options.invert=false] - Return filtered instead of allowed pages. If set to `true`, forces the `verbose` parameter to `false`.
     * @returns {Promise.<Object>} - A Promise that will be resolved with result of the permission check, or rejected with an error specifying the reason for rejection.
     */
    checkAllowed(pageIds, options = {}) {
        if(!Array.isArray(pageIds)) {
            return Promise.reject(new Error('Invalid value supplied for the `pageIds` array.'));
        }
        if(options.operations) {
            if(!Array.isArray(options.operations)) {
                return Promise.reject(new Error('Invalid value supplied for the `options.operations` array.'));
            }
            options.operations = options.operations.join(',');
        }
        let requestXml = pageIds.map((id) => `<page id="${id}" />`).join('');
        requestXml = `<pages>${requestXml}</pages>`;
        return this._plug.at('allowed')
            .withParams(options)
            .post(requestXml, utility.xmlRequestType)
            .then((r) => r.json())
            .then(modelParser.createParser([ { field: 'page', name: 'pages', isArray: true, transform: pageModel } ]));
    }

    /**
     * Modify the user
     * @param {Object} options - An object that contains the user parameters to modify
     * @param {Boolean} [options.active] - Sets the user's "status" to "active" or "inactive".
     * @param {Boolean} [options.seated] - Sets whether or not the user is seated.
     * @param {String} [options.username] - Sets the user's username.
     * @param {String} [options.fullName] - Sets the user's full name (display name).
     * @param {String} [options.email] - Sets the user's email address.
     * @param {String} [options.language] - Sets the user's language.
     * @param {String} [options.timeZone] - Sets the user's time zone.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the updated user data, or rejected with an error specifying the reason for rejection.
     */
    update(options) {
        let postData = '<user>';
        Object.entries(options).forEach(([ key, value ]) => {
            if(key === 'active') {
                postData += `<status>${value === true ? 'active' : 'inactive'}</status>`;
            } else if(key === 'seated') {
                postData += `<license.seat>${value}</license.seat>`;
            } else {
                const lowerKey = key.toLowerCase();
                postData += `<${lowerKey}>${value}</${lowerKey}>`;
            }
        });
        postData += '</user>';
        return this._plug.put(postData, utility.xmlRequestType)
            .catch((err) => Promise.reject(this._errorParser(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(userModel));
    }
}

/**
 * A class for managing the users on a MindTouch site.
 */
class UserManager {

    /**
     * Construct a new UserManager object.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(settings = new Settings()) {
        this._settings = settings;
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'users');
    }

    /**
     * Get the currently signed-in user.
     * @param {Object} params - The various params that provide context to the request
     * @param {Array} params.excludes - elements to exclude from response (ex: ['groups', 'properties'])
     * @returns {Promise.<userModel>} - A Promise that, when resolved, returns a {@link userModel} containing the current user's information.
     */
    getCurrentUser({ excludes = [] } = {}) {
        let userModelParser = modelParser.createParser(userModel);
        let plug = this._plug;
        if(Array.isArray(excludes) && excludes.length) {
            plug = plug.withParam('exclude', excludes.join());
        }
        return plug.at('current').get().then((r) => r.json()).then(userModelParser);
    }

    /**
     * Get the currently signed-in user's activity id.
     * @returns {Promise.<String>} - A Promise that, when resolved, returns a string with the current user activity token.
     */
    getCurrentUserActivityToken() {
        return this._plug.at('current').withParam('exclude', [ 'groups', 'properties' ]).get().then((r) => {
            return Promise.all([
                r.json().then(modelParser.createParser(userModel)),
                new Promise((resolve, reject) => {
                    const sessionId = r.headers.get('X-Deki-Session');
                    if(sessionId !== null) {
                        resolve(sessionId);
                    } else {
                        reject(new Error('Could not fetch an X-Deki-Session HTTP header from the MindTouch API.'));
                    }
                })
            ]);
        }).then(([ user, sessionId ]) => {
            return `${user.id}:${sessionId}`;
        });
    }

    /**
     * Get all of the users.
     * @returns {Promise.<userListModel>} - A Promise that, when resolved, returns a {@link userListModel} containing the list of users.
     */
    getUsers() {
        let userListModelParser = modelParser.createParser(userListModel);
        return this._plug.get().then((r) => r.json()).then(userListModelParser);
    }

    /**
     * Get a listing of users filtered by the supplied constraints
     * @param {Object} constraints - The various constraints that can be used to filter the user listing.
     * @param {Number} constraints.groupid - Search for users in a specific group
     * @param {String} constraints.fullname - Search for users full name starting with supplied text.
     * @param {Boolean} constraints.active - Search for users by their active status
     * @param {Number} constraints.authprovider - Return users belonging to given authentication service id
     * @param {String} constraints.email - Search for users by name and email or part of a name and email
     * @param {Boolean} constraints.seated - Search for users with or without seats
     * @param {String} constraints.username - Search for users name starting with supplied text
     * @param {Number} constraints.roleid - Search for users of a specific role ID.
     * @param {Number} constraints.limit - Maximum number of items to retrieve. Actual maximum is capped by site setting
     * @param {String} constraints.format - Output format. Must be one of "autocomplete", "default" , or "verbose"
     * @returns {Promise.<userListModel>} - A Promise that, when resolved, returns a {@link userListModel} containing the list of found users.
     */
    searchUsers(constraints) {
        let userListModelParser = modelParser.createParser(userListModel);
        return this._plug.at('search').withParams(constraints).get().then((r) => r.json()).then(userListModelParser);
    }

    /**
     * Authenticate a user
     * @param {Object} options - The authentication options.
     * @param {String} options.method - Either 'GET' or 'POST' to direct the use of those forms of the API call.
     * @param {String} options.username - The username of the user to authenticate.
     * @param {String} options.password - The password of the user to authenticate.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the authentication result, or rejected with an error specifying the reason for rejection.
     */
    authenticate({ method = 'GET', username, password }) {
        const lowerMethod = method.toLowerCase();
        if(lowerMethod !== 'get' && lowerMethod !== 'post') {
            return Promise.reject(new Error('GET and POST are the only valid methods for user authentication.'));
        }
        const encodedAuth = platform.base64.encode(`${username}:${password}`);
        const authPlug = this._plug.at('authenticate').withHeader('Authorization', `Basic ${encodedAuth}`);
        return authPlug[lowerMethod]().then((r) => r.text());
    }

    /**
     * Get a {@see User} object by ID.
     * @param {Number|String} [id='current'] - The user's numeric ID or username.
     * @returns {User} - The User object corresponding to the supplied ID.
     */
    getUser(id = 'current') {
        return new User(id, this._settings);
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const webWidgetsModel = [
    { field: '@active', name: 'active', transform: 'boolean' },
    { field: '@date', name: 'date', transform: 'date' },
    { field: '@id', name: 'id', transform: 'number' },
    { field: '@type', name: 'type' },
    { field: 'host' },
    { field: 'name' },
    { field: 'token' },
    { field: 'arguments' },
    {
        field: 'code',
        transform: [
            { field: '#text', name: 'text' },
            { field: '@format', name: 'format' },
            { field: '@id', name: 'id' }
        ]
    }
];

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const webWidgetsListModel = [
    { field: '@count', name: 'count', transform: 'number' },
    { field: 'web-widget', name: 'webWidgets', isArray: true, transform: webWidgetsModel }
];

const _errorParser$5 = modelParser.createParser(apiErrorModel);
function isValidArgValue(value) {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}
function _makeXmlString(data) {
    if(!data || typeof data !== 'object') {
        throw new Error('Web widget data must be an object');
    }
    if(!Array.isArray(data.arguments) || data.arguments.some((arg) => !arg || typeof arg.name !== 'string' || !isValidArgValue(arg.value))) {
        throw new Error('Web widget arguments must be an array of objects with a `name` string and a `value` string|number|boolean');
    }
    if(!Array.isArray(data.hosts) || data.hosts.some((host) => typeof host !== 'string')) {
        throw new Error('Web widget hosts must be an array of strings');
    }
    if(typeof data.name !== 'string') {
        throw new Error('Web widget name must be a string');
    }
    if(typeof data.type !== 'string') {
        throw new Error('Web widget type must be a string');
    }
    const argData = data.arguments.map((arg) => {
        return `<${arg.name}>${utility.escapeHTML(arg.value)}</${arg.name}>`;
    });
    return `
        <web-widget>
            <arguments>${argData.join('\n')}</arguments>
            <host>${utility.escapeHTML(data.hosts.join(','))}</host>
            <name>${utility.escapeHTML(data.name)}</name>
            <type>${utility.escapeHTML(data.type)}</type>
        </web-widget>
    `;
}

/**
 * A class for managing web widgets.
 */
class WebWidgetsManager {

    /**
     * Construct a new WebWidgetsManager.
     * @param {Settings} [settings] The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(settings = new Settings()) {
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'web-widgets');
    }

    /**
     * Retrieve all active web widgets.
     * @returns {Promise} A Promise, when resolved, provides a list of active web widgets.
     */
    getActiveWidgets() {
        return this._plug.get()
            .catch((err) => Promise.reject(_errorParser$5(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(webWidgetsListModel));
    }

    /**
     * Retrieve all inactive web widgets.
     * @returns {Promise} A Promise, when resolved, provides a list of inactive web widgets.
     */
    getInactiveWidgets() {
        return this._plug.at('inactive').get()
            .catch((err) => Promise.reject(_errorParser$5(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(webWidgetsListModel));
    }

    /**
     * Retrieve an individual web widget.
     * @param {Number|String} [id] The id of the web widget to retrieve.
     * @returns {Promise} A Promise, when resolved, provides info of the retrieved web widget.
     */
    getWidget(id) {
        const widgetId = utility.getResourceId(id);
        return this._plug.at(widgetId).get()
            .catch((err) => Promise.reject(_errorParser$5(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(webWidgetsModel));

    }

    /**
     * Create a new web widget.
     * @param {Object} [options] The data used to create a new web widget.
     * @param {Array} [options.arguments] An array of { name, value } objects.
     * @param {Array} [options.hosts] Hostnames to whitelist.
     * @param {String} [options.name] The name of the web widget.
     * @param {String} [options.type] The type of web widget.
     * @returns {Promise} A Promise, when resolved, provides info of the newly created web widget.
     */
    createWidget(options) {
        return this._plug.post(_makeXmlString(options), utility.xmlRequestType)
            .catch((err) => Promise.reject(_errorParser$5(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(webWidgetsModel));
    }

    /**
     * Delete a web widget.
     * @param {Number|String} [id] The id of the web widget to delete.
     * @returns {Promise} A Promise, when resolved, indicates the web widget is deleted.
     */
    deleteWidget(id) {
        const widgetId = utility.getResourceId(id);
        return this._plug.at(widgetId).delete();
    }

    /**
     * Update a web widget.
     * @param {Number|String} [id] The id of the web widget to update.
     * @param {Object} [options] The data used to update the web widget.
     * @param {Array} [options.arguments] - An array of { name, value } objects.
     * @param {Array} [options.hosts] Hostnames to whitelist.
     * @param {String} [options.name] The name of the web widget.
     * @param {String} [options.type] The type of web widget.
     * @returns {Promise} A Promise, when resolved, provides info of the updated web widget.
     */
    updateWidget(id, options) {
        const widgetId = utility.getResourceId(id);
        return this._plug.at(widgetId).put(_makeXmlString(options), utility.xmlRequestType)
            .catch((err) => Promise.reject(_errorParser$5(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(webWidgetsModel));
    }

    /**
     * Activate a web widget.
     * @param {Number|String} [id] The id of the web widget to activate.
     * @returns {Promise} A Promise, when resolved, provides info of the activated web widget.
     */
    activateWidget(id) {
        const widgetId = utility.getResourceId(id);
        return this._plug.at(widgetId, 'activate').put()
            .catch((err) => Promise.reject(_errorParser$5(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(webWidgetsModel));
    }

    /**
     * Deactivate a web widget.
     * @param {Number|String} [id] The id of the web widget to deactivate.
     * @returns {Promise} A Promise, when resolved, provides info of the deactivated web widget.
     */
    deactivateWidget(id) {
        const widgetId = utility.getResourceId(id);
        return this._plug.at(widgetId, 'deactivate').put()
            .catch((err) => Promise.reject(_errorParser$5(err)))
            .then((r) => r.json())
            .then(modelParser.createParser(webWidgetsModel));
    }
}

/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const workflowsModel = [
    { field: '@href', name: 'href' },
    { field: 'uri.next', name: 'uriNext' }
];

/**
 * A class for working with site workflows.
 */
class WorkflowManager {

    /**
     * Construct a new FeedbackManager.
     * @param {Settings} [settings] - The {@link Settings} information to use in construction. If not supplied, the default settings are used.
     */
    constructor(settings = new Settings()) {
        this._plug = new Plug(settings.host, settings.plugConfig).at('@api', 'deki', 'workflow');
    }

    /**
     * Submit feedback for a page.
     * @param {Object} options - Parameters to send along with the feedback.
     * @param {String} options.userEmail - The email of the user sending feedback.
     * @param {String} options.pageTitle - The display title of the page the feedback is in reference to.
     * @param {String} options.siteUrl - The URL of the MindTouch site.
     * @param {String} options.content - The body text of the feedback message input by the user.
     * @param {Boolean} options.contactAllowed - Notifies the API whether or not the user grants permission to contact them.
     * @returns {Promise} - A Promise that, when resolved, indicates a successful feedback submission.
     */
    submitFeedback(options = {}) {
        const workflowPath = 'submit-feedback';
        if(!('_path' in options)) {
            return Promise.reject(new Error(`The _path field must be supplied for ${workflowPath}`));
        }
        const request = JSON.stringify({
            _path: options._path,
            userEmail: options.userEmail,
            pageTitle: options.pageTitle,
            siteUrl: options.siteUrl,
            content: options.content,
            contactAllowed: options.contactAllowed
        });
        return this._plug.at(workflowPath).post(request, utility.jsonRequestType).then((r) => r.json()).then(modelParser.createParser(workflowsModel));
    }

    /**
     * Send a message requesting an article be created on the site.
     * @param {Object} options - Parameters to send along with the request. These parameters are specific to the corresponding integration configuration on the MindTouch site.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the result of the request, or rejected with an error specifying the reason for rejection.
     */
    requestArticle(options = {}) {
        return this._plug.at('submit-article-request').post(JSON.stringify(options), utility.jsonRequestType).then((r) => r.json()).then(modelParser.createParser(workflowsModel));
    }

    /**
     * Send a message that submits a support issue.
     * @param {Object} options - Parameters to send along with the request. These parameters are specific to the corresponding integration configuration on the MindTouch site.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the result of the request, or rejected with an error specifying the reason for rejection.
     */
    submitIssue(options = {}) {
        const workflowPath = 'submit-issue';
        if(!('_path' in options) || !('_search' in options)) {
            return Promise.reject(new Error('The _path and _search fields must be supplied for ${workflowPath}'));
        }
        return this._plug.at(workflowPath).post(JSON.stringify(options), utility.jsonRequestType).then((r) => r.json()).then(modelParser.createParser(workflowsModel));
    }

    /**
     * Send a message to site support.
     * @param {Object} options - Parameters to send along with the request. These parameters are specific to the corresponding integration configuration on the MindTouch site.
     * @returns {Promise.<Object>} - A Promise that will be resolved with the result of the request, or rejected with an error specifying the reason for rejection.
     */
    contactSupport(options = {}) {
        const workflowPath = 'contact-support';
        if(!('_path' in options) || !('_search' in options)) {
            return Promise.reject(new Error('The _path and _search fields must be supplied for ${workflowPath}'));
        }
        return this._plug.at(workflowPath).post(JSON.stringify(options), utility.jsonRequestType).then((r) => r.json()).then(modelParser.createParser(workflowsModel));
    }
}

exports.Settings = Settings;
exports.TokenHelper = tokenHelper;
exports.Api = Api;
exports.ContextDefinition = ContextDefinition;
exports.ContextMap = ContextMap;
exports.ContextIdManager = ContextIdManager;
exports.Draft = Draft;
exports.DraftManager = DraftManager;
exports.DraftFile = DraftFile;
exports.DraftProperty = DraftProperty;
exports.Events = Events;
exports.File = File;
exports.FileDraft = FileDraft;
exports.Group = Group;
exports.GroupManager = GroupManager;
exports.LearningPath = LearningPath;
exports.LearningPathManager = LearningPathManager;
exports.License = License;
exports.Page = Page;
exports.PageManager = PageManager;
exports.PageFile = PageFile;
exports.PageProperty = PageProperty;
exports.PageSecurity = PageSecurity;
exports.Site = Site;
exports.SiteJobs = SiteJobs;
exports.SiteReports = SiteReports;
exports.User = User;
exports.UserManager = UserManager;
exports.WebWidgetsManager = WebWidgetsManager;
exports.WorkflowManager = WorkflowManager;