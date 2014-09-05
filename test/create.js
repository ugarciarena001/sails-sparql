var assert = require('assert');
Adapter = require('../lib/adapter.js'),

describe('Creating Nodes', function () {
	it('should create one node with a property test = "1"', function (done) {
		Adapter.create(null, { test: 'string' }, { test: 'testtest' }, function(err, results) {
			if (err) { throw err; }
			done();
		});
	});

	it('should create multiple nodes with the property test = "1"', function(done) {
//		var adapter = require('../lib/adapter.js');
//		adapter.createMany(null,{params:[{ test: 1 },{ test: 1 }]}, function(err, results) {
//			if (err) { throw err; }
//			nodes.push(results);
			done();
//		});
	});
});
