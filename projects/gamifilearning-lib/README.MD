# Gamifilearning Library

The purpose of this library is providing gamification and active learning capabilities while staying modular and easy to distribute.

# Getting Started

This library needs to be build before using. The same applies after each change. Imagine this is a npm package.

- `npm build_lib` before starting the normal `npm start` routine

## Development

- `npm build-lib:watch` will watch for changes and automatically build lib

## Packaging

- `npm run package` to create a .tgz file, that can be imported into other apps

# Todos

# Troubleshooting

- No Permission Errors during dev: Delete dist/ and build again.
- `Cant resolve module`: Restart the `npm start` routine. It sometimes doesn't notice changes to the file system (lib)
