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
    this.leaf = config.leaf;
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
          leaf: {
            constructor: Leaf,
            config: {
              field: 'value'
            }
          },
          other_leaf: {
            constructor: Leaf
          },
          root: {
            constructor: Parent,
            config: {
              root_field: 'value'
            },
            deps: {
              leaf: 'leaf',
              leaf2: 'other_leaf'
            }
          }
        };

        var diy = new DIY(depList);
        var root = diy.create('root');

        expect(root instanceof Parent).toBe(true);
        expect(root.leaf instanceof Leaf).toBe(true);
        expect(root.leaf2 instanceof Leaf).toBe(true);
        expect(root.leaf).not.toEqual(root.leaf2);
        expect(root.root_field).toEqual('value');
      });

      it('can re-use instantiated objects', function () {
        var depList = {
          leaf: {
            constructor: Leaf
          },
          first_root: {
            constructor: Parent,
            deps: {
              leaf: 'leaf'
            }
          },
          second_root: {
            constructor: Parent,
            deps: {
              leaf: 'leaf'
            }
          }
        }

        var diy = new DIY(depList);
        var firstRoot = diy.create('first_root');
        var secondRoot = diy.create('second_root');

        expect(firstRoot.leaf).toBe(secondRoot.leaf);
      });
    });
  });
});

