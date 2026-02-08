# Jobly Frontend

Ứng dụng frontend ReactJS cho nền tảng tuyển dụng Jobly.vn

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v7** - Routing
- **TailwindCSS** - Styling với dark mode
- **Zustand** - State management
- **React Query** - Server state management
- **Axios** - HTTP client
- **Socket.io-client** - WebSocket client
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **MSW** - API mocking
- **fast-check** - Property-based testing

## Setup

1. Cài đặt dependencies:
```bash
npm install
```

2. Copy file .env.example thành .env:
```bash
cp .env.example .env
```

3. Chạy development server:
```bash
npm run dev
```

Ứng dụng sẽ chạy tại http://localhost:3000

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Chạy ESLint
- `npm test` - Chạy tests
- `npm run test:ui` - Chạy tests với UI
- `npm run test:coverage` - Chạy tests với coverage report

## Cấu trúc Thư mục

```
src/
├── components/       # Reusable UI components
│   ├── common/      # Button, Input, Modal, etc.
│   ├── forms/       # Form components
│   ├── layout/      # Header, Footer, Sidebar
│   └── features/    # Feature-specific components
├── pages/           # Page components
├── layouts/         # Layout wrappers
├── hooks/           # Custom React hooks
├── services/        # API service layer
├── store/           # Zustand stores
├── utils/           # Utility functions
├── types/           # TypeScript types
├── constants/       # Constants và configs
├── assets/          # Static assets
└── test/            # Test utilities
```

## Testing

### Unit Tests
```bash
npm test
```

### Property-Based Tests
Sử dụng fast-check với 100 iterations mỗi property test.

### Coverage
```bash
npm run test:coverage
```

## Cấu hình

- **TypeScript**: Strict mode enabled
- **TailwindCSS**: Dark mode với class strategy
- **Path Alias**: `@/` maps to `src/`
- **API Proxy**: `/api` proxies to backend server

## Requirements

- Node.js >= 18
- npm >= 9
