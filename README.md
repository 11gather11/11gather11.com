# 11gather11.com

Source of [11gather11.com](https://11gather11.com).

## Development

The toolchain comes from the Nix flake. With [direnv](https://direnv.net/) and
[nix-direnv](https://github.com/nix-community/nix-direnv), entering the directory loads it and installs
dependencies:

```sh
direnv allow
```

Without direnv, run `nix develop` first.

| Command        | Action                                            |
| -------------- | ------------------------------------------------- |
| `pnpm dev`     | Start the dev server                              |
| `pnpm build`   | Build the site into `dist/`                       |
| `pnpm preview` | Serve the built site                              |
| `pnpm check`   | Format check, lint and type check (oxfmt, oxlint) |
| `pnpm fix`     | Apply formatting and lint fixes                   |
| `pnpm test`    | Run tests                                         |
| `pnpm typos`   | Check spelling                                    |

## License

[MIT](./LICENSE)
