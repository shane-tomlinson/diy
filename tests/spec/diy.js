/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  '../../src/diy'
], function (DIY) {

  var expect = chai.expect;
  var assert = chai.assert;

  function Leaf(config) {
    this.field = config.field;
  }

  function Parent(config) {
    this.leaf1 = config.leaf1;
    this.leaf2 = config.leaf2;
    this.root_field = config.root_field;
  }

  function Async(config) {
    this.field = config.field;
  }
  Async.prototype = {
    asyncInit: function () {
      var self = this;
      return new Promise(function (resolve) {
        setTimeout(function () {
          self.setByInitializer = 'initialized';
          resolve(true);
        }, 100);
      });
    }
  };

  describe('diy', function () {
    describe('create', function () {
      it('can create an object with no dependencies', function () {
        var depList = {
          leaf: {
            constructor: Leaf,
            config: {
              field: 'value'
            }
          }
        };

        var diy = new DIY(depList);
        return diy.create('leaf')
          .then(function (leaf) {
            assert.isTrue(leaf instanceof Leaf);
            assert.equal(leaf.field, 'value');
          });
      });

      it('can call an async initializer', function () {
        var depList = {
          async: {
            constructor: Async,
            initialize: 'asyncInit',
            config: {
              field: 'value'
            }
          }
        };

        var diy = new DIY(depList);
        return diy.create('async')
          .then(function (async) {
            assert.isTrue(async instanceof Async);
            assert.equal(async.field, 'value');
            assert.equal(async.setByInitializer, 'initialized');
          });
      });

      it('can create an object with multiple dependencies', function () {
        var depList = {
          leaf1: {
            constructor: Leaf,
            config: {
              field: 'value'
            }
          },
          leaf2: {
            constructor: Leaf
          },
          root: {
            constructor: Parent,
            config: {
              root_field: 'value'
            },
            deps: {
              leaf1: 'leaf1',
              leaf2: 'leaf2'
            }
          }
        };

        var diy = new DIY(depList);
        return diy.create('root').then(function (root) {
          assert.isTrue(root instanceof Parent);
          assert.isTrue(root.leaf1 instanceof Leaf);
          assert.isTrue(root.leaf2 instanceof Leaf);
          assert.notEqual(root.leaf1, root.leaf2);
          assert.equal(root.root_field, 'value');
        });
      });

      it('can re-use instantiated objects', function () {
        var depList = {
          leaf: {
            constructor: Leaf
          },
          node1: {
            constructor: Parent,
            deps: {
              leaf: 'leaf'
            }
          },
          node2: {
            constructor: Parent,
            deps: {
              leaf: 'leaf'
            }
          }
        };

        var diy = new DIY(depList);
        return Promise.all([
          diy.create('node1'),
          diy.create('node2')
        ]).then(function (deps) {
          assert.deepEqual(deps[0], deps[1]);
        });
      });

      describe('detect circular dependencies', function () {
        function detectCircularDeps(depList) {
          assert.throws(function () {
            var diy = new DIY(depList);
          }, 'circular dependency');
        }

        it('errors on a node that depends on itself', function () {
          var depList = {
            root: {
              constructor: Parent,
              deps: {
                root: 'root'
              }
            }
          };

          detectCircularDeps(depList);
        });

        it('errors on binary circular-dependent nodes', function () {
          var depList = {
            node1: {
              constructor: Parent,
              deps: {
                root: 'node2'
              }
            },
            node2: {
              constructor: Parent,
              deps: {
                root: 'node1'
              }
            }
          };

          detectCircularDeps(depList);
        });

        it('errors on a triangular circular-dependence', function () {
          var depList = {
            node1: {
              constructor: Parent,
              deps: {
                root: 'node2'
              }
            },
            node2: {
              constructor: Parent,
              deps: {
                root: 'node3'
              }
            },
            node3: {
              constructor: Parent,
              deps: {
                root: 'node1'
              }
            }
          };

          detectCircularDeps(depList);
        });
      });
    });
  });

  mocha.run();
});

