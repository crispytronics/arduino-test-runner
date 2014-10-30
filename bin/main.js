#!/usr/bin/env node

var cli = require('cli');
var TestRunner = require('../lib/test_runner');

cli.parse({
  serial: ['s', 'Serial Port', 'path', '/dev/ttyUSB0'],
  mode: ['m', 'Test Mode', 'number', 0]
});

cli.main(function(args, options) {
  var tr = new TestRunner(options.serial);
  tr.on('done', process.exit);
  tr.start(options.mode);
});
