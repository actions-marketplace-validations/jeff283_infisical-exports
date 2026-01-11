# Infisical Exports

A GitHub Action that exports Infisical secrets to environment variables for use in your GitHub Actions workflows.

## Description

This action connects to your Infisical instance and exports secrets from a specified project and environment as environment variables, making them available to subsequent steps in your workflow.

## Installation

To use this action in your workflow, reference it in your workflow file:

```yaml
- uses: jeff283/infisical-exports@v1
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

| Input                     | Description                                    | Required | Default                    |
| ------------------------- | ---------------------------------------------- | -------- | -------------------------- |
| `infisical-client-id`     | The Client ID of the Infisical application     | Yes      | -                          |
| `infisical-client-secret` | The Client Secret of the Infisical application | Yes      | -                          |
| `infisical-project-id`   | The ID of the Infisical project                | Yes      | -                          |
| `infisical-domain`        | The domain of the Infisical instance           | No       | `https://eu.infisical.com` |
| `infisical-env-slug`      | The Slug of the Infisical environment          | No       | `dev`                      |

## Outputs

| Output    | Description                                       |
| --------- | ------------------------------------------------- |
| `secrets` | The secrets exported to the environment variables |

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
        uses: jeff283/infisical-exports@v1
        with:
          infisical-client-id: ${{ secrets.INFISICAL_CLIENT_ID }}
          infisical-client-secret: ${{ secrets.INFISICAL_CLIENT_SECRET }}
          infisical-project-id: ${{ secrets.INFISICAL_PROJECT_ID }}
          infisical-env-slug: production

      - name: Use secrets
        run: |
          echo "API_KEY is now available: $API_KEY"
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
