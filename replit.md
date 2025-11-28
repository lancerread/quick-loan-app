# M-Pesa Loans Application

## Overview
A frontend-only loan application platform integrated with **real M-Pesa payments via PayHero**. The application demonstrates the complete user flow for an M-Pesa instant loan service. Uses Netlify Functions (serverless) for secure PayHero API integration without requiring a backend server.

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
│   │   ├── components/         # UI components (modals, forms, cards, PaymentHandler)
│   │   ├── context/            # React Context (LoanContext for state)
│   │   ├── pages/              # Page components (Home, Eligibility, Apply)
│   │   ├── lib/                # Utility functions
│   │   ├── hooks/              # Custom React hooks
│   │   └── App.tsx             # Main app component with routing
│   ├── index.html              # Entry HTML
│   └── package.json
├── netlify/functions/          # Serverless functions
│   ├── initiate-payment.ts     # Initiates M-Pesa STK push with PayHero
│   ├── check-status.ts         # Polls PayHero for payment status (SUCCESS/QUEUED/FAILED)
│   └── webhook.ts              # Receives PayHero payment callbacks
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

## PayHero Integration - Real M-Pesa STK Push

### API Specifications (From PayHero Documentation)
- **Base URL**: `https://backend.payhero.co.ke/api/v2`
- **Authentication**: Basic Auth (username:password in Authorization header)
- **Endpoints Used**:
  - `POST /payments` - Initiates M-Pesa STK push
  - `POST /transaction-status` - Checks payment status
  - `POST /webhook` - Receives payment callbacks

### Phone Number Format
- **Local format required**: `07...` or `01...` (10 digits total)
  - Examples: `0712345678`, `0112345678`
  - NOT international format (no +254 prefix for STK push)

### Payment Status Values
- `QUEUED` - Payment initiated, waiting for M-Pesa PIN entry
- `SUCCESS` - Payment completed, M-Pesa receipt received
- `FAILED` - Payment failed (user cancelled, insufficient funds, etc.)

### Required Environment Variables
Set these in Netlify or `.env` for local development:
- `PAYHERO_API_USERNAME` - Your PayHero API username
- `PAYHERO_API_PASSWORD` - Your PayHero API password
- `PAYHERO_CHANNEL_ID` - Your registered PayHero payment channel ID (Till/Paybill)

### Payment Flow
1. User fills eligibility form and enters phone number
2. Selects loan amount (with processing fee)
3. Clicks "Proceed to Payment"
4. Frontend validates phone format (07... or 01...)
5. `initiate-payment.ts` calls PayHero API with:
   - Phone number (local format)
   - Amount (processing fee in KSh)
   - Channel ID (registered Till/Paybill)
   - External reference for tracking
   - Callback URL for webhook notifications
6. M-Pesa STK push prompt appears on user's phone
7. User enters M-Pesa PIN to charge processing fee
8. `check-status.ts` polls PayHero every 5 seconds (max 2 minutes):
   - Returns status: SUCCESS, QUEUED, or FAILED
   - Includes M-Pesa receipt number on success
9. On success: Show success modal with M-Pesa receipt
10. On failure: Show error modal allowing retry
11. `webhook.ts` receives final payment confirmation from PayHero

### Polling Behavior
- **Interval**: 5 seconds
- **Duration**: 2 minutes maximum (24 polls)
- **Logic**: 
  - If status = SUCCESS → Payment complete, show success modal
  - If status = FAILED → Show error modal
  - If status = QUEUED after timeout → Show "payment pending" message
  - On error during polling → Retry poll (max 24 attempts)

### Error Handling
- **Phone validation**: Rejects non-07/01 formats before making API calls
- **API errors**: Returns user-friendly messages (e.g., "Payment could not be initiated. Please check your phone number and try again.")
- **Retry logic**: Allows immediate retry for client-side errors, 30s delay for server errors
- **Rate limiting**: Prevents rapid consecutive attempts (5s minimum between attempts)

### Webhooks
- `webhook.ts` receives POST callbacks from PayHero when payments complete
- Payload includes: `external_reference`, `status`, `mpesa_receipt_number`, `amount`, `phone_number`
- Webhook returns 200 OK immediately (async processing)
- In production: Store webhook data in database for audit/reconciliation

## Loan Options
Processing fees vary by loan amount:
- KSh 5,500 loan → KSh 50 fee
- KSh 10,000 loan → KSh 140 fee
- KSh 60,600 loan → KSh 2,000 fee
- **Total repayment** = Loan amount + Processing fee

## Development Setup

