/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'src/diy'
], function (DIY) {

  function Leaf(config) {
    this.field = config.field;
  }

  function Parent(config) {
    this.leaf1 = config.leaf1;
    this.leaf2 = config.leaf2;
    this.root_field = config.root_field;
  }

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
        var leaf = diy.create('leaf');
        expect(leaf instanceof Leaf).toBe(true);
        expect(leaf.field).toBe('value');
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
        var root = diy.create('root');

        expect(root instanceof Parent).toBe(true);
        expect(root.leaf1 instanceof Leaf).toBe(true);
        expect(root.leaf2 instanceof Leaf).toBe(true);
        expect(root.leaf1).not.toEqual(root.leaf2);
        expect(root.root_field).toEqual('value');
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
        }

        var diy = new DIY(depList);
        var node1 = diy.create('node1');
        var node2 = diy.create('node2');

        expect(node1.leaf).toBe(node2.leaf);
      });

      describe('detect circular dependencies', function () {
        function detectCircularDeps(depList) {
          var err;
          try {
            var diy = new DIY(depList);
          } catch(e) {
            err = e;
          } finally {
            expect(err.message).toBe('circular dependency');
            expect(diy).toBeUndefined();
          }
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
});

