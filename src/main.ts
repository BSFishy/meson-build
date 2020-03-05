import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as path from 'path';
import * as fs from 'fs';

// var hasbin = require('hasbin');

const NINJA: string = 'ninja';
const MESON: string = 'meson';
const PYTHON: string = 'python';
const CLANG_TIDY: string = 'clang-tidy';
const GCOVR: string = 'gcovr'

const NINJA_FILE: string = 'ninja.build';

const ACTION: string = 'action';
const BUILD: string = 'build';
const INSTALL: string = 'install';
const TEST: string = 'test';
const COVERAGE: string = 'coverage';
const TIDY: string = 'tidy';

const DIRECTORY: string = 'directory';
const SETUP_OPTIONS: string = 'setup-options';
const OPTIONS: string = 'options';
const NINJA_VERSION: string = 'ninja-version';
const MESON_VERSION: string = 'meson-version';
const GCOVR_VERSION: string = 'gcovr-version';

enum MesonAction {
    Build,
    Install,
    Test,
    Coverage,
    Tidy
}

var action: MesonAction;
var directory: string;
var setupOptions: string | undefined;
var options: string | undefined;
var ninjaVersion: string;
var mesonVersion: string;
var gcovrVersion: string;

function processActionArg(): MesonAction {
    const actionTmp: string = core.getInput(ACTION);
    core.debug(`Processing action argument: ${actionTmp}`);

    switch (actionTmp.toLowerCase()) {
        case BUILD:
            return MesonAction.Build;
        case INSTALL:
            return MesonAction.Install;
        case TEST:
            return MesonAction.Test;
        case COVERAGE:
            return MesonAction.Coverage;
        case TIDY:
            return MesonAction.Tidy;
        default:
            throw new Error(`Unknown Meson action: ${actionTmp}`);
    }
}

function processArgs() {
    core.debug('Processing args...');

    processActionArg();

    directory = core.getInput(DIRECTORY);
    core.debug(`Processing directory argument: ${directory}`);
    if (directory.length < 1) {
        throw new Error('Meson must build to a directory');
    }

    const setupOptionsTmp: string = core.getInput(SETUP_OPTIONS);
    core.debug(`Processing setup options argument: ${setupOptionsTmp}`);
    if (setupOptionsTmp.length > 0) {
        setupOptions = setupOptionsTmp;
    } else {
        setupOptions = undefined;
    }

    const optionsTmp: string = core.getInput(OPTIONS);
    core.debug(`Processing options argument: ${optionsTmp}`);
    if (optionsTmp.length > 0) {
        options = optionsTmp;
    } else {
        options = undefined;
    }

    ninjaVersion = core.getInput(NINJA_VERSION);
    core.debug(`Processing ninja version argument: ${ninjaVersion}`);
    if (ninjaVersion.length < 1) {
        throw new Error('No Ninja version specified');
    }

    mesonVersion = core.getInput(MESON_VERSION);
    core.debug(`Processing meson version argument: ${mesonVersion}`);
    if (mesonVersion.length < 1) {
        throw new Error('No Meson version specified');
    }

    gcovrVersion = core.getInput(GCOVR_VERSION);
    core.debug(`Processing gcovr version argument: ${gcovrVersion}`);
    if (gcovrVersion.length < 1) {
        throw new Error('No gcovr version specified');
    }
}

var pythonCache: string | undefined = undefined;
async function findPython(): Promise<string> {
    core.debug('Searching for Python...');

    if (pythonCache) {
        core.debug('Using Python from cache');
        return pythonCache;
    }

    let python: string;
    let envLocation: string | undefined = process.env.pythonLocation;

    if (envLocation) {
        core.debug('Found Python from setup-python action');
        python = path.join(envLocation, PYTHON);
    } else {
        python = await io.which(PYTHON);
        if (python.length < 1)
            throw new Error('Python could not be found');

        core.debug('Found Python using which');

        // if (hasbin.sync(PYTHON)) {
        //     core.debug('Found Python in the path');
        //     python = PYTHON;
        // } else {
        //     throw new Error('Python could not be found');
        // }
    }

    pythonCache = python;
    return python;
}

