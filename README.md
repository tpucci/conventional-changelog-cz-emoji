# Conventional Changelog cz-emoji

This is a conventional changelog adapter for [`cz-emoji`](https://github.com/ngryman/cz-emoji)

## Install

`yarn global add conventional-changelog-cli`
`yarn add conventional-changelog-cz-emoji`

## Setup

Add this to your `package.json`:

```json
{
  "scripts": {
    "preversion": "yarn test", // Recommended
    "version": "conventional-changelog -i CHANGELOG.md -s -n node_modules/conventional-changelog-cz-emoji",
    "postversion": "git push --tags"
  }
}
```

## Recommended workflow

1. Make changes
2. Commit those changes
3. Make sure your CI turns green
4. Bump version in `package.json` with `yarn version`
