# Contributing to NUKU-API (formerly PNGX-API)

First off, thank you for considering contributing to NUKU-API! It's people like you that make NUKU-API such a great tool for the community.

## Where to Start?

1. **Bug Reports & Feature Requests:** Please use the [GitHub Issue Tracker](https://github.com/chrisaugu/pngx-api/issues) to report bugs or request new features.
2. **Discussions:** Feel free to open a discussion or an issue if you're unsure about a feature or want feedback before starting to code.

## Development Environment Setup

To set up the project locally for development, follow these steps:

### Prerequisites

* [Node.js](https://nodejs.org/) (version 22 or higher recommended)
* [MongoDB](https://www.mongodb.com/) (running locally or a remote URI)

### Installation

1. **Fork the repository** to your own GitHub account and then clone it to your local device:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pngx-api.git
   cd pngx-api
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up Environment Variables**:
   Copy `.env.example` to `.env` and fill in the required variables (especially your MongoDB URI).
   ```bash
   cp .env.example .env
   ```

### Running the App Locally

To start the server in development mode:

```bash
npm start
```

### Running Tests

We value testing. Please ensure your changes are covered by tests or that all existing tests pass before submitting a PR.
To run the test suite:

```bash
npm test
```

## Pull Request Process

1. Create a descriptive branch name (`feature/my-new-feature` or `bugfix/issue-123`).
2. Implement your changes and add relevant tests.
3. Ensure your code passes linting:
   ```bash
   npm run lint
   ```
4. Update any relevant documentation (e.g., `README.md`, `docs/README.md`, or OpenAPI specs).
5. Open a Pull Request on GitHub. Be sure to fill out the PR template describing **What**, **Why**, and **How**.
6. A maintainer will review your PR. We may request changes, but we're happy to help you get it merged!

## Code Style

This project uses `eslint` and `prettier` to maintain a consistent coding style.
Before committing your code, you can run linting to ensure everything is nicely formatted.

## Security

If you discover any security-related issues, please do NOT open a public issue. Check the [SECURITY.md](SECURITY.md) guidelines for how to report them securely.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

Happy coding! 🚀
