# Pomo AI-doro Code Structure Documentation

## Project Overview

Pomo AI-doro is an AI-powered Pomodoro timer application that helps users boost productivity and focus. The application uses Next.js 15 with React 19, TypeScript, and Tailwind CSS for styling.

## Directory Structure

```
pomo-ai-doro/
├── .next/                  # Next.js build output
├── .qodo/                  # Configuration files
├── .ra-aid/                # RA.Aid logs and configuration
├── app/                    # Main application code
│   ├── globals.css         # Global CSS styles
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Home page component
├── node_modules/           # Dependencies
├── .gitattributes          # Git attributes configuration
├── .gitignore              # Git ignore configuration
├── eslint.config.mjs       # ESLint configuration
├── next-env.d.ts           # Next.js TypeScript declarations
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies and scripts
├── pnpm-lock.yaml          # PNPM lock file
├── postcss.config.mjs      # PostCSS configuration
├── README.md               # Project documentation
└── tsconfig.json           # TypeScript configuration
```

## Key Components

### App Structure

The application follows the Next.js App Router structure:

- `app/layout.tsx`: The root layout component that wraps all pages
- `app/page.tsx`: The home page component
- `app/globals.css`: Global CSS styles

### Main Features

Based on the codebase, the application offers (or plans to offer) the following features:

1. **Smart Scheduling**: AI-powered analysis of productivity patterns to suggest optimal work and break intervals
2. **Performance Analytics**: Tracking focus sessions, breaks, and productivity trends
3. **Cross-Device Sync**: Synchronization of sessions across devices
4. **Customizable Timer**: Pomodoro timer with customizable work and break durations

## Technologies Used

- **Frontend Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Package Manager**: PNPM
- **Linting**: ESLint 9

## Fonts

The application uses the following Google Fonts:
- Inter (variable font)
- Poppins (weights: 400, 500, 600, 700)
- JetBrains Mono (for code/monospace text)

## Metadata

The application includes the following metadata:
- **Title**: Pomo AI-doro
- **Description**: "Your intelligent productivity companion - Boost your focus and productivity with AI-powered Pomodoro technique"
- **Theme Color**: #111827
- **OpenGraph**: Configured for social media sharing

## Development

### Scripts

- `dev`: Start development server with Turbopack
- `build`: Build the application
- `start`: Start the production server
- `lint`: Run ESLint

### Dependencies

- React 19.0.0
- React DOM 19.0.0
- Next.js 15.2.2

### Dev Dependencies

- TypeScript
- ESLint
- Tailwind CSS
- Various type definitions

## Future Development

Based on the landing page content, the following features may be planned or in development:

1. **Timer Page**: A dedicated page for the Pomodoro timer functionality
2. **AI Integration**: Further AI capabilities to enhance productivity
3. **User Authentication**: For saving preferences and session data
4. **Analytics Dashboard**: For visualizing productivity metrics

## Styling

The application uses a dark theme with a gradient background and custom animations:
- Background: Gradient from gray-900 to gray-950
- Accent colors: Indigo and purple gradients
- Custom animations: Float and pulse effects
