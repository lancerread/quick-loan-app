# Quick Deployment Guide - Test PayHero STK Push

## Option A: Deploy to Netlify (Recommended for Testing)

### Steps:
1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Add real PayHero M-Pesa STK push integration"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - Click "Deploy"

3. **Add Environment Variables**
   - Go to Site Settings → Build & Deploy → Environment
   - Add these 3 variables:
     - `PAYHERO_API_USERNAME` = your PayHero username
     - `PAYHERO_API_PASSWORD` = your PayHero password
     - `PAYHERO_CHANNEL_ID` = 4049294 (your till number)
   - Save and redeploy

4. **Test the Payment Flow**
   - Your app will be live at: `https://your-site.netlify.app`
   - Click "Apply for a Loan Now"
   - Fill eligibility form
   - Select a loan amount
   - Enter M-Pesa phone number (07... or 01...)
   - Click "Proceed to Payment"
   - M-Pesa STK prompt will appear on your phone
   - Enter M-Pesa PIN to complete payment

---

## Option B: Test Locally with Netlify CLI

### Steps:
1. **Install Netlify CLI** (one time)
   ```bash
   npm install netlify-cli -g
   ```

2. **Add .env file** (if you haven't already)
   ```bash
   cp .env.example .env
   # Edit .env with your PayHero credentials:
   # PAYHERO_API_USERNAME=your_username
   # PAYHERO_API_PASSWORD=your_password
   # PAYHERO_CHANNEL_ID=4049294
   ```

3. **Run with Netlify CLI**
   ```bash
   netlify dev
   ```
   This will start both Vite server AND Netlify Functions locally
   - App runs at: `http://localhost:3000` (or 8888 if port in use)
   - Functions available at: `http://localhost:3000/.netlify/functions/*`

4. **Test the payment flow** (same as above)

---

## Which Option to Choose?

| Option | Speed | Real Testing | Setup |
|--------|-------|--------------|-------|
| **Deploy to Netlify** | 5 minutes | ✅ Full real M-Pesa | Easy |
| **Local netlify dev** | 2 minutes | ✅ Full real M-Pesa | Requires CLI |

**Recommendation**: Deploy to Netlify - it's production-ready and gives you a real test environment!

---

## Troubleshooting

### "Functions not found" error
- You're using `npm run dev` - use `netlify dev` or deploy to Netlify instead

### "PayHero credentials not configured"
- Check environment variables are set correctly
- On Netlify: Site Settings → Environment
- Locally: Check your `.env` file

### M-Pesa STK not appearing
- Verify phone number format: must be `07...` or `01...`
- Ensure till number (4049294) is registered and active on PayHero

### "Invalid request" from PayHero
- Check channel ID is correct: 4049294
- Verify API credentials are active on PayHero
