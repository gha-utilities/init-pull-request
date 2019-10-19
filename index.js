'use strict';


const github = require('@actions/github');


const get_gha_input = (name) => { process.env[`INPUT_${name.toUpperCase()}`]; }


const actor = process.env.GITHUB_ACTOR;
const repository = process.env.GITHUB_REPOSITORY


if (actor === undefined || repository === undefined) {
  const error_message = [
    'Environment variable `GITHUB_ACTOR` or `GITHUB_REPOSITORY` is undefined',
    'Please ensure that you are testing with something like...',
    '  GITHUB_ACTOR=your-name node index.js',
    '',
    '... hint if errors about undefined Inputs then pop, try...',
    '  GITHUB_ACTOR=your-name\\',
    '  INPUT_PULL_REQUEST_TOKEN=...\\'
    '  node index.js',
  ];

  throw new ReferenceError(error_message.join('\n'));
}


const gha_example__base = [
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
      '        not be done before.'
    ],
  },
];


let error_message__base = [
  'Please check that your Workflow file looks similar to...',
  ...gha_example__base
];


required_inputs__private.forEach((obj) => {
  if (get_gha_input(obj.gha_input) === undefined) {
    const error_message = [
      `Required Input \`${obj.gha_input}\` for GitHub Action was undefined`,
      ...error_message__base,
      ...obj.gha_example
    ];

    throw new ReferenceError(error_message.join('\n'));
  } else {
    error_message__base = error_message__base.concat(obj.gha_example);
  }
});


required_inputs__public.forEach((obj) => {
  if (get_gha_input(obj.gha_input) === undefined) {
    const error_message = [
      `Required Input \`${obj.gha_input}\` for GitHub Action was undefined`,
      ...error_message__base,
      ...obj.gha_example
    ];

    throw new ReferenceError(error_message.join('\n'));
  } else {
    error_message__base = error_message__base.concat(obj.gha_example);
  }
});


let octokit;
try {
  octokit = new github.GitHub(get_gha_input('pull_request_token'));
} catch (e) {
  throw new Error('Cannot authenticate to GitHub rest API');
}


const head = get_gha_input('head');
const base = get_gha_input('base');
const title = get_gha_input('title');
const body = get_gha_input('body');


let response;
try {
  response = octokit.pulls.create({
    'title': title,                 // Commit title, generally should be less than 74 characters
    'body': body,                   // Multi-line commit message
    'owner': actor,                 // Username or Organization with permissions to initialize Pull Request
    'repo': repository,             // GitHub repository link or hash eg. `org-or-name/repository`
    'head': head,                   // Where changes are implemented, eg. `your-name:feature-branch`
    'base': base,                   // Branch name where changes should be incorporated, eg. `master`
    'maintainer_can_modify': true,  // Not about to assume that maintainers do not want the option to modify
    'draft': false,                 // If `true` no notifications would be generated
  });
} catch (e) {
  console.log('Error initializing Pull Request');
}

if (response) {
  console.table(response);
} else {
  console.log('Failed to initialize Pull Request');
}
