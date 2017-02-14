(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("components/App.jsx", function(exports, require, module) {
'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var socket = io();

var App = _react2.default.createClass({
  displayName: 'App',
  getInitialState: function getInitialState() {
    return { tracks: [] };
  },
  componentDidMount: function componentDidMount() {
    var _this = this;

    socket.on('hello', function (tracks) {
      _this.setState({ connected: true, tracks: tracks });
    });
    socket.on('new song', function (track) {
      var tracks = _this.state.tracks;
      tracks.push(track);
      _this.setState({ tracks: tracks });
    });
    socket.on('upvote', function (msg) {});
    socket.on('downvote', function (msg) {});
    socket.on('err', function (error) {
      _this.setState({ error: error });
    });
  },
  render: function render() {
    var tracks = this.state.tracks.map(function (song, index) {
      return _react2.default.createElement(Track, { key: index, data: song, pos: index });
    });
    var error = void 0;
    if (this.state.error) {
      error = _react2.default.createElement(Error, { msg: this.state.error });
    }
    return _react2.default.createElement(
      'div',
      { id: 'content' },
      tracks,
      error,
      _react2.default.createElement(AddTrack, null)
    );
  }
});

var Track = _react2.default.createClass({
  displayName: 'Track',
  render: function render() {
    var snippet = this.props.data.items[0].snippet;
    var title = snippet.title;
    var votes = this.props.data.votes || 0;
    var thumb = snippet.thumbnails.medium.url;
    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement('img', { src: thumb, alt: '' }),
      title,
      ' ',
      _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(
          'button',
          { onClick: this.upvote },
          '+'
        ),
        ' ',
        votes,
        ' ',
        _react2.default.createElement(
          'button',
          null,
          '-'
        ),
        ' '
      )
    );
  },
  upvote: function upvote() {
    socket.emit('upvote', this.props.pos);
  }
});

var AddTrack = _react2.default.createClass({
  displayName: 'AddTrack',
  send: function send(e) {
    e.preventDefault();
    socket.emit('new song', this._input.value);
  },
  render: function render() {
    var _this2 = this;

    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'form',
        { onSubmit: this.send },
        _react2.default.createElement('input', { type: 'text', ref: function ref(_ref) {
            return _this2._input = _ref;
          } }),
        _react2.default.createElement(
          'button',
          null,
          'Send'
        )
      )
    );
  }
});

var Error = _react2.default.createClass({
  displayName: 'Error',
  render: function render() {
    return _react2.default.createElement(
      'div',
      null,
      '/!\\ ',
      this.props.msg
    );
  }
});

module.exports = { App: App };

});

require.register("initialize.js", function(exports, require, module) {
'use strict';

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var App = require('components/App').App;

document.addEventListener('DOMContentLoaded', function () {
  _reactDom2.default.render(_react2.default.createElement(App, null), document.querySelector('#app'));
});

});

require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map