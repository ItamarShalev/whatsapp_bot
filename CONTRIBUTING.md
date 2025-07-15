# Contributing to This Project

Thank you for your interest in contributing!

## 📦 Getting Started

1. Fork the repo
2. Clone your fork:

   ```bash
   git clone git@github.com:ItamarShalev/whatsapp_bot.git
   cd whatsapp_bot
   ```

3. Install dependencies cleanly:

   ```bash
   npm ci
   ```

4. Run the dev environment:

   ```bash
   npm run dev
   ```

## 🧪 Running Tests

```bash
npm run test
```

## 🔍 Linting & Formatting

```bash
npm run lint
npm run format
```

## ✅ Commit Conventions

- Use clear, descriptive messages
- Add `Signed-off-by: Your Name <email>`  
  Automatically with:

  ```bash
  git commit -s
  ```

- [ ] My code follows the project style guide
- [ ] I have added or updated tests
- [ ] I have linted and formatted the code
- [ ] Commit title is up to 72 chars length line.
- [ ] My commit is signed-off (`git commit -s`)
- [ ] Commit title format should be `<component>: <sub-component>: <subject>`. Note that the sub-component is optional.

### For Bug Fixes

- [ ] The commit must start with `[BUGFIX]`
- [ ] The commit must end (before the sign-off) with `fixes=<sha1/unknown>`
- [ ] Also `issue=<issue_number/none>`

### Pre-commit Hooks
- Pre-commit hooks are set up to run linting and tests before commits.
- You can install pre-commit by install python and running:

  ```bash
  python -m pip install pre-commit
  ```

  if you want to run it manually, you can run:

  ```bash
  pre-commit run
  ```

  if you want to run it automatically, you can run:

  ```bash
  pre-commit install
  ```

## 🚀 Submitting a Pull Request

1. Create a feature or fix branch:  
   `git checkout -b fix/your-feature-name`
2. Push to your fork
3. Open a PR and follow the template
4. Ensure tests and linter pass

We welcome improvements, fixes, and suggestions!
