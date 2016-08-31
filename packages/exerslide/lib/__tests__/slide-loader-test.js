/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

'use strict';

const expect = require('chai').expect;
const slideLoader = require('../slide-loader');

function run(content, verify, options) {
  slideLoader.call(
    {
      resourcePath: 'test.md',
      options: Object.assign(
        {context: './'},
        options
      ),
      async: () =>  (
        (error, result) => verify(error, result.replace(/\n+\s*/g, ''))
      ),
      emitWarning: () => {},
    },
    content
  );
}

function test(content, expectation, done) {
  run(content, (error, result) => {
    expect(result).to.equal(expectation);
    done();
  });
}

function testWithTransforms(content, expectation, transforms, done) {
  const expectedCalls = transforms.reduce(
    (sum, t) => sum + (t.after ? 1 : 0) + (t.before ? 1 : 0),
    0
  );
  let called = 0;
  run(
    content,
    (error, result) => {
      if (expectation) {
        switch (typeof expectation) {
          case 'string':
            expect(result).to.equal(expectation);
            break;
          case 'function':
            expect(result).to.satisfy(expectation);
            break;
        }
      }
      expect(called).to.equal(expectedCalls);
      done();
    },
    {
      slideLoader: {
        transforms: transforms.map(
          transform => Object.keys(transform).reduce(
            (newTransform, key) => {
              newTransform[key] = function() {
                called += 1;
                transform[key].apply(this, arguments);
              };
              return newTransform;
            },
            {}
          )
        ),
      },
    }
  );
}

describe('slide-loader', () => {

  it('converts text to a JavaScript object module', done => {
    test(
      '---\n_foo: bar\n---\ntest',
      'module.exports = {"options": {"_foo": "bar"},"content": "test"};',
      done
    );
  });

  it('executes transforms and passes results', done => {
    testWithTransforms(
      'foo bar',
      null,
      [
        {
          before: (content, next) => {
            expect(content).to.equal('foo bar');
            next(null, 'bar foo');
          },
          after: (slide, next) => {
            expect(slide).to.deep.equal({options: {}, content: 'bar foo'});
            next(null, slide);
          },
        },
        {
          before: (content, next) => {
            expect(content).to.equal('bar foo');
            next(null, content);
          },
        },
      ],
      done
    );
  });

  describe('transform api', () => {

    it('provides access to resourcePath', done => {
      function verify(content, next, api) {
        expect(api.resourcePath).to.equal('test.md');
        next(null, content);
      }

      testWithTransforms(
        '',
        '',
        [
          {
            before: verify,
            after: verify,
          },
        ],
        done
      );
    });

    it('provides access to context', done => {
      function verify(content, next, api) {
        expect(api.context).to.equal('./');
        next(null, content);
      }

      testWithTransforms(
        '',
        '',
        [
          {
            before: verify,
            after: verify,
          },
        ],
        done
      );
    });

    it('provides the ability to perform replacements', done => {
      testWithTransforms(
        'foo bar',
        'module.exports = {"options": {},"content": "foo foo"};',
        [
          {
            before: function verify(content, next) {
              next(
                null,
                content,
                [{type: 'replace', search: 'bar', replace: 'foo'}]
              );
            },
          },
        ],
        done
      );
    });

    it('provides the ability prepend code', done => {
      testWithTransforms(
        '',
        'foo;module.exports = {"options": {},"content": ""};',
        [
          {
            after: function(slide, next) {
              next(null, slide, [{type: 'prefix', value: 'foo;'}]);
            },
          },
        ],
        done
      );
    });

    it('provides the ability to interpolate a value', done => {
      testWithTransforms(
        'foo bar baz',
        'module.exports = {"options": {},"content": "foo " + (1 + 1) + " baz"};',
        [
          {
            before: function(content, next) {
              next(
                null,
                content,
                [{type: 'interpolate', search: 'bar', value: '(1 + 1)'}]
              );
            },
          },
        ],
        done
      );
    });

    it('provides the ability to assign a value', done => {
      testWithTransforms(
        '',
        'module.exports = {"options": {},"content": "","foo": {"bar": abc},"bar": 123};',
        [
          {
            before: function(content, next) {
              next(
                null,
                content,
                [
                  {type: 'assign', propertyPath: 'foo.bar', value: 'abc'},
                  {type: 'assign', propertyPath: 'bar', value: '123'},
                ]
              );
            },
          },
        ],
        done
      );
    });

    it('provides the ability to import a module', done => {
      const testPath = './foo/bar/baz';
      testWithTransforms(
        '',
        function(content) {
          return content.includes(`require(${JSON.stringify(testPath)})`);
        },
        [
          {
            before: function(content, next) {
              next(
                null,
                content,
                [{type: 'import', request: testPath}]
              );
            },
          },
        ],
        done
      );
    });

    it('provides the ability to import a module and assign it', done => {
      const testPath = './foo/bar/baz';
      testWithTransforms(
        '',
        function(content) {
          return content.includes(
            `var foo = require(${JSON.stringify(testPath)})`
          );
        },
        [
          {
            before: function(content, next) {
              next(
                null,
                content,
                [{type: 'import', id: 'foo', request: testPath}]
              );
            },
          },
        ],
        done
      );
    });

    it('allows functions to be passed as transforms', done => {
      let called = false;
      const transform = helper => {
        called = true;
        expect(helper).to.be.defined;
        return {
          before: (_, next) => next(null, 'foo bar'),
        };
      };

      run(
        '',
        (error, result) => {
          expect(called).to.equal(true);
          expect(result).to.contain('foo bar');
          done();
        },
        {slideLoader: {transforms: [transform]}}
      );
    });

  });

});
