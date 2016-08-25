var SerialPort = require('serialport').SerialPort;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var colors = require('colors');

function TestRunner(serialPort) {
	
	this.serialPort = serialPort;

	this.mode = 0;
	this.buffer;
	this.passed;
	this.failed;
	this.duration;
	this.testName;
	this.currentValueReceived;
	this.currentValue;
	this.currentValueUnits;
	this.serial;
}

util.inherits(TestRunner, EventEmitter);

TestRunner.prototype.start = function start(mode) {
	var self = this;

	self.serial = new SerialPort(this.serialPort);
	self.buffer = '';
	if(mode) this.mode = mode;

	// handle open event
	self.serial.on('open', function() {
		self.serial.on('data', function(data) {
			self.buffer += data.toString();
			if(self.buffer == '$ ') {
				self.emit('ready');
			}
			else if(self.buffer.indexOf('\n') > -1) {
				var lines = self.buffer.split('\n');
				for(i = 0; i < lines.length - 1; i++) {
					self.emit('line', lines[i]);
				}
				self.buffer = lines[lines.length-1];
			}
		});
	});

	// handle ready event
	self.once('ready', function() {
		self.serial.write('run ' + self.mode + '\r'); // FIXME: Add mode here
		self.once('ready', function() {
			self.emit('done');
		});
	});

	// process each line
	self.on('line', function(line) {
		try {
			var obj = JSON.parse(line);
			switch(obj.action) {
				case 'suite-started':
					self.emit('suite-started', obj);
					testSuiteStarted(obj).bind(self);
					break;
				case 'suite-finished':
					obj.passed = passed;
					obj.failed = failed;
					obj.duration = duration;
					self.emit('suite-finished', obj);
					testSuiteFinished(obj).bind(self);
					break;
				case 'test-started':
					self.emit('test-started', obj);
					testStarted(obj).bind(self);
					break;
				case 'current-value':
					self.emit('current-value', obj);
					currentValue(obj).bind(self);
					break;
				case 'test-finished':
					self.emit('test-finished', obj);
					testFinished(obj).bind(self);
					break;
				default:
					throw 'Unknown action';
			}
		}
		catch(err) {
		}
	});

	function deleteLines(n) {
		for(i = 0; i < n; i++) {
			process.stdout.write('\x1b[1A' + '\x1b[2K');
		}
	}

	function testSuiteStarted(obj) {
		this.passed = 0;
		this.failed = 0;
		this.duration = 0;
		process.stdout.write('\n  ' + obj.name + '\n');
	}

	function testSuiteFinished(obj) {
		process.stdout.write('\n  ' + colors.green(this.passed + ' passing'));
		process.stdout.write(colors.gray(' (' + (this.duration/1000) + ' s)\n'));
		if(this.failed > 0) {
			process.stdout.write(colors.red('  ' + this.failed + ' failing\n'));
		}
		process.stdout.write('\n');
	}

	function testStarted(obj) {
		this.currentValueReceived = false;
		this.testName = obj.name;
		process.stdout.write('    ➜ '.cyan + this.testName + '... \n');
	}

	function testFinished(obj) {
		deleteLines(1);
		this.duration += obj.duration;
		if(obj.result == 'pass') {
			this.passed += 1;
			process.stdout.write('    ✓ '.green);
	 }
		else if(obj.result == 'fail') {
			this.failed += 1;
			process.stdout.write('    ✖ '.red);
		}
		process.stdout.write(this.testName);
		if(this.currentValueReceived) {
			process.stdout.write('... ' + colors.cyan(this.currentValue + ' ' + this.currentValueUnits));
		}
		process.stdout.write(colors.gray(' (' + obj.duration + ' ms)\n'));
	}

	function currentValue(obj) {
		this.currentValueReceived = true;
		this.currentValue = obj.value;
		this.currentValueUnits = obj.units;

		deleteLines(1);
		process.stdout.write('    ➜ '.cyan + this.testName + '... ' + this.currentValue + ' ' + this.currentValueUnits + '\n');
	}

}

module.exports = TestRunner;
