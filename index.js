'use strict';


const github = require('@actions/github');
const process = require('process');


const get_gha_input = function(name) { return process.env[`INPUT_${name.toUpperCase()}`]; }


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

    console.error(err.mesage);
    console.dir(err.stack);
    throw err;
  });
};


process.on('UnhandledPromiseRejection', unhandled_promise_rejection__callback);
process.on('UnhandledPromiseRejectionWarning', unhandled_promise_rejection__callback);


const response = octokit.pulls.create({
  'title': title,                 // Commit title, generally should be less than 74 characters
  'body': body,                   // Multi-line commit message
  'owner': actor,                 // Username or Organization with permissions to initialize Pull Request
  'repo': repo,                   // GitHub repository link or hash eg. `fancy-project`
  'head': head,                   // Where changes are implemented, eg. `your-name:feature-branch`
  'base': base,                   // Branch name where changes should be incorporated, eg. `master`
  'maintainer_can_modify': true,  // Not about to assume that maintainers do not want the option to modify
  'draft': false,                 // If `true` no notifications would be generated
}).catch((e) => {
  const error_message = ['Failed to initialize Pull Request',
                         ...error_message__base,
                         ...gha_example,
  ];
  console.error(error_message.join('\n'));
  throw e;
}).then(function(r) {
  // console.log(JSON.stringify(r['headers']));
  // console.log(JSON.stringify(r['data']));
  console.log(`Rate Limit Remaining -> ${r['headers']['x-ratelimit-remaining']}`);
  console.log(`Rate Limit Reset -> ${r['headers']['x-ratelimit-reset']}`);
  console.log(`Pull Request HTML URL -> ${r['data']['html_url']}`);
  console.log(`Pull Request Number -> ${r['data']['number']}`);
  console.log(`Pull Request State -> ${r['data']['state']}`);
  return r;
});
