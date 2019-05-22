# Commit message

The commit message format is important as these messages are used
to create a changelog for each release. The issue number helps
to create more consistent and useful changelogs.

Each commit message consists of a **header**, a [**body**](#body) and a [**footer**](#footer).
The header has a special format that includes a [type](#type) and a [subject](#subject):

```text
<type>:<subject> (<number of issue>)
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

> Note: Also you can use exactly [Conventional Commits 1.0.0-beta.4](#conventional_commits)

## Type

Must be one of the following:

| name         | description |
| :-:          | -       |
| docs         | Documentation only changes |
| feat         | A new feature |
| fix          | A bug fix |
| perf         | A code change that improves performance |
| refactor     | A code change that neither fixes a bug or adds a feature |
| style        | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, e.t.c) |
| test         | Adding missing tests or correcting existing tests |
| breaking     | For a backward-incompatible enhancement or feature |
| ci           | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) |

## Subject

The subject contains the exact description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- no dot use (.) at the end

## Body

The body should include the full description of the change.

## Footer

The footer should contain a [closing reference to an issue][github-help-close-issue] if there's any.

## Example

```text
Test: Add missing tests for a linter (#456)

Adding missing tests for the linter:
- with full data
- incorrect array of error

Closes #456
```

[conventional_commits]: https://www.conventionalcommits.org/en/v1.0.0-beta.4/#specification
[github-help-close-issue]: https://help.github.com/articles/closing-issues-via-commit-messages
