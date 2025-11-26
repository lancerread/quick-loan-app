# M-Pesa Loans Application

## Overview
A loan application platform that allows users to apply for M-Pesa loans with instant approval. The application features a clean UI for checking eligibility, selecting loan amounts, and processing payments through PayHero.

## Architecture
- **Frontend**: React with TypeScript, using Vite for development
- **Backend**: Express.js server
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: wouter (lightweight routing library)
- **State Management**: React Context for loan data

## Project Structure
```
├── client/                 # Frontend code
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── context/       # React contexts (LoanContext)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── pages/         # Page components
│   └── index.html
├── server/                 # Backend code
│   ├── index.ts           # Express server entry
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage layer
│   └── vite.ts            # Vite integration
├── shared/                 # Shared types and schemas
│   └── schema.ts
└── .env.example           # Environment variable template
```

## Pages
- `/` - Home page with hero section and features
- `/eligibility` - User eligibility form
- `/apply` - Loan selection and application

## PayHero Integration
The application is designed to integrate with PayHero for M-Pesa payments. Environment variables needed:
- `PAYHERO_API_URL` - API endpoint
- `PAYHERO_BASIC_AUTH` - Authentication token
- `PAYHERO_CHANNEL_ID` - Channel identifier
- `PAYHERO_CALLBACK_URL` - Webhook URL
- `PAYHERO_NETWORK_CODE` - M-Pesa network code

## Development
- Run `npm run dev` to start the development server on port 5000
- The Express server serves both the API and the Vite-powered frontend

## Recent Changes
- Migrated from Lovable to Replit fullstack_js template
- Converted from react-router-dom to wouter
- Set up Express backend with in-memory storage
- Created API routes for loan applications
