# Arduino Test Runner
A utility for running hardware tests on Arduino inspired by [Mocha](https://github.com/mochajs/mocha).  Tests are implemented on the Arduino using the [TestRunner](https://github.com/crispytronics/TestRunner) library.  Tests are run and the results are aggregated by running this utility.

## Prerequisites
Write your Arduino tests using the [TestRunner](https://github.com/crispytronics/TestRunner) library.

## Installation
Use npm to install Arduino TestRunenr globally.

```
npm install arduino-test-runner -g
```

## Usage
```
$ arduino-test-runner --help
Usage:
  arduino-test-runner [OPTIONS] [ARGS]

Options:
  -s, --serial [PATH]    Serial Port (Default is /dev/ttyUSB0)
  -m, --mode NUMBER      Test Mode
  -h, --help             Display help and usage details

```
