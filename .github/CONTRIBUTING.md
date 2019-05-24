# CONTRIBUTING

## Table of Contents

- [Welcome](#welcome)
- [Issue](#issue)
  - [Reporting a bug](#reporting-a-bug)
  - [Request a feature](#request-a-feature)
  - [Other questions](#other-questions)
- [Pull Request](#pull-request)

## Welcome

When contributing to this repository, please first discuss the change you
want to make via [`issue`](#issue)

## Issue

If you have any questions, or you've found a bug or want to share any idea,
please create the relevant issue in this repository.

Please take into account of our wishes for work with issues:

- Use the GitHub issue search — to ensure that the issue hasn't been already reported.
- The issue tracker shouldn't be used for personal support requests.

### Reporting a bug

A bug is a demonstrable problem caused by the code in the repository.
Thank you for essential bug reports!

Guidelines for bug reports:

- Check if the issue has been fixed and try to reproduce it using the latest `develop` branch in the repository.
- Isolate the problem by creating a test case and a live example.

A good bug report shouldn't leave others to need to reach you for
more information. Please try to be as detailed as possible as all details
listed will help us to fix the found issues.

Create issue: [`reporting a bug`][github-url-issue-bug-reporter]

### Request a feature

We welcome feature requests but take some time to ensure that your idea fits
with the scope and aims of our project. Please provide as much detail and
context as possible.

Create issue: [`request a feature`][github-url-issue-feature]

### Other questions

You can create an issue: [`custom issue`][github-url-issue-custom]

## Pull Request

Please reach us before submitting any significant pull request (e.g.
implementing features, refactoring code), otherwise, you risk spending a
lot of time working on something that is not likely to be merged
into the project.

Please adhere to the coding conventions used throughout a project (indentation,
accurate comments, etc.).

Follow this process if you want your work to be included in our project:

### STEP 1: Fork and clone

Fork the [`svoboda-rabstvo/ngx-translate-lint`][github-url] repo and then clone it.

> Note: More information about creating a fork and cloning your fork to local folder read in [`git help`][github-help-fork]

### STEP 2: Get the latest changes

```bash
git checkout develop
```

### STEP 3: Install

```bash
npm install
```

### STEP 4: Create a new branch

```bash
git checkout -b type/issue-short-name
```

Where:

- `type` - is a [semantic type](#type) for commits
- `issue-short-name` - is a short name of issue. Please use `-` delimiters.

> Note: Do not combine fixes for multiple issues into one branch

### STEP 5: Make your changes

Make the changes, following the code conventions. Once you finished,
run following command:

```bush
npm run test
```

If errors not found you can commit the changes to your branch:

```bush
git add -A .
git commit
```

Commit your changes using a descriptive commit message that follows
our [commit message conventions](github-url-commit-message).

### STEP 6: Double check your submission

Make sure your commit has the right format:

- The commit message is [properly formatted](github-url-commit-message).
- The change causes no functional regression. Be sure to run a test to verify your changes before submitting a pull request.
- All changes must be accompanied by tests, even if the feature you’re working on previously had no tests.
- All user-facing changes must be accompanied by the correspondent documentation.

### STEP 8: Push your changes

```bush
git push
```

### STEP 9: Send the pull request

Go to your fork in GitHub and then follow the [GitHub documentation][github-help-pull-request] on how to send a pull request.

- A pull request must contain a description explaining what you did and how the effects can be seen.

[github-url]: https://github.com/svoboda-rabstvo/ngx-translate-lint
[github-url-issue-bug-reporter]: https://github.com/svoboda-rabstvo/ngx-translate-lint/issues/new?template=Bug_report.md
[github-url-issue-feature]: https://github.com/svoboda-rabstvo/ngx-translate-lint/issues/new?template=Feature_request.md
[github-url-issue-custom]: https://github.com/svoboda-rabstvo/ngx-translate-lint/issues/new?template=Custom.md
[github-help-fork]: https://help.github.com/articles/fork-a-repo/#fork-an-example-repository
[github-help-pull-request]: https://help.github.com/articles/creating-a-pull-request
[github-url-commit-message]: https://github.com/svoboda-rabstvo/ngx-translate-lint/blob/develop/docs/git/commit_message.md
