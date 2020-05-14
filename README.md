## GHA Initialize Pull Request
[heading__title]:
  #gha-initialize-pull-request
  "&#x2B06; Top of ReadMe File"


JavaScript wrapper for `octokit.pulls.create` with provided GitHub Actions Inputs


## [![Byte size of init-pull-request][badge__master__init_pull_request__source_code]][init_pull_request__master__source_code] [![Open Issues][badge__issues__init_pull_request]][issues__init_pull_request] [![Open Pull Requests][badge__pull_requests__init_pull_request]][pull_requests__init_pull_request] [![Latest commits][badge__commits__init_pull_request__master]][commits__init_pull_request__master]


------


#### Table of Contents


- [:arrow_up: Top of ReadMe File][heading__title]

- [:building_construction: Requirements][heading__requirements]

- [:zap: Quick Start][heading__quick_start]

- [&#x1F5D2; Notes][notes]

- [:card_index: Attribution][heading__attribution]

- [:balance_scale: License][heading__license]


------



## Requirements
[heading__requirements]:
  #requirements
  "&#x1F3D7; What is needed prior to making use of this repository"


Access to GitHub Actions if using on GitHub, or manually assigning environment variables prior to running `npm test`.


___


## Quick Start
[heading__quick_start]:
  #quick-start
  "&#9889; Perhaps as easy as one, 2.0,..."


Reference the code of this repository within your own `workflow`...


```YAML
on:
  push:
    branches:
      - src-pages

jobs:
  jekyll_build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source branch for building Pages
        uses: actions/checkout@v1
        with:
          ref: src-pages
          fetch-depth: 10

      - name: Make build destination directory
        run: mkdir -vp ~/www/repository-name

      - name: Jekyll Build
        uses: gha-utilities/jekyll-build@v0.0.1
        with:
          jekyll_github_token: ${{ secrets.JEKYLL_GITHUB_TOKEN }}
          source: ./
          destination: ~/www/repository-name

      - name: Checkout branch for Pull Requesting to GitHub Pages
        uses: actions/checkout@v1
        with:
          ref: pr-pages
          fetch-depth: 1
          submodules: true

      - name: Copy built site files into Git branch
        run: cp -r ~/www/repository-name ./

      - name: Add changes to Git tracking
        run: git add -A .

      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git commit -m 'Updates compiled site files'

      - name: Push changes
        uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          branch: pr-pages

      - name: Initialize Pull Request
        uses: gha-utilities/init-pull-request@v0.1.6
        with:
          verbose: true
          pull_request_token: ${{ secrets.GITHUB_TOKEN }}
          head: pr-pages
          base: gh-pages
          title: 'Updates site files from latest Actions build'
          body: >
            Perhaps a multi-line description
            about latest features and such.
```


___


## Notes
[notes]:
  #notes
  "&#x1F5D2; Additional notes and links that may be worth clicking in the future"


According to OctoKit documentation for [`octokit.pulls.create`](https://octokit.github.io/rest.js/#octokit-routes-pulls-create)...


> You cannot submit a pull request to one repository that requests a merge to a base of another repository.


... and...


> For cross-repository pull requests in the same network, namespace `head` with a user like this: `username:branch`


```YAML
      - name: Initialize Pull Request
        uses: gha-utilities/init-pull-request@v0.1.6
        with:
          verbose: true
          pull_request_token: ${{ secrets.GITHUB_TOKEN }}
          head: 'your-name:pr-pages'
          base: gh-pages
          title: 'Updates site files from latest Actions build'
          body: >
            Perhaps a multi-line description
            about latest features and such.
```


------


To assign a different repository modify the `GITHUB_REPOSITORY` environment variable...


```YAML
      - name: Initialize Pull Request
        uses: gha-utilities/init-pull-request@v0.1.6
        env:
          GITHUB_REPOSITORY: maintainer/repo-name
        with:
          verbose: true
          pull_request_token: ${{ secrets.GITHUB_TOKEN }}
          head: your-name:pr-pages
          base: gh-pages
          title: 'Updates site files from latest Actions build'
          body: >
            Perhaps a multi-line description
            about latest features and such.
```


------


Inputs marked _`[Experimental]`_ within `action.yaml` file (such as `maintainer_can_modify` and `draft`) when defined may cause issues, thus it is a good idea to also define `debug: true` when testing, eg...


```YAML
      - name: Initialize Pull Request
        uses: gha-utilities/init-pull-request@v0.1.6
        env:
          GITHUB_REPOSITORY: maintainer/repo-name
        with:
          verbose: true
          debug: true
          draft: false
          maintainer_can_modify: true
          pull_request_token: ${{ secrets.GITHUB_TOKEN }}
          head: your-name:pr-pages
          base: gh-pages
          title: 'Updates site files from latest Actions build'
          body: >
            Perhaps a multi-line description
            about latest features and such.
```


------


This repository may not be feature complete, or fully operational, Pull Requests are most welcomed ;-)


___


## Attribution
[heading__attribution]:
  #attribution
  "&#x1F4C7; Resources that where helpful in building this project so far."


- [GitHub -- `@actions/github`](https://github.com/actions/toolkit/tree/master/packages/github)

- [GitHub -- `@actions/core`](https://github.com/actions/toolkit/tree/master/packages/core)

- [GitHub -- `peter-evans/create-pull-request`](https://github.com/peter-evans/create-pull-request)

- [GitHub -- `ad-m/github-push-action`](https://github.com/ad-m/github-push-action)

- [GitHub -- Creating a JavaScript Action](https://help.github.com/en/articles/creating-a-javascript-action#commit-and-push-your-action-to-github), specifically the `commit-and-push-your-action-to-github` section that states dependencies must be checked into Git tracking.

- [GitHub -- Workflow syntax for GitHub actions](https://help.github.com/en/articles/workflow-syntax-for-github-actions)

- [GitHub -- Action fails quietly due to Unhandled promise rejection](https://github.com/gha-utilities/init-pull-request/issues/5)

- [GitHub -- `actions/typescript-action`](https://github.com/actions/typescript-action)

- [GitHub Dev -- Create a Pull Request](https://developer.github.com/v3/pulls/#create-a-pull-request)

- [OctoKit -- Create a Pull Request](https://octokit.github.io/rest.js/#octokit-routes-pulls-create)

- [StackOverflow -- GitHub Actions share Workspace Artifacts between jobs](https://stackoverflow.com/questions/57498605)

- [StackOverflow -- How to find which promises are unhandled in Node.js UnhandledPromiseRejectionWarning?](https://stackoverflow.com/questions/43834559)

- [Medium -- How to prevent your Node.js process from crashing](https://medium.com/dailyjs/how-to-prevent-your-node-js-process-from-crashing-5d40247b8ab2)

- [NodeJS -- `process` Event: `unhandledRejection`](https://nodejs.org/api/process.html#process_event_unhandledrejection)


___


## License
[heading__license]:
  #license
  "&#x2696; Legal bits of Open Source software"


Legal bits of Open Source software. Note the following license does **not** necessarily apply to any dependencies of this repository, see licensing and documentation for those within there respective sub-directories under `node_modules/`.


```
Initialize Pull Request GitHub Actions documentation
Copyright (C) 2019  S0AndS0

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation; version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```



[badge__commits__init_pull_request__master]:
  https://img.shields.io/github/last-commit/gha-utilities/init-pull-request/master.svg

[commits__init_pull_request__master]:
  https://github.com/gha-utilities/init-pull-request/commits/master
  "&#x1F4DD; History of changes on this branch"


[init_pull_request__community]:
  https://github.com/gha-utilities/init-pull-request/community
  "&#x1F331; Dedicated to functioning code"


[badge__issues__init_pull_request]:
  https://img.shields.io/github/issues/gha-utilities/init-pull-request.svg

[issues__init_pull_request]:
  https://github.com/gha-utilities/init-pull-request/issues
  "&#x2622; Search for and _bump_ existing issues or open new issues for project maintainer to address."


[badge__pull_requests__init_pull_request]:
  https://img.shields.io/github/issues-pr/gha-utilities/init-pull-request.svg

[pull_requests__init_pull_request]:
  https://github.com/gha-utilities/init-pull-request/pulls
  "&#x1F3D7; Pull Request friendly, though please check the Community guidelines"


[badge__master__init_pull_request__source_code]:
  https://img.shields.io/github/repo-size/gha-utilities/init-pull-request

[init_pull_request__master__source_code]:
  https://github.com/gha-utilities/init-pull-request
  "&#x2328; Project source code!"
