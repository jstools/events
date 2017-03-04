/* global require, describe, it, beforeEach, process */

if( typeof require !== 'undefined' ) { // if is nodejs (not browser)

var Azazel = require( process.env.TEST_JS === 'min' ? '../azazel.min' : '../azazel' ),
		assert = require('assert');

/* eslint-disable */
	console.log('testing', process.env.TEST_JS === 'min' ? 'azazel.min.js' : 'azazel.js' );
/* eslint-enable */
}


describe('Azazel', function () {

	var obj;

	beforeEach(function () {
		obj = new Azazel();
	});

	it('event suscription', function () {
		var flag = false;

		obj.on('foo', function () {
			flag = true;
		});

		obj.emit('foo');

		assert.strictEqual(flag, true);
	});

	it('event multi-suscription', function () {
		var count = 0;

		obj.on('foo bar', function () {
			count++;
		});

		obj.emit('foo');
		obj.emit('bar');

		assert.strictEqual(count, 2);
	});

	it('event multi-suscription', function () {
		var count = 0;

		obj.on(['foo','bar'], function () {
			count++;
		});

		obj.emit('foo');
		obj.emit('bar');

		assert.strictEqual(count, 2);
	});

	it('event suscription twice', function () {
		var count = false;

		obj.on('foo', function () {
			count++;
		});

		obj.emit('foo');
		obj.emit('foo');

		assert.strictEqual(count, 2);
	});

	it('event suscription once', function () {
		var count = false;

		obj.once('foo', function () {
			count++;
		});

		obj.emit('foo');
		obj.emit('foo');

		assert.strictEqual(count, 1);
	});

	it('event multi-suscription once', function () {
		var count = 0;

		obj.once('foo bar', function () {
			count++;
		});

		obj.emit('foo');
		obj.emit('bar');

		obj.emit('foo');
		obj.emit('bar');

		assert.strictEqual(count, 1);
	});

	it('event suscription off', function () {
		var count = false,
				increaseCount = function () {
					count++;
				};

		obj.on('foo', increaseCount);

		obj.emit('foo');
		obj.emit('foo');

		obj.off('foo', increaseCount);

		obj.emit('foo');

		assert.strictEqual(count, 2);
	});

	it('event multi-suscription off', function () {
		var count = false,
				increaseCount = function () {
					count++;
				};

		obj.on('foo bar', increaseCount);

		obj.emit('foo bar');

		obj.off('foo bar', increaseCount);

		obj.emit('foo bar');

		assert.strictEqual(count, 2);
	});

	it('event passing data', function () {
		var result = false;

		obj.on('foo', function (value) {
			result = value;
		});

		obj.emit('foo', ['bar']);

		assert.strictEqual(result, 'bar');
	});

	it('event passing data', function () {
		var result = false;

		obj.on('foo', function (value, value2) {
			result = value + ', ' + value2;
		});

		obj.emit('foo', ['foo', 'bar']);

		assert.strictEqual(result, 'foo, bar');
	});
});

describe('Azazel:target', function () {

	var obj;

	beforeEach(function () {
		obj = function () {};
		new Azazel(obj);
	});

	it('event suscription', function () {
		var flag = false;

		obj.on('foo', function () {
			flag = true;
		});

		obj.emit('foo');

		assert.strictEqual(flag, true);
	});

	it('event multi-suscription', function () {
		var count = 0;

		obj.on('foo bar', function () {
			count++;
		});

		obj.emit('foo');
		obj.emit('bar');

		assert.strictEqual(count, 2);
	});

	it('event multi-suscription', function () {
		var count = 0;

		obj.on(['foo','bar'], function () {
			count++;
		});

		obj.emit('foo');
		obj.emit('bar');

		assert.strictEqual(count, 2);
	});

	it('event suscription twice', function () {
		var count = false;

		obj.on('foo', function () {
			count++;
		});

		obj.emit('foo');
		obj.emit('foo');

		assert.strictEqual(count, 2);
	});

	it('event suscription once', function () {
		var count = false;

		obj.once('foo', function () {
			count++;
		});

		obj.emit('foo');
		obj.emit('foo');

		assert.strictEqual(count, 1);
	});

	it('event multi-suscription once', function () {
		var count = 0;

		obj.once('foo bar', function () {
			count++;
		});

		obj.emit('foo');
		obj.emit('bar');

		obj.emit('foo');
		obj.emit('bar');

		assert.strictEqual(count, 1);
	});

	it('event suscription off', function () {
		var count = false,
				increaseCount = function () {
					count++;
				};

		obj.on('foo', increaseCount);

		obj.emit('foo');
		obj.emit('foo');

		obj.off('foo', increaseCount);

		obj.emit('foo');

		assert.strictEqual(count, 2);
	});

	it('event multi-suscription off', function () {
		var count = false,
				increaseCount = function () {
					count++;
				};

		obj.on('foo bar', increaseCount);

		obj.emit('foo bar');

		obj.off('foo bar', increaseCount);

		obj.emit('foo bar');

		assert.strictEqual(count, 2);
	});

	it('event passing data', function () {
		var result = false;

		obj.on('foo', function (value) {
			result = value;
		});

		obj.emit('foo', ['bar']);

		assert.strictEqual(result, 'bar');
	});

	it('event passing data', function () {
		var result = false;

		obj.on('foo', function (value, value2) {
			result = value + ', ' + value2;
		});

		obj.emit('foo', ['foo', 'bar']);

		assert.strictEqual(result, 'foo, bar');
	});
});
