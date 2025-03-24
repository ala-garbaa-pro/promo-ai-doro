# Pomo AI-doro

Your intelligent productivity companion - Boost your focus and productivity with AI-powered Pomodoro technique.

## Features

### Task Management

- Create, edit, and delete tasks
- Organize tasks by priority, status, and category
- Drag and drop task reordering
- Task templates for recurring workflows
- Drag and drop template item management
- Task dependencies and subtasks

### Pomodoro Timer

- Customizable work and break durations
- Auto-start options for sessions
- Sound notifications and visual cues
- Focus mode to minimize distractions

### Analytics

- Track productivity metrics
- Visualize focus patterns
- AI-powered insights
- Exportable reports

### Mobile and Offline Support

- Progressive Web App (PWA) functionality
- Offline data synchronization with IndexedDB
- Offline status indicator
- Mobile-optimized interface
- Offline fallback page

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pomo-ai-doro.git

# Navigate to the project directory
cd pomo-ai-doro

# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

### Database Migrations

```bash
# Run the task order migration
pnpm migrate:task-order
```

### Testing

Pomo AI-doro uses a comprehensive testing strategy with multiple testing frameworks:

```bash
# Jest tests
pnpm test                # Run all Jest tests
pnpm test:watch          # Run Jest tests in watch mode
pnpm test:coverage       # Run Jest tests with coverage report

# Vitest tests
pnpm test:vitest         # Run all Vitest tests
pnpm test:vitest:watch   # Run Vitest tests in watch mode
pnpm test:vitest:coverage # Run Vitest tests with coverage report

# Playwright tests
pnpm test:playwright     # Run all Playwright tests
pnpm test:playwright:ui  # Run Playwright tests with UI

# Cypress tests
pnpm cypress             # Open Cypress test runner
pnpm test:e2e            # Run Cypress E2E tests
pnpm test:e2e:headless   # Run Cypress E2E tests headlessly

# Run all tests
pnpm test:all            # Run all tests (Jest, Vitest, Playwright)
```

For more details on our testing strategy, see [\_planning/test-strategy.md](./_planning/test-strategy.md).
