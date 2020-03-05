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
- uses: BSFishy/meson-build@v1
  with:
    action: test
```

All options:
```yaml
- uses: BSFishy/meson-build@v1
  with:
    action: test
    directory: build
    setup-options: -Db_coverage=true
    options: --verbose
    meson-version: 0.53.2
    ninja-version: 1.9.0.post1
    gcovr-version: 4.2
```
