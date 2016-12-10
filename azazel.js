(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Azazel = factory();
  }

})(this, function () {
	'use strict';

  function extend (dest, src) {
    for( var key in src ) {
      dest[key] = src[key];
    }
    return dest;
  }

  function Event (name) {
    this.name = name;
  }

  Event.prototype.preventDefault = function () {
    this.defaultPrevented = true;
  };

  function addHandler (listeners, eventName, handler, useCapture) {
    if( !listeners[eventName] ) {
      listeners[eventName] = [];
    }

    if( useCapture ) {
      listeners[eventName].unshift(handler);
    } else {
      listeners[eventName].push(handler);
    }
  }

  function removeHandler (listeners, handler) {
    var found = listeners.indexOf(handler);
    if( found >= 0 ) listeners.splice(found, 1);
  }

  function removeOnce( listeners, handler ) {
    for( var key in listeners ) {
      removeHandler(listeners[key], handler);
    }
    delete handler.__run_once;
  }

  function extendMethods (evt, target, prefix) {
    target[prefix + 'on'] = evt.on.bind(evt);
    target[prefix + 'once'] = evt.once.bind(evt);
    target[prefix + 'off'] = evt.off.bind(evt);
    target[prefix + 'emit'] = evt.emit.bind(evt);
  }

  function Azazel (target, prefix) {
    this.listeners = {};
    if( target ) {
      extendMethods(this, target, prefix || '');
    }
  }

  extend(Azazel.prototype, {
    on: function (eventName, handler, useCapture) {
      var listeners = this.listeners;
      ( eventName instanceof Array ? eventName : eventName.split(/ +/) ).forEach(function (eventName) {
        addHandler(listeners, eventName, handler, useCapture);
      });
    },
    once: function (eventName, handler, useCapture) {
      handler.__run_once = true;
      var listeners = this.listeners;
      ( eventName instanceof Array ? eventName : eventName.split(/ +/) ).forEach(function (eventName) {
        addHandler(listeners, eventName, handler, useCapture);
      });
    },
    emit: function (eventName, params, thisArg) {
      var listeners = this.listeners;
      ( eventName instanceof Array ? eventName : eventName.split(/ +/) ).forEach(function (eventName) {
        if( !listeners[eventName] ) return;

        var event = new Event(eventName),
            args = [event].concat(params),
            _listeners = listeners[eventName];

        for( var i = 0, n = _listeners.length; i < n; i++ ) {
          _listeners[i].apply(thisArg, args);
          if( _listeners[i].__run_once ) {
            removeOnce(listeners, _listeners[i]);
            i--;
            n--;
          }
          if( event.defaultPrevented ) return;
        }
      });
    },
    off: function (eventName, handler) {
      var listeners = this.listeners;
      ( eventName instanceof Array ? eventName : eventName.split(/ +/) ).forEach(function (eventName) {
        if( !listeners[eventName] ) return;
        removeHandler(listeners[eventName], handler );
      });
    }
  });

  return Azazel;
});
