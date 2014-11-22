/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.config('jasmine', {
   dist: {
      src: 'src/**/*.js',
      options: {
        specs: 'tests/spec/**/*.js',
        host: 'http://127.0.0.1:8000/',
        template: require('grunt-template-jasmine-requirejs'),
        templateOptions: {
          requireConfig: {
            baseUrl: '.',
            include: ['src/diy'],
            paths: {
              chai: 'components/chai/chai'
            }
          }
        }
      }
    }
  });
};

