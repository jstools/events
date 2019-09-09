'use strict';

/* global process, setImmediate */

// from: https://github.com/medikoo/next-tick
var nextTick = (function () {

    // Node.js
    if( typeof process === 'object' && process && typeof process.nextTick === 'function' ) {
          return process.nextTick
    }
  
    // Removed due to issues with touchmove:
    //
    // if( 'Promise' in global && typeof global.Promise.resolve === 'function' ) return (function (resolved) {
    //   return resolved.then.bind(resolved);
    // })( global.Promise.resolve() );
    //
    // https://stackoverflow.com/questions/32446715/why-is-settimeout-game-loop-experiencing-lag-when-touchstart-event-fires/35668492
    // https://bugs.chromium.org/p/chromium/issues/detail?id=567800
      
    // Removed due to issues with webview:
    //
    // from: https://github.com/wesleytodd/browser-next-tick
    // var raf_prefixes = 'oR msR mozR webkitR r'.split(' ')
    // for( var i = raf_prefixes.length - 1 ; i >= 0 ; i-- ) {
    //   if( window[raf_prefixes[i] + 'equestAnimationFrame'] ) return window[raf_prefixes[i] + 'equestAnimationFrame'].bind(window);
    // }
    
    // MutationObserver
    if( 'MutationObserver' in window || 'WebKitMutationObserver' in window ) return (function (Observer, node) {
      var queue = [],
          i = 0;
  
      function _launchNextTick () {
        node.data = (i = ++i % 2);
      }
  
      var observer = new Observer(function () {
        var _callback = queue.shift();
        if( queue.length > 0 )  _launchNextTick();
        if( _callback instanceof Function ) _callback();
        // observer.disconnect()
      });
      observer.observe(node, { characterData: true });
  
      return function (callback) {
        queue.push(callback);
        _launchNextTick();
      }
    })( window.MutationObserver || window.WebKitMutationObserver, document.createTextNode('') )
  
    var _ensureCallable = function (fn) {
      if (typeof fn !== 'function') throw new TypeError(fn + ' is not a Function')
      return fn
    };
  
    // W3C Draft
      // http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
      if (typeof setImmediate === 'function') {
          return function (cb) { setImmediate(_ensureCallable(cb)); }
      }
  
      // Wide available standard
      if ((typeof setTimeout === 'function') || (typeof setTimeout === 'object')) {
          return function (cb) { setTimeout(_ensureCallable(cb), 0); }
      }
  
  })();

/* global, window, self */

var _syncNextTick = function (fn) { fn.apply(this, arguments); };

function _removeFromList ( list, item ) {
  if( !list ) return
  for( var i = list.length - 1 ; i >= 0 ; i-- ) {
    if( item === list[i] ) list.splice(i, 1);
  }
}

function _normalizeEventName (fn, host, test_listener) {
  return function _fn (event_name, listener, use_capture) {
    if( test_listener !== false && !(listener instanceof Function ) ) throw new Error('listener should be a Function')

    if( event_name instanceof Array ) {
      event_name.forEach(function (_event_name) {
        _fn(_event_name, listener, use_capture);
      });
      return host
    }
    // runAsArray(fn, arguments, this, host );
    if( typeof event_name !== 'string' ) throw new Error('event_name should be a string')
    if( / /.test(event_name) ) return _fn(event_name.split(/ +/), listener, use_capture)

    fn.apply(this, arguments);

    return host
  }
}

function Azazel (host, options) {
  options = options || {};
  if( typeof options === 'string' ) options = {
    prefix: options
  };
  options.prefix = options.prefix || '';

  host = host || (this instanceof Azazel ? this : {});

  var listeners = {},
      listeners_once = {},
      events_emitted = {},
      _nextTick = options.async !== false ? nextTick : _syncNextTick;

  function _on (event_name, listener, use_capture) {
    listeners[event_name] = listeners[event_name] || [];
    if( use_capture ) listeners[event_name].unshift(listener);
    else listeners[event_name].push(listener);
  }

  var on = _normalizeEventName(_on, host);

  function _once (event_name, listener, use_capture) {
    listeners_once[event_name] = listeners_once[event_name] || [];
    if( use_capture ) listeners_once[event_name].unshift(listener);
    else listeners_once[event_name].push(listener);
  }

  var once = _normalizeEventName(_once, host);

  function watch (event_name, listener, use_capture) {
    if( !(listener instanceof Function ) ) throw new Error('listener should be a Function')

    if( use_capture !== 'once' ) _on(event_name, listener, use_capture);

    var last_emitted = events_emitted[event_name];

    if( last_emitted )
      listener.apply(last_emitted.this_arg, last_emitted.args);
    else if( use_capture === 'once' )
      _once(event_name, listener);

    // console.log('watch', event_name, listener.name, use_capture)

    return host
  }

  function _emit (event_name, args, this_arg, callback) {
    if( this_arg instanceof Function ) {
      callback = this_arg;
      this_arg = null;
    }
    _nextTick(function () {
      args = args || [];
      events_emitted[event_name] = { args: args, this_arg: this_arg };

      var _listeners = listeners[event_name] && listeners[event_name].slice(); // list may be changed during execution

      if( _listeners ) _listeners.forEach(function (listener) {
        listener.apply(this_arg, args);
      });

      _emitOnce(event_name, args, this_arg);

      if( callback instanceof Function ) callback.apply(this_arg, args);
    });
  }

  function _emitOnce (event_name, args, this_arg) {
    var _listeners = listeners_once[event_name] && listeners_once[event_name].slice();
    delete listeners_once[event_name];

    if( !_listeners ) return

    _listeners.forEach(function (listener) {
      listener.apply(this_arg, args);
    });

    for( var event_name in listeners_once ) {
      _listeners.forEach(function (_listener) {
        if( listeners_once[event_name] ) _removeFromList(listeners_once[event_name], _listener );
      });
    }
  }

  var emit = _normalizeEventName(_emit, host, false);

  function off (event_name, listener) {
    if( listeners[event_name] ) _removeFromList(listeners[event_name], listener );
    if( listeners_once[event_name] ) _removeFromList(listeners_once[event_name], listener );
  }

  host[options.prefix + 'on'] = on;
  host[options.prefix + 'once'] = once;
  host[options.prefix + 'watch'] = watch; // like watch but triggering

  host[options.prefix + 'emit'] = emit;
  host[options.prefix + 'off'] = _normalizeEventName(off);

  return host
}

Azazel.nextTick = nextTick;

module.exports = Azazel;
