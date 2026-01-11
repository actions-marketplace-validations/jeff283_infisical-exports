# Infisical Exports

A GitHub Action that exports Infisical secrets to `.env` files organized by folder paths for use in your GitHub Actions workflows.

## Description

This action connects to your Infisical instance and exports secrets from a specified project and environment to `.env` files, organized by their folder paths in Infisical. Secrets are grouped by their folder structure and written to corresponding `.env` files, making them available to your application or subsequent steps in your workflow.

## Installation

To use this action in your workflow, reference it in your workflow file:

```yaml
- uses: jeff283/infisical-exports@main
  with:
    infisical-client-id: ${{ secrets.INFISICAL_CLIENT_ID }}
    infisical-client-secret: ${{ secrets.INFISICAL_CLIENT_SECRET }}
    infisical-project-id: ${{ secrets.INFISICAL_PROJECT_ID }}
```

## Development

### Prerequisites

- [Bun](https://bun.com) v1.3.4 or later

### Install Dependencies

```bash
bun install
```

### Build

```bash
bun run build
```

This will compile the TypeScript source code to JavaScript in the `dist/` directory.

## Inputs

| Input                     | Description                                                                      | Required | Default                    |
| ------------------------- | -------------------------------------------------------------------------------- | -------- | -------------------------- |
| `infisical-client-id`     | The Client ID of the Infisical application                                       | Yes      | -                          |
| `infisical-client-secret` | The Client Secret of the Infisical application                                   | Yes      | -                          |
| `infisical-project-id`    | The ID of the Infisical project                                                  | Yes      | -                          |
| `infisical-domain`        | The domain of the Infisical instance                                             | No       | `https://eu.infisical.com` |
| `infisical-env-slug`      | The Slug of the Infisical environment                                            | No       | `dev`                      |
| `folder-append`           | Optional prefix to prepend to folder paths (empty string uses current directory) | No       | `""`                       |
| `create-folders-flag`     | Whether to create folders if they don't exist (`true`/`false`)                   | No       | `false`                    |

## Outputs

| Output            | Description                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| `total-env-files` | Total number of `.env` files created                                    |
| `total-secrets`   | Total number of secrets written across all `.env` files                 |
| `env-file-paths`  | JSON array of all `.env` file paths that were created                   |
| `locations-file`  | Path to the locations JSON file containing metadata about created files |
| `duration-ms`     | Time taken to complete the action in milliseconds                       |
| `folder-append`   | The folder append prefix used (or 'current directory' if empty)         |

## Example Usage

```yaml
name: Deploy Application

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Export Infisical secrets
        id: infisical
        uses: jeff283/infisical-exports@v1
        with:
          infisical-client-id: ${{ secrets.INFISICAL_CLIENT_ID }}
          infisical-client-secret: ${{ secrets.INFISICAL_CLIENT_SECRET }}
          infisical-project-id: ${{ secrets.INFISICAL_PROJECT_ID }}
          infisical-env-slug: production
          folder-append: "./config"
          create-folders-flag: "true"

      - name: Use secrets
        run: |
          echo "Created ${{ steps.infisical.outputs.total-env-files }} .env files"
          echo "Total secrets: ${{ steps.infisical.outputs.total-secrets }}"
          echo "Duration: ${{ steps.infisical.outputs.duration-ms }}ms"
          # Your deployment commands here
```

## License

See the repository for license information.

## Author

Jeff Njoroge [@jeff283](https://github.com/jeff283)

## Links

- [GitHub Repository](https://github.com/jeff283/infisical-exports)
- [Infisical](https://infisical.com)
- [Bun](https://bun.com)