### Local Testing
```bash
# 1. Install dependencies
npm install

# 2. Create .env file with PayHero credentials
cp .env.example .env
# Edit .env with your PayHero credentials

# 3. Start development server
npm run dev
# App runs on http://localhost:5000
```

### Testing with Real PayHero (Optional)
```bash
# Install Netlify CLI for local function testing
npm install netlify-cli -g

# Start dev server with Netlify Functions support
netlify dev
# Functions available at /.netlify/functions/*
```

## Deployment to Netlify

### Prerequisites
1. PayHero account with API credentials: https://app.payhero.co.ke
2. Registered payment channel (Till/Paybill) with PayHero
3. GitHub repository with this code

### Deployment Steps
1. Push code to GitHub repository
2. Connect repository to Netlify:
   - Go to netlify.com → "Add new site" → "Import an existing project"
   - Select your GitHub repo
3. Set environment variables:
   - Go to Site Settings → Build & Deploy → Environment
   - Add 3 environment variables:
     - `PAYHERO_API_USERNAME`
     - `PAYHERO_API_PASSWORD`
     - `PAYHERO_CHANNEL_ID`
4. Deploy! Netlify automatically builds and deploys

### Production Checklist
- [ ] Switch PayHero credentials to production (from sandbox if testing)
- [ ] Configure Till/Paybill number with PayHero
- [ ] Test payment flow with small amounts
- [ ] Enable HTTPS (Netlify provides free SSL)
- [ ] Set up payment receipt confirmation (email/SMS)
- [ ] Monitor webhook deliveries for payment confirmations

## API Endpoints Summary

### Frontend → Netlify Functions
| Function | Method | Path | Purpose |
|----------|--------|------|---------|
| initiate-payment.ts | POST | `/.netlify/functions/initiate-payment` | Initiate M-Pesa STK push |
| check-status.ts | POST | `/.netlify/functions/check-status` | Poll payment status |
| webhook.ts | POST | `/.netlify/functions/webhook` | Receive PayHero callbacks |

### Netlify Functions → PayHero API
| Endpoint | Method | PayHero URL |
|----------|--------|-------------|
| Initiate Payment | POST | `https://backend.payhero.co.ke/api/v2/payments` |
| Check Status | POST | `https://backend.payhero.co.ke/api/v2/transaction-status` |

## Recent Changes
- **Nov 28**: Implemented real PayHero M-Pesa STK push integration
  - Updated phone validation to accept local format (07..., 01...)
  - Implemented proper PayHero API endpoint structure
  - Added webhook endpoint for payment callbacks
  - Fixed status polling with correct status values (SUCCESS, QUEUED, FAILED)
  - Added rate limiting and error handling
  - Updated documentation with PayHero specifications

## Design Features
- Clean, modern UI with Tailwind CSS
- Responsive design (mobile-first)
- Dark mode support with theme toggle
- Clear visual hierarchy for loan amounts and fees
- Form validation with helpful error messages
- Real-time payment status feedback during STK push
- Success modal with M-Pesa receipt number
- Failure modal with retry option
- Accessible inputs and buttons

## Security Features
- ✅ API credentials stored in Netlify environment variables (never in frontend code)
- ✅ CORS headers on Netlify Functions
- ✅ Phone number validation before API calls
- ✅ Rate limiting on payment attempts (5s minimum between attempts)
- ✅ Generic error messages shown to users (raw errors only logged)
- ✅ Webhook signature verification ready (configure with PayHero if provided)

## Notes
- **Production-ready**: Uses real PayHero API (sandbox or production credentials)
- **No database needed**: All state managed client-side with React Context
- **Netlify Functions are free**: Included with every Netlify deployment
- **Scalable**: Serverless functions auto-scale with traffic
- **Secure**: API credentials never exposed to frontend
- **Reliable**: Webhook callbacks ensure payment confirmation even if polling times out

## Troubleshooting

### Payment Not Initiating
- Check phone number format (must be 07... or 01..., not +254...)
- Verify PayHero credentials are set correctly on Netlify
- Check PayHero channel ID is registered and active

### Payments Timing Out (2 minute limit)
- This is normal for slow M-Pesa responses
- User should check manual payment status via PayHero dashboard
- Webhook callback will send final confirmation

### Testing with Real M-Pesa
- Test with small amounts (KSh 50-100)
- Verify M-Pesa number matches PayHero account phone
- Check M-Pesa transaction history for STK push attempts

## Support
For PayHero API issues, refer to: https://app.payhero.co.ke/docs
For Netlify deployment help, refer to: https://docs.netlify.com
