/*!
 * koa.io - lib/application.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Socket = require('./socket.io');
var util = require('util');
var http = require('http');
var Koa = require('koa');

var Session;

/**
 * Application constructor
 *
 * @param {Object} options for Socket.io
 */

class Application extends Koa {
  constructor(options) {
    super();
    this.io = new Socket(options);
  }

  session(_opts) {
    var opts = _opts || {};
    if (!Session) Session = require('koa-generic-session');

    var session = Session(opts);
    this.use(session);

    var namespace = opts.namespace || ['/'];
    if (!Array.isArray(namespace)) {
      namespace = [namespace];
    }

    var self = this;
    namespace.forEach(function eachNamespaceUseMiddleware() {
      self.io.of(namespace).use(session);
    });
  }

  /**
   * create a http server
   * and attach socket.io to this server
   *
   * @return {HttpServer}
   */

  createServer() {
    var server = http.createServer(this.callback());
    this.io.attach(server);
    return server;
  }

  /**
   * create a http server
   * attach socket.io to this server
   * listen
   *
   * @param {Mixed} ...
   * @return {Server}
   * @api public
   */

  listen() {
    var server = this.createServer();
    return server.listen.apply(server, arguments);
  }

  /**
   * get the keys for signed cookies
   *
   * @return {Array}
   */

  get 'keys' () {
    return this._keys;
  }

  /**
   * set the keys for signed cookies
   *
   * @param [Array] keys
   */

  set 'keys' (keys) {
    this._keys = keys;
    this.io.keys = keys;
  }
}

module.exports = Application;