async function findNinja(): Promise<string> {
    core.debug('Checking for Ninja...');

    // if (hasbin.sync(NINJA)) {
    //     core.debug('Found Ninja in the path')
    //     return;
    // }

    try {
        const ninja: string = await io.which(NINJA);
        if (ninja.length < 1)
            throw new Error();

        core.debug('Found Ninja using which');
        return ninja;
    } catch {
        core.info(`Installing Ninja version ${ninjaVersion}`);
        const python: string = await findPython();
        await exec.exec(python, ['-m', 'pip', 'install', `ninja==${ninjaVersion}`]);

        const ninja: string = await io.which(NINJA);
        if (ninja.length < 1)
            throw new Error('Ninja could not be found after installing');
        
        return ninja;
    }
}

async function findMeson(): Promise<string> {
    core.debug('Checking for Meson...');

    // await checkNinja();

    // if (hasbin.sync(MESON)) {
    //     core.debug('Found Meson in the path');
    //     return;
    // }
    try {
        const meson: string = await io.which(MESON);
        if (meson.length < 1)
            throw new Error();

        core.debug('Found Meson using which');
        return meson;
    } catch {
        core.info(`Installing Meson version ${mesonVersion}`);
        const python: string = await findPython();
        await exec.exec(python, ['-m', 'pip', 'install', `meson==${mesonVersion}`]);

        const meson: string = await io.which(MESON);
        if (meson.length < 1)
            throw new Error('Meson could not be found after installing');
        
        return meson;
    }
}

async function findCoverage(): Promise<string> {
    core.debug(`Checking for ${COVERAGE}`);

    // if (hasbin.sync(GCOVR)) {
    //     core.debug('Found gcovr in the path');
    //     return;
    // }
    
    try {
        const gcovr: string = await io.which(GCOVR);
        if (gcovr.length < 1)
            throw new Error();

        core.debug('Found gcovr using which');
        return gcovr;
    } catch {
        core.info(`Installing gcovr version ${gcovrVersion}`);
        const python: string = await findPython();
        await exec.exec(python, ['-m', 'pip', 'install', `gcovr==${gcovrVersion}`]);

        const gcovr: string = await io.which(GCOVR);
        if (gcovr.length < 1)
            throw new Error('gcovr could not be found after installing');
        
        return gcovr;
    }
}

async function findTidy(): Promise<string> {
    core.debug(`Checking for ${CLANG_TIDY}`);

    const tidy: string = await io.which(CLANG_TIDY);
    if (tidy.length < 1)
        throw new Error('Clang-tidy must be installed to run it');
    
    return tidy;
    // if (!hasbin.sync(CLANG_TIDY))
    //     throw new Error('Clang-tidy must be installed to run it');
}

export async function run() {
    try {
        processArgs();

        const ninja: string = await findNinja();
        const meson: string = await findMeson();

        if (!fs.existsSync(directory) || !fs.existsSync(path.join(directory, NINJA_FILE))) {
            core.info('Project isn\'t setup yet. Setting it up.');

            let setupArgs: string[] = ['setup', directory];
            if (action == MesonAction.Coverage)
                setupArgs = setupArgs.concat('-Db_coverage=true');
            if (setupOptions)
                setupArgs = setupArgs.concat(setupOptions);
            
            core.debug(`Running Meson setup: ${meson} ${setupArgs.join(' ')}`);
            await exec.exec(meson, setupArgs);
        }

        if (!fs.existsSync(path.join(directory, NINJA_FILE))) {
            throw new Error('Project was not setup successfully');
        }

        var command: string = '';
        var args: string[] = [];

        core.debug('Building arguments array');
        switch (action) {
            case MesonAction.Build:
                command = ninja;
                args = ['-C', directory];
                break;
            case MesonAction.Install:
                command = meson;
                args = [INSTALL, '-C', directory];
                break;
            case MesonAction.Test:
                command = meson;
                args = [TEST, '-C', directory];
                break;
            case MesonAction.Coverage:
                command = await findCoverage();
                args = ['-C', directory, COVERAGE];
                break;
            case MesonAction.Tidy:
                command = await findTidy();
                args = ['-C', directory, CLANG_TIDY];
                break;
        }

        if (options)
            args = args.concat(options);
        
        core.debug(`Running Meson: ${command} ${args.join(' ')}`);
        await exec.exec(command, args);
    } catch (err) {
        core.setFailed(err.message);
    }
}
