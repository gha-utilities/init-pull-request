'use strict';


import github from '@actions/github';
import process from 'process';


/**
 * Coerces values into JavaScript object types
 * @function coerce
 * @param {any} value
 * @returns {any}
 * @throws {!SyntaxError}
 * @example
 * coerce('1');
 * //> 1
 *
 * coerce('stringy');
 * //> "stringy"
 *
 * coerce('{"key": "value"}');
 * //> {key: "value"}
 */
const coerce = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    if (!(e instanceof SyntaxError)) {
      throw e;
    }

    if (['undefined', undefined].includes(value)) {
      return undefined;
    } else {
      return value;
    }
  }
};


/**
 * Get Action Input or Environment variable by name
 * @param {string} name
 * @param {boolean} coerce_types
 * @return {string|any}
 * @example
 * const verbose = get_gha_input('verbose');
 * if (verbose === 'true') {
 *   console.log(verbose);
 *   //> "true"
 * }
 */
const get_gha_input = (name, coerce_types = false) => {
  const value = process.env[`INPUT_${name.toUpperCase()}`];
  if (coerce_types === true) {
    return coerce(value);
  }
  return value;
};


/**
 * Set Action Output or Environment variable by name to specified value
 * @param {string} name
 * @param {string} value
 * @example
 * set_gha_output('result') = 'nifty'
 * console.log(process.env.OUTPUT_RESULT);
 * //> "nifty"
 */
const set_gha_output = (name, value) => {
  process.env[`OUTPUT_${name.toUpperCase()}`] = value;
};


/**
 * General callback for unhandled promise rejection errors and warnings
 * @callback unhandled_promise_rejection__callback
 * @param {Error} err
 * @param {Promise} _promise
 * @throws {UnhandledPromiseRejection | UnhandledPromiseRejectionWarning}
 */
const unhandled_promise_rejection__callback = (err, _promise) => {
  setTimeout(() => {
    if (_promise) {
      console.error(`Unhandled rejection at: ${_promise}`);
    }

    console.error(err.message);
    console.dir(err.stack);
    throw err;
  });
};


/**
 * General callback to inspect and capture warnings
 * @callback warning__callback
 * @param {Error} warning
 */
const warning__callback = (warning) => {
  console.warn(warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
};


process.on('unhandledRejection', unhandled_promise_rejection__callback);
process.on('warning', warning__callback);


const actor = process.env.GITHUB_ACTOR;
const repo = process.env.GITHUB_REPOSITORY.split('/')[1];


if (actor === undefined || repo === undefined) {
  const error_message = [
    'Environment variable `GITHUB_ACTOR` or `GITHUB_REPOSITORY` is undefined',
    'Please ensure that you are testing with something like...',
    '  GITHUB_ACTOR=your-name node index.js',
    '',
    '... hint if errors about undefined Inputs then pop, try...',
    '  GITHUB_ACTOR=your-name\\',
    '  GITHUB_REPOSITORY=owner/fancy-project\\',
    '  INPUT_PULL_REQUEST_TOKEN=...\\',
    '  node index.js',
  ];

  throw new ReferenceError(error_message.join('\n'));
}


const error_message__base = [
  'Please check that your Workflow file looks similar to...',
];

const gha_example = [
  '  - name: Initialize Pull Request',
  '    uses: gha-utilities/init-pull-request',
  '    with:',
];


const required_inputs__private = [
  {
    gha_input: 'pull_request_token',
    gha_example: ['      pull_request_token: ${{ secrets.PULL_REQUEST_TOKEN }}'],
  },
];


const required_inputs__public = [
  {
    gha_input: 'head',
    gha_example: ['      head: feature-branch'],
  },
  {
    gha_input: 'base',
    gha_example: ['      base: master'],
  },
  {
    gha_input: 'title',
    gha_example: ['      title: Adds awesome feature'],
  },
  {
    gha_input: 'body',
    gha_example: [
      '      body: >',
      '        Some thing can now be done that could',
      '        not be done before.',
    ],
  },
];


required_inputs__private.forEach((obj) => {
  gha_example.push(...obj.gha_example);

  if (get_gha_input(obj.gha_input) === undefined) {
    const error_message = [`Required Input \`${obj.gha_input}\` for GitHub Action was undefined`,
                           ...error_message__base,
                           ...gha_example,
    ];

    throw new ReferenceError(error_message.join('\n'));
  }
});


required_inputs__public.forEach((obj) => {
  gha_example.push(...obj.gha_example);

  if (get_gha_input(obj.gha_input) === undefined) {
    const error_message = [`Required Input \`${obj.gha_input}\` for GitHub Action was undefined`,
                           ...error_message__base,
                           ...gha_example,
    ];

    throw new ReferenceError(error_message.join('\n'));
  }
});


const octokit = new github.GitHub(get_gha_input('pull_request_token'));


const head = get_gha_input('head');
const base = get_gha_input('base');
const title = get_gha_input('title');
const body = get_gha_input('body');


let maintainer_can_modify = get_gha_input('maintainer_can_modify', true);
if (maintainer_can_modify === undefined) {
  // Assume that maintainers do want the option to modify Pull Requests
  maintainer_can_modify = true;
}

let draft = get_gha_input('draft', true);
if (draft === undefined) {
  draft = false;
}


octokit.pulls.create({
  'title': title,                 // Commit title, generally should be less than 74 characters
  'body': body,                   // Multi-line commit message
  'owner': actor,                 // Username or Organization with permissions to initialize Pull Request
  'repo': repo,                   // GitHub repository link or hash eg. `fancy-project`
  'head': head,                   // Where changes are implemented, eg. `your-name:feature-branch`
  'base': base,                   // Branch name where changes should be incorporated, eg. `master`
  'maintainer_can_modify': maintainer_can_modify,
  'draft': draft,                 // When `true`, no notifications are generated
}).then((response) => {
  if (get_gha_input('verbose') ===  true || get_gha_input('verbose') === 'true') {
    const verbose_results = [
      `Rate Limit Remaining -> ${response['headers']['x-ratelimit-remaining']}`,
      `Rate Limit Reset -> ${response['headers']['x-ratelimit-reset']}`,
      `Pull Request HTML URL -> ${response['data']['html_url']}`,
      `Pull Request Number -> ${response['data']['number']}`,
      `Pull Request State -> ${response['data']['state']}`
    ];

    console.log(verbose_results.join('\n'));
  }

  if (get_gha_input('debug') === true || get_gha_input('debug') === 'true') {
    console.log('--- DEBUG START ---');
    console.log('Response headers...');
    console.log(JSON.stringify(response['headers']));
    console.log('Response data...');
    console.log(JSON.stringify(response['data']));
    console.log('--- DEBUG END ---');
  }

  if (response['status'] !== 201) {
    const error_message = ['Response status was not 201 (created), please check',
                           '- configurations for your Action',
                           '- authentication for repository (write permissions)'
    ];

    throw new Error(error_message.join('\n'));
  }

  set_gha_output('html_url', response['data']['html_url']);
  set_gha_output('number', response['data']['number']);
  // return response;
}).catch((e) => {
  const error_message = ['Failed to initialize Pull Request',
                         ...error_message__base,
                         ...gha_example,
  ];
  console.error(error_message.join('\n'));
  throw e;
});
