# Meson Build action
[![Test](https://github.com/BSFishy/meson-build/workflows/Test/badge.svg)](https://github.com/BSFishy/meson-build/actions)

Run a Meson task during your Actions workflow

## Usage
See [action.yml](action.yml)

Basic:
```yaml
steps:
- uses: actions/checkout@v2
- uses: actions/setup-python@v1
- uses: BSFishy/meson-build@v1.0.3
  with:
    action: test
```

All options:
```yaml
- uses: BSFishy/meson-build@v1.0.3
  with:
    action: test
    directory: build
    setup-options: -Db_coverage=true
    options: --verbose
    meson-version: 0.53.2
    ninja-version: 1.9.0.post1
    gcovr-version: 4.2
```

### Options
Here is a list of options that can be used with this action.

#### `action`
The action to perform.
This specifies what the action should actually be doing.
It defines what command is run when it comes time.

Note that the project will always be setup before an action is run.
Before the action is run, `meson setup [directory]` will be run to setup the project.
If the directory already exists and there is a file name `build.ninja` in it, this step is skipped.

It should be one of the following values:
 - `build`
  Simply build the project. This will use Ninja to automatically build the project. Apart from that, no additional tasks are run.
 - `install`
  Install the project. This will use Meson to install the project to the system.
 - `test`
  Run unit tests. This will run any unit tests defined in the Meson project, using Meson.
 - `coverage`
  Run [Gcovr](https://gcovr.com/en/stable/). This will use Meson to find the code coverage of the project.
  Note that this required Gcovr. If it is not already installed, it will be installed automatically.
 - `tidy`
  Run [Clang-Tidy](https://clang.llvm.org/extra/clang-tidy/) on the project. This will use Meson to lint the project.
  Note that this requires Clang-Tidy. If it is not installed, an error will occur.

#### `directory`
The directory to build the project in.
This will automatically cause all of the commands to run the commands on whatever directory is specified here.
By default, the build directory will simply be `build`.

The build directory can already exist.
If the build directory exists before the action is run, it is checked for a `build.ninja` file.
If the directory and the `build.ninja` file already exist, nothing is done to setup the project.
If either of them are missing, the project is setup using `meson setup`.

#### `setup-options`
Options to pass when setting up the project.
These are command line arguments that are passed to Meson when setting up the project.
This happens when either the `directory` specified or the `build.ninja` inside of the directory does not already exist.
This allows you to specify specific options to Meson to build with.
The options are passed directly to `meson setup`.

#### `options`
Options to pass to the Meson command.
These are command line arguments that are passed to whatever Meson command is to be called.
This allows you to run the command with specific options.
The options are passed directly to whatever command is run without formatting.

#### `meson-version`
The version of Meson to install.
Whenever the action is initially run, it checks if Meson is installed.
If Meson is already installed, this part is skipped.
Note that this means that it won't garuantee that a specific version of Meson is installed.
If Meson is not installed when the action is run, it will install it using pip and this version.

#### `ninja-version`
The version of Ninja to install.
Whenever the action is initially run, it checks if Ninja is installed.
If Ninja is already installed, this part is skipped.
Note that this means that it won't garuantee that a specific version of Ninja is installed.
If Ninja is not installed when the action is run, it will be installed using pip and this version.

#### `gcovr-version`
The version of Gcovr to install.
Whenever the `coverage` action is run, Gcovr is checked if it is installed.
If not, pip will be used to install this version of Gcovr.

### Additional info
Here is just a little bit of additional information to explain some things that may not be trivial.

#### Lifecycle
The lifecycle of the action is fairly important.
Luckily, it is fairly simple.
Here is what it looks like:

 1. Process the inputs.
  First, we need to get all of our inputs and figure out what exactly they are. The main part of this step is to format the `action` input. We just need to make sure it is a valid value.
 2. Check for Ninja.
  Next, we need to make sure Ninja is installed. Ninja is a dependency of Meson, so we do a simple check if it is on the current system. If not, it is installed through pip.
 3. Check for Meson.
  We also need to make sure Meson is installed. If Meson is not already installed, it is installed through pip.
 4. Check if the project is setup.
  We need to check if the project is setup. This will check if the build directory exists and if the `build.ninja` file exists in that directory. If either of those are missing, a `meson setup` command will be called to setup the project. If either of those are missing even after running the setup command, it is assumed that the project has an error, and it exits.
 5. Build the command.
  Next, we build the command that is to be run. Based on the action to run, an executable and basic set of arguments are selected that correspond to that command. Any dependencies (i.e. Gcovr or Clang-Tidy) are also installed if their respective actions are used. Finally, the `options` input is appended to the arguments.
 6. Run the command.
  Finally, we run the command that was built in the previous step.

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
