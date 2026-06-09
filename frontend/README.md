# MultiTurn AI Chatbot - Frontend

## Overview

Next.js 16.2.6 frontend for the MultiTurn AI Chatbot project. This is a modern, full-stack chat interface powered by Llama 3 and other AI models.

## Tech Stack

- **Framework**: Next.js 16.2.6 (App Router)
- **UI Library**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS v3
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **State Management**: React Context + Hooks
- **Form Handling**: React Hook Form + Zod
- **Notifications**: Sonner
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (chat)/            # Protected chat routes
│   ├── api/               # API route handlers
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home redirect
│   └── loading.tsx        # Loading UI
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (shadcn)
│   ├── chat/             # Chat-specific components
│   ├── auth/             # Auth components
│   ├── sidebar/          # Chat history sidebar
│   └── workspace/        # Settings and workspace components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client setup
│   ├── utils.ts          # Helper utilities
│   ├── ai-providers.ts   # AI provider configs
│   └── validators.ts     # Zod validation schemas
├── context/              # React Context providers
├── types/                # TypeScript type definitions
├── db/                   # Database configurations
├── styles/               # Global CSS styles
├── public/               # Static assets
├── middleware.ts         # Auth middleware
├── tsconfig.json         # TypeScript config
├── tailwind.config.ts    # Tailwind CSS config
├── postcss.config.js     # PostCSS config
├── next.config.ts        # Next.js config
├── package.json          # Dependencies
└── .env.example          # Environment template
```

## Development Phases

### Phase 1: Project Structure (Current)
- Next.js 16.2.6 project scaffolding
- Configuration files setup
- Folder structure creation
- TypeScript and Tailwind CSS setup

### Phase 2: Authentication
- [ ] Supabase Auth integration
- [ ] Login/Signup forms
- [ ] Auth middleware
- [ ] Protected routes

### Phase 3: Chat Interface
- [ ] Chat components (message display, input)
- [ ] Conversation management
- [ ] Message streaming
- [ ] Sidebar with chat history

### Phase 4: AI Integration
- [ ] OpenAI API integration
- [ ] Llama 3 support
- [ ] Anthropic Claude support
- [ ] Provider configuration

### Phase 5: Advanced Features
- [ ] File upload (PDF, docs)
- [ ] Conversation search
- [ ] Export conversations
- [ ] User preferences

### Phase 6: Backend Integration
- [ ] Connect to FastAPI backend
- [ ] Message queue integration
- [ ] WebSocket support

### Phase 7: Deployment
- [ ] Production build optimization
- [ ] Environment configuration
- [ ] CI/CD pipeline

### Phase 8: Monitoring & Polish
- [ ] Error handling
- [ ] Analytics
- [ ] Performance optimization
- [ ] User testing

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your configuration:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format:write` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

Guidelines for contributing to this project:

1. Create a new branch for each feature
2. Follow the project structure conventions
3. Write clean, well-documented code
4. Add tests for new functionality
5. Submit a pull request with a clear description

## License

See LICENSE file in the project root.

## Support

For issues and questions, please refer to the main project documentation.
