import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';

var hasbin = require('hasbin');

export async function run() {
    try {

    } catch (err) {
        core.setFailed(err.message);
    }
}
