# ngx-translate-lint

> Simple tools for check ngx-translate keys in whole app which use regexp and AST (beta).

[![Build Master](https://travis-ci.com/svoboda-rabstvo/ngx-translate-lint.svg?branch=master)](https://travis-ci.com/svoboda-rabstvo/ngx-translate-lint)
[![semantic](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm](https://img.shields.io/npm/v/ngx-translate-lint.svg)](https://www.npmjs.com/package/ngx-translate-lint)
[![download npm](https://img.shields.io/npm/dm/ngx-translate-lint.svg)](https://www.npmjs.com/package/ngx-translate-lint)

## Table of Contents

- [Background](#background)
- [Installation](#installation)
- [Usage](#usage)
    - [CLI](#cli)
    - [TypeScript](#TypeScript)
- [Contribute](#contribute)
- [Used By](#UsedBy)
- [License](#license)

## Background

There are a lot of translation [`ngx-translate`][ngx-translate] keys in the whole app.
This repository contains a proposal to check all translation keys in the whole app
which should exist in all languages files.

## Installation

### NPM

```bash
npm install ngx-translate-lint -g

BETA:

npm install ngx-translate-lint @angular/core @angular/compiler @angular/compiler-cli -g
```

### GitHub

The source code are available for download
at [GitHub Releases][github-release-url] and
[GitHub pages][github-pages-url] as well.

## Usage

### CLI

```text

Usage: ngx-translate-lint [options]

Simple CLI tools for check `ngx-translate` keys in app

Options:
  -p,  --project [glob] (required)
          The path to project folder
          Possible Values: <relative path|absolute path>
          (default: "./src/app/**/*.{html,ts}")
  -l,  --languages [glob] (required)
          The path to languages folder
          Possible Values: <relative path|absolute path>
          (default: "./src/assets/i18n/*.json")
  -v,  --views [enum]
          Described how to handle the error of missing keys on view
          Possible Values: <disable|warning|error>
          (default: "error")
  -z,  --zombies [enum]
          Described how to handle the error of zombies keys
          Possible Values: <disable|warning|error>
          (default: "warning")
   -e, --emptyKeys [enum]
          Described how to handle empty value on translate keys
          Possible Values: <disable|warning|error>
           (default: "warning")
  -i,  --ignore [glob]
          Ignore projects and languages files
          Possible Values: <relative path|absolute path>
  -m,  --misprint [enum]
          Try to find matches with misprint keys on views and languages keys.
          Possible Values: <disable|warning|error>
  -mc, --misprintCoefficient [number]
          Coefficient for misprint option can be from 0 to 1.0.
           (default: "0.9")
  -c, --config [path]
          Path to the config file.
  --maxWarning [number]
           Max count of warnings in all files. If this value more that count of warnings, then an error is return
           Possible Values: <number>
           (default: "0")


  -h, --help  output usage information


Examples:

    $ npx ngx-translate-lint  -p ./src/app/**/*.{html,ts} -l ./src/assets/i18n/*.json
    $ ngx-translate-lint -p ./src/app/**/*.{html,ts} -l ./src/assets/i18n/*.json
    $ ngx-translate-lint -p ./src/app/**/*.{html,ts} -z disable -v error
```

> NOTE: For `project` and `languages` options need to include file types like on the example.
> WARNING!: `BETA` flag working only with angular 11 and higher!

Default Config is:
```json
{
    "rules": {
        "keysOnViews": "error",
        "zombieKeys": "warning",
        "misprint": "warning",
        "emptyKeys": "warning",
        "maxWarning": "0",
        "misprintCoefficient": "0.9",
        "ignoredKeys": [ "IGNORED.KEY.(.*)" ], // can be string or RegExp
        "ignoredMisprintKeys": [],
        "customRegExpToFindKeys": [ /marker\("(.*)"\)/gm ], // to find: marker("TRSNLATE.KEY");
        "ast": {
          "isNgsTranslateImported": "error"
        }
    },
    "tsconfig": "./",
    "project": "./src/app/**/*.{html,ts}",
    "languages": "./src/assets/i18n/*.json"
}
```

#### Exit Codes

The CLI process may exit with the following codes:

- `0`: Linting succeeded without errors (warnings may have occurred)
- `1`: Linting failed with one or more rule violations with severity error
- `2`: An invalid command line argument or combination thereof was used

### TypeScript

```typescript
import { NgxTranslateLint, IRulesConfig, ResultCliModel, ErrorTypes, LanguagesModel} from 'ngx-translate-lint';

const viewsPath: string = './src/app/**/*.{html,ts}';
const languagesPath: string = './src/assets/i18n/*.json';
const ignoredLanguagesPath: string = "./src/assets/i18n/ru.json, ./src/assets/i18n/ru-RU.json";
const ruleConfig: IRulesConfig = {
        keysOnViews: ErrorTypes.error,
        zombieKeys: ErrorTypes.warning,
        misprint: ErrorTypes.warning,
        emptyKeys: ErrorTypes.warning,
        maxWarning: 0,
        misprintCoefficient: 0.9,
        ignoredKeys: [ 'EXAMPLE.KEY', 'IGNORED.KEY.(.*)' ], // can be string or RegExp
        ignoredMisprintKeys: []
};

const ngxTranslateLint = new NgxTranslateLint(viewsPath, languagesPath, ignoredLanguagesPath, ruleConfig)
const resultLint: ResultCliModel = ngxTranslateLint.lint(); // Run Lint
const languages: LanguagesModel[] = ngxTranslateLint.getLanguages()  // Get Languages with all keys and views

```

#### NOTE!
If you have error `Can't resolve 'fs' in ...`. Please add next setting to you project:
 - webpack.js: (`angular.webpack.json`)
```javascript
config.externals = {
    ...config.externals,
    "fs": 'require("fs")',
    "path": 'require("path")'
};
```
 - tsconfig.json
 ```json
{
    "skipLibCheck": true
}
```

## Contribute

You may contribute in several ways like requesting new features,
adding tests, fixing bugs, improving documentation or examples.
Please check our [contributing guidelines][contributing].

## Used By

Here can be your extensions:

- [ngx-translate-editor](https://github.com/svoboda-rabstvo/ngx-translate-editor) - Simple GUI for CRUD translate keys of ngx-translate, which included ngx-translate-lint
- [121 Platform](https://github.com/global-121/121-platform) - 121 is an open source platform for Cash based Aid built with Digital Identity & Local/Global Financial service partners.

## License

[MIT][license-url]

[ngx-translate]: https://github.com/ngx-translate/core
[travis-shield]: https://img.shields.io/travis/svoboda-rabstvo/ngx-translate-lint/master.svg
[travis-url]: https://travis-ci.com/svoboda-rabstvo/ngx-translate-lint/branches
[semantic-shield]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release
[npm-shield]: https://img.shields.io/npm/v/svoboda-rabstvo/ngx-translate-lint.svg
[npm-url]: https://www.npmjs.com/package/ngx-translate-lint
[npm]: https://www.npmjs.com
[node-js]: https://nodejs.org
[github-shield]: https://img.shields.io/github/release/svoboda-rabstvo/ngx-translate-lint.svg?label=github
[github-url]: https://github.com/svoboda-rabstvo/ngx-translate-lint
[github-release-url]: https://github.com/svoboda-rabstvo/ngx-translate-lint/releases
[github-pages-url]: https://svoboda-rabstvo.github.io/ngx-translate-lint/
[schema-url]: http://json-schema.org/
[web-url]: https://schema.linterhub.com
[doc-url]: https://github.com/svoboda-rabstvo/ngx-translate-lint/blob/develop/doc
[license-url]: https://github.com/svoboda-rabstvo/ngx-translate-lint/blob/develop/LICENSE.md
[meta-url]: https://en.wikipedia.org/wiki/List_of_software_package_management_systems#Meta_package_managers
[contributing]: https://github.com/svoboda-rabstvo/ngx-translate-lint/blob/develop/.github/CONTRIBUTING.md
