/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// jscs:disable
; (function (define) {
define(function(require,exports,module){
// jscs:enable
  'use strict';

  function DIY(depList) {
    this._depList = depList;
  }

  DIY.prototype = {
    create: function (depName) {
      var depConfig = this._depList[depName];
      if (! depConfig) {
        throw new Error(depName + ' is not configured');
      }

      if (depConfig.instance) {
        return depConfig.instance;
      }

      var config = extend({}, depConfig.config);
      for (var childDepName in depConfig.deps) {
        config[childDepName] = this.create(depConfig.deps[childDepName]);
      }

      depConfig.instance = new depConfig.constructor(config);
      return depConfig.instance;
    }
  };

  function extend(target) {
    var sources = [].slice.call(arguments, 1);

    sources.forEach(function (source) {
      for (var key in source) {
        target[key] = source[key];
      }
    });

    return target;
  }

  module.exports = DIY;

/*!
 * UMD/AMD/Global context Module Loader wrapper
 * based off https://gist.github.com/wilsonpage/8598603
 *
 * This wrapper will try to use a module loader with the
 * following priority:
 *
 *  1.) AMD
 *  2.) CommonJS
 *  3.) Context Variable (window in the browser)
 */
});})(typeof define === 'function' && define.amd ? define
/*global exports, module*/
// jscs:disable
  : (function (name, context) {
      'use strict';
      return typeof module === 'object' ? function (define) {
          define(require, exports, module);
      }
      : function (define) {
          var module = {
              exports: {}
          };
          var require = function (n) {
              return context[n];
          };

          define(require, module.exports, module);
          context[name] = module.exports;
      };
  })('DIY', this));
// jscs:enable

