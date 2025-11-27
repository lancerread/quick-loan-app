# M-Pesa Loans Application

## Overview
A frontend-only loan application platform integrated with **real M-Pesa payments via PayHero**. The application demonstrates the complete user flow for an M-Pesa instant loan service. Uses Netlify Functions for secure backend API calls.

## Architecture
- **Frontend**: React with TypeScript, Vite development server
- **Backend**: Netlify Functions (serverless) for PayHero API integration
- **Deployment**: Netlify (static frontend + serverless functions)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: wouter (lightweight routing library)
- **State Management**: React Context for loan data
- **Payment**: Real M-Pesa STK push via PayHero API

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
├── netlify/functions/          # Serverless functions
│   ├── initiate-payment.ts     # STK push initiation
│   └── check-status.ts         # Payment status polling
├── public/                      # Static assets
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # Tailwind CSS config
├── netlify.toml                # Netlify configuration with functions
└── replit.md                   # This file
```

## Pages
- `/` - Home page with hero section showcasing loan features
- `/eligibility` - User eligibility form (name, phone, ID, loan type)
- `/apply` - Loan selection grid and confirmation flow

## PayHero Integration (Real M-Pesa)
The app uses **real M-Pesa integration** through PayHero:

### Required Environment Variables
Set these on Netlify (or in `.env` for local development):
- `PAYHERO_API_USERNAME` - PayHero API username
- `PAYHERO_API_PASSWORD` - PayHero API password
- `PAYHERO_ACCOUNT_ID` - Your PayHero account ID

### Payment Flow
1. User selects loan amount and processing fee
2. Enters M-Pesa phone number
3. Netlify Function calls PayHero API to initiate STK push
4. M-Pesa STK prompt appears on user's phone
5. User enters M-Pesa PIN to charge the processing fee
6. Function polls PayHero for payment confirmation (every 5 seconds, up to 2 minutes)
7. Success modal shows payment completed
8. On failure, error modal allows retry

## Netlify Functions
Two serverless functions handle the PayHero API calls:
- **`initiate-payment.ts`** - Initiates M-Pesa STK push for processing fee
- **`check-status.ts`** - Polls PayHero to check payment status

Functions are called from the frontend at `/.netlify/functions/initiate-payment` and `/.netlify/functions/check-status`

## Loan Options
Processing fees vary by loan amount:
- KSh 5,500 loan → KSh 50 fee
- KSh 10,000 loan → KSh 140 fee
- KSh 60,600 loan → KSh 2,000 fee
- Total repayment includes both loan and fee

## Development
- Run `npm run dev` to start Vite dev server on port 5000
- App runs on `http://localhost:5000`
- Netlify Functions run locally through Netlify CLI (optional)

To test with real PayHero on local:
```bash
npm install netlify-cli -g
netlify dev
```

## Deployment to Netlify
1. Push code to GitHub
2. Connect repository to Netlify
3. Set environment variables on Netlify dashboard:
   - `PAYHERO_API_USERNAME`
   - `PAYHERO_API_PASSWORD`
   - `PAYHERO_ACCOUNT_ID`
4. Deploy!

## Recent Changes
- **Nov 27**: Implemented real PayHero M-Pesa integration
- Removed simulation, using actual STK push
- Added Netlify Functions for secure API communication
- Kept frontend-only for Netlify deployment
- Updated payment flow to use real PayHero API
- Added payment status polling (5s intervals, 2 minute timeout)

## Design Features
- Clean, modern UI with Tailwind CSS
- Responsive design (mobile-first)
- Dark mode support
- Clear visual hierarchy for loan amounts and fees
- Accessible form inputs with validation
- Real-time payment status feedback
- Success/failure modals with error details

## Notes
- This app uses **real M-Pesa integration** via PayHero
- No database needed - all state managed client-side
- Netlify Functions are included free with Netlify deployment
- Uses PayHero sandbox API for testing (change to production when ready)
- Payment status polling is automatic - user doesn't need to refresh
