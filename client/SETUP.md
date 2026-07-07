# 🛠️ Developer Setup Guide

This guide is for developers who want to run MemoMind locally or contribute to the project.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB Atlas account
- Clerk account
- OpenRouter API key
- Razorpay account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ydhanush8/MemoMind.git
   cd MemoMind
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx

   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/memomind

   # OpenRouter AI
   OPENROUTER_API_KEY=sk-or-v1-xxxxx

   # Razorpay (Optional - for premium features)
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   RAZORPAY_PLAN_ID_MONTHLY=plan_xxxxx
   RAZORPAY_PLAN_ID_YEARLY=plan_xxxxx
   ```

4. **Run the development server**
   ```bash
   pnpm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | ✅ Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | ✅ Yes |
| `MONGODB_URI` | MongoDB connection string | ✅ Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI features | ✅ Yes |
| `RAZORPAY_KEY_ID` | Razorpay key ID | ⚠️ Premium only |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | ⚠️ Premium only |
| `RAZORPAY_PLAN_ID_MONTHLY` | Monthly subscription plan ID | ⚠️ Premium only |
| `RAZORPAY_PLAN_ID_YEARLY` | Yearly subscription plan ID | ⚠️ Premium only |

### Getting API Keys

#### Clerk (Authentication)
1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your API keys from the dashboard

#### MongoDB Atlas
1. Sign up at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace `<password>` and `<database>` in the URI

#### OpenRouter (AI)
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Add credits to your account
3. Generate an API key

#### Razorpay (Payments)
1. Sign up at [razorpay.com](https://razorpay.com)
2. Get your test API keys
3. Create subscription plans for monthly (₹99) and yearly (₹999)
4. Copy the plan IDs

---

## 📦 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Clerk
- **Database:** MongoDB Atlas with Mongoose
- **Payments:** Razorpay (INR)
- **AI:** OpenRouter API (multiple models)
- **Deployment:** Vercel

---

## 📂 Project Structure

```
MemoMind/
├── app/
│   ├── api/              # API routes
│   │   ├── analyze/      # AI analysis endpoint
│   │   ├── notes/        # CRUD operations for notes
│   │   ├── practice/     # Daily practice endpoints
│   │   └── subscription/ # Payment & subscription management
│   ├── components/       # Reusable React components
│   ├── lib/              # Utilities and models
│   ├── new/              # Create note page
│   ├── practice/         # Daily practice page
│   ├── pricing/          # Pricing & payments page
│   ├── welcome/          # Landing page
│   └── page.tsx          # Dashboard
├── middleware.ts         # Clerk authentication middleware
├── next.config.mjs       # Next.js configuration
└── tailwind.config.ts    # Tailwind CSS configuration
```

---

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add all environment variables
   - Deploy!

3. **Update Clerk URLs**
   - Add your Vercel domain to Clerk's allowed domains
   - Update redirect URLs in Clerk dashboard

---

## 🧪 Testing

### Local Testing
```bash
# Run development server
pnpm run dev

# Build for production
pnpm run build

# Run production build
pnpm start
```

### Test Cards (Razorpay)
- **Card Number:** 4111 1111 1111 1111
- **Expiry:** Any future date
- **CVV:** Any 3 digits
- **OTP:** 1234

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

MIT License - free to use and modify

---

## 📧 Support

**Developer Issues:** [GitHub Issues](https://github.com/ydhanush8/MemoMind/issues)  
**Questions:** dhanushsaireddy@gmail.com
