# Infisical Exports

A GitHub Action that exports Infisical secrets to `.env` files organized by folder paths for use in your GitHub Actions workflows, with automatic cleanup after CI completion.

## Description

This action connects to your Infisical instance and exports secrets from a specified project and environment to `.env` files, organized by their folder paths in Infisical. Secrets are grouped by their folder structure and written to corresponding `.env` files, making them available to your application or subsequent steps in your workflow.

**Why this action exists:** This project was inspired by the challenges of managing secrets in monorepos, particularly when some applications don't have access to inject environment variables using the Infisical CLI or GitHub Actions. This is especially problematic in CI environments where applications only read environment variables from `.env` files and don't check if they're supplied via `process.env`. Cloudflare applications are a common example—they often don't check for injected environment variables and instead try to read `.env` files directly. This action creates those `.env` files for such applications and automatically deletes them after the CI process completes using a post-cleanup step.

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

## Folder Append

The `folder-append` input is particularly useful for monorepos where your Infisical folder structure doesn't mirror your project's folder structure 1-to-1. It allows you to prepend a path prefix to all folder paths when writing `.env` files.

### How it works

- **Empty string (default)**: `.env` files are written relative to the current directory based on Infisical folder paths
- **With prefix**: All folder paths are prepended with the specified prefix

### Monorepo Examples

**Example 1: Apps in `apps/` directory**

If your monorepo structure has apps in `apps/`:
```
monorepo/
  apps/
    api/
    web/
    worker/
```

And your Infisical folders are organized as:
- `/api` → secrets for the API app
- `/web` → secrets for the web app
- `/worker` → secrets for the worker app

Use `folder-append: "apps"` (no trailing slash) to write `.env` files to:
- `apps/api/.env`
- `apps/web/.env`
- `apps/worker/.env`

**Example 2: Nested structure `apps/company/`**

If your apps are nested deeper:
```
monorepo/
  apps/
    company/
      api/
      web/
```

And your Infisical folders are:
- `/api` → secrets for the API app
- `/web` → secrets for the web app

Use `folder-append: "apps/company"` to write `.env` files to:
- `apps/company/api/.env`
- `apps/company/web/.env`

**Example 3: Root-level apps**

If your Infisical folders already match your project structure exactly, you can use an empty string (default) or omit the `folder-append` input entirely.

## Inputs

| Input                     | Description                                                                                                                        | Required | Default                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------- |
| `infisical-client-id`     | The Client ID of the Infisical application                                                                                         | Yes      | -                          |
| `infisical-client-secret` | The Client Secret of the Infisical application                                                                                     | Yes      | -                          |
| `infisical-project-id`    | The ID of the Infisical project                                                                                                    | Yes      | -                          |
| `infisical-domain`        | The domain of the Infisical instance                                                                                               | No       | `https://eu.infisical.com` |
| `infisical-env-slug`      | The Slug of the Infisical environment                                                                                              | No       | `dev`                      |
| `folder-append`           | Optional prefix to prepend to folder paths (empty string uses current directory). See [Folder Append](#folder-append) for details. | No       | `""`                       |
| `create-folders-flag`     | Whether to create folders if they don't exist (`true`/`false`)                                                                     | No       | `false`                    |

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

### Basic Usage

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
        uses: jeff283/infisical-exports@main
        with:
          infisical-client-id: ${{ secrets.INFISICAL_CLIENT_ID }}
          infisical-client-secret: ${{ secrets.INFISICAL_CLIENT_SECRET }}
          infisical-project-id: ${{ secrets.INFISICAL_PROJECT_ID }}
          infisical-env-slug: production

      - name: Use secrets
        run: |
          echo "Created ${{ steps.infisical.outputs.total-env-files }} .env files"
          echo "Total secrets: ${{ steps.infisical.outputs.total-secrets }}"
          echo "Duration: ${{ steps.infisical.outputs.duration-ms }}ms"
          # Your deployment commands here
```

### Monorepo Usage with Folder Append

```yaml
name: Deploy Monorepo Apps

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Export Infisical secrets to apps
        id: infisical
        uses: jeff283/infisical-exports@main
        with:
          infisical-client-id: ${{ secrets.INFISICAL_CLIENT_ID }}
          infisical-client-secret: ${{ secrets.INFISICAL_CLIENT_SECRET }}
          infisical-project-id: ${{ secrets.INFISICAL_PROJECT_ID }}
          infisical-env-slug: production
          folder-append: "apps"
          create-folders-flag: "true"

      - name: Build and deploy apps
        run: |
          # Your apps can now read .env files from their respective directories
          # e.g., apps/api/.env, apps/web/.env
          npm run build
          npm run deploy
      
      # Note: .env files are automatically cleaned up after the job completes
      # via the post-cleanup step defined in action.yml
```

### Cloudflare Workers Example

```yaml
name: Deploy Cloudflare Worker

on:
  push:
    branches: [main]

jobs:
  deploy-worker:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Export Infisical secrets
        uses: jeff283/infisical-exports@main
        with:
          infisical-client-id: ${{ secrets.INFISICAL_CLIENT_ID }}
          infisical-client-secret: ${{ secrets.INFISICAL_CLIENT_SECRET }}
          infisical-project-id: ${{ secrets.INFISICAL_PROJECT_ID }}
          infisical-env-slug: production
          # Cloudflare Workers read .env files from the project root
          folder-append: ""
          create-folders-flag: "false"

      - name: Deploy to Cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          # Worker will read .env file automatically
      
      # .env files are automatically cleaned up after deployment
```

## License

See the repository for license information.

## Author

Jeff Njoroge [@jeff283](https://github.com/jeff283)

## Links

- [GitHub Repository](https://github.com/jeff283/infisical-exports)
- [Infisical](https://infisical.com)
- [Bun](https://bun.com)
