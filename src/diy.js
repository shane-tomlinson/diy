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
    for (var depName in depList) {
      var visited = [ depName ];
      var childDeps = depList[depName].deps;
      checkDependencies(depList, childDeps, visited);
    }
  }

  DIY.prototype = {
    create: function (depName) {
      var depConfig = this._depList[depName];
      if (! depConfig) {
        return Promise.reject(new Error(depName + ' is not configured'));
      }

      if (depConfig.instance) {
        // depConfig.instance is a promise, just return it, it'll be resolved.
        return depConfig.instance;
      }

      var config = extend({}, depConfig.config);
      var depNames = Object.keys(depConfig.deps || {});
      var self = this;

      // return the depConfig.instance promise so that multiple create's can
      // be called concurrently without any interference. Only one instance
      // will be created.
      depConfig.instance = Promise.all(depNames.map(function (depName) {
        return self.create(depConfig.deps[depName])
          .then(function (dep) {
            config[depName] = dep;
          });
      }))
      .then(function () {
        var instance = new depConfig.constructor(config);

        if (! depConfig.initialize) {
          return instance;
        }

        return Promise.resolve().then(function (resolve) {
            return instance[depConfig.initialize]();
        }).then(function () {
          return instance;
        });
      });

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

  function checkDependencies(allDeps, depList, visited) {
    visited = visited || [];

    for (var depName in depList) {
      var depType = depList[depName];
      if (visited.indexOf(depType) > -1) {
        throw new Error('circular dependency');
      }

      var childDep = allDeps[depType];
      if (! childDep) {
        throw new Error('missing configuration for ' + depType);
      }

      visited.push(depType);

      checkDependencies(allDeps, allDeps[depType].deps, visited);

      visited.pop(depType);
    }
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

