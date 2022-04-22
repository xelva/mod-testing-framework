#!/usr/bin/env node
const {cwd} = require('process');

const Runner = require('./runner.js');
const runner = new Runner();

const run = async () => {
    await runner.collectFiles(cwd());
    runner.runTests();
};

run();