# M-Pesa Loans Application

## Overview
A frontend-only demo loan application platform that allows users to check eligibility, select loan amounts, and simulate M-Pesa payment processing. The application demonstrates the complete user flow for an M-Pesa instant loan service with client-side payment simulation.

## Architecture
- **Frontend**: React with TypeScript, Vite development server
- **Deployment**: Netlify (static frontend-only deployment)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: wouter (lightweight routing library)
- **State Management**: React Context for loan data
- **Payment**: Client-side simulated M-Pesa STK push (demo only)

## Project Structure
```
├── client/                      # Frontend application
│   ├── src/
│   │   ├── components/         # UI components (modals, forms, cards)
│   │   ├── context/            # React Context (LoanContext for state)
│   │   ├── pages/              # Page components (Home, Eligibility, Apply)
│   │   ├── lib/                # Utility functions
│   │   ├── hooks/              # Custom React hooks
│   │   └── App.tsx             # Main app component with routing
│   ├── index.html              # Entry HTML
│   └── package.json
├── public/                      # Static assets
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # Tailwind CSS config
├── netlify.toml                # Netlify deployment config
└── replit.md                   # This file
```

## Pages
- `/` - Home page with hero section showcasing loan features
- `/eligibility` - User eligibility form (name, phone, ID, loan type)
- `/apply` - Loan selection grid and confirmation flow

## Payment Flow
The app simulates M-Pesa payment processing:
1. User selects loan amount and processing fee
2. Enters M-Pesa phone number to receive STK push
3. STK prompt charges the **processing fee** from user's M-Pesa account
4. Upon successful payment:
   - Processing fee is deducted from user's M-Pesa
   - User receives approval for the loan amount
   - Full repayment amount shown (loan + fee)
5. Failed payment returns error modal with retry option

## Loan Options
Processing fees vary by loan amount (example):
- KSh 5,500 loan → KSh 50 fee
- KSh 10,000 loan → KSh 140 fee
- KSh 60,600 loan → KSh 2,000 fee
- Total repayment includes both loan and fee

## Development
- Run `npm run dev` to start Vite dev server on port 5000
- App runs on `http://localhost:5000`
- Frontend serves as a demo with client-side payment simulation

## Deployment (Netlify)
- Build command: `npm run build`
- Publish directory: `dist`
- Configuration: `netlify.toml` (already set up)
- Ready to deploy as static site

## Recent Changes
- **Nov 27**: Migrated from Lovable to Replit (frontend-only)
- Removed Express backend entirely
- Implemented client-side payment simulation for demo
- Updated payment flow to charge processing fee (not disburse loan)
- Configured for Netlify static deployment
- Updated UI to clearly show what gets charged vs. approved

## Design Features
- Clean, modern UI with Tailwind CSS
- Responsive design (mobile-first)
- Dark mode support
- Clear visual hierarchy for loan amounts and fees
- Accessible form inputs with validation
- Success/failure modals for payment feedback

## Notes
- This is a **demo application** - payment processing is simulated client-side
- No backend API calls or real M-Pesa integration
- All data stored in React Context (no persistence)
- Ready to deploy to Netlify as a static frontend application
