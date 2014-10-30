var TestRunner = require('../lib/test_runner');

var tr = new TestRunner('/dev/ttyUSB0');
tr.on('done', process.exit);
tr.start(2);
