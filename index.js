var SerialPort = require('serialport').SerialPort;
var colors = require('colors');

var serial = new SerialPort('/dev/ttyUSB0');

var buffer = '';
var _passed;
var _failed;
var _duration;
var _testName;
var _currentValueReceived;
var _currentValue;
var _currentValueUnits;

serial.once('ready', function() {
  serial.write('run 2\r'); // FIXME: Add mode here
  serial.once('ready', function() {
    serial.emit('exit');
    process.nextTick(process.exit());
  });
});

function deleteLines(n) {
  for(i = 0; i < n; i++) {
    process.stdout.write('\x1b[1A' + '\x1b[2K');
  }
}

function testSuiteStarted(obj) {
  _passed = 0;
  _failed = 0;
  _duration = 0;
  process.stdout.write('\n  ' + obj.name + '\n');
}

function testSuiteFinished(obj) {
  process.stdout.write('\n  ' + colors.green(_passed + ' passing'));
  process.stdout.write(colors.gray(' (' + (_duration/1000) + ' s)\n'));
  if(_failed > 0) {
    process.stdout.write(colors.red('  ' + _failed + ' failing\n'));
  }
  process.stdout.write('\n');
}

function testStarted(obj) {
  _currentValueReceived = false;
  _testName = obj.name;
  process.stdout.write('   ➜  '.cyan + _testName + '... \n');
}

function testFinished(obj) {
  deleteLines(1);
  _duration += obj.duration;
  if(obj.result == 'pass') {
    _passed += 1;
    process.stdout.write('    ✓ '.green);
 }
  else if(obj.result == 'fail') {
    _failed += 1;
    process.stdout.write('    ✖ '.red);
  }
  process.stdout.write(_testName);
  if(_currentValueReceived) {
    process.stdout.write('... ' + colors.cyan(_currentValue + ' ' + _currentValueUnits));
  }
  process.stdout.write(colors.gray(' (' + obj.duration + ' ms)\n'));
}

function currentValue(obj) {
  _currentValueReceived = true;
  _currentValue = obj.value;
  _currentValueUnits = obj.units;

  deleteLines(1);
  process.stdout.write('   ➜  '.cyan + _testName + '... ' + _currentValue + ' ' + _currentValueUnits + '\n');
}

serial.on('line', function(line) {
  try {
    var obj = JSON.parse(line);
    switch(obj.action) {
      case 'suite-started':
        testSuiteStarted(obj);
        break;
      case 'suite-finished':
        testSuiteFinished(obj);
        break;
      case 'test-started':
        testStarted(obj);
        break;
      case 'current-value':
        currentValue(obj);
        break;
      case 'test-finished':
        testFinished(obj);
        break;
      default:
        throw 'Unknown action';
    }
  }
  catch(err) {
  }
});

serial.on('open', function() {
	var self = this;

	serial.on('data', function(data) {
    buffer += data.toString();
    if(buffer == '$ ') {
      self.emit('ready');
    }
    else if(buffer.indexOf('\n') > -1) {
      var lines = buffer.split('\n');
      for(i = 0; i < lines.length - 1; i++) {
        self.emit('line', lines[i]);
      }
      buffer = lines[lines.length-1];
    }
	});
});
