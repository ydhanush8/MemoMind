# 🧠 MemoMind

**Never forget what you learn.** MemoMind is an AI-powered learning platform that helps you retain knowledge through smart note-taking, AI analysis, and spaced repetition.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-purple)](https://clerk.com/)

---

## ✨ Features

### 🆓 Free Tier
- **Smart Note-Taking** - Create and organize unlimited learning notes
- **Beautiful UI** - Modern, responsive design with dark theme
- **Secure Storage** - Your notes are safely stored in MongoDB
- **Cross-Device** - Access your notes anywhere

### 💎 Premium Tier (₹99/month or ₹999/year)
- **AI Analysis** - Get instant feedback on your understanding using advanced LLMs
- **Daily Practice** - Spaced repetition flashcards to reinforce learning
- **Progress Tracking** - Monitor your learning journey with statistics
- **Review Challenges** - Daily goals to keep you motivated

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Clerk
- **Database:** MongoDB Atlas with Mongoose
- **Payments:** Razorpay (INR)
- **AI:** OpenRouter API (multiple models)
- **Deployment:** Vercel

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

## 📦 Project Structure

```
MemoMind/
├── app/
│   ├── api/              # API routes
│   │   ├── analyze/      # AI analysis endpoint
│   │   ├── notes/        # CRUD operations for notes
│   │   ├── practice/     # Daily practice endpoints
│   │   └── subscription/ # Payment & subscription management
│   ├── components/       # Reusable React components
│   │   ├── AnalysisResult.tsx
│   │   ├── NoteCard.tsx
│   │   ├── PaywallModal.tsx
│   │   └── PracticeCard.tsx
│   ├── lib/              # Utilities and models
│   │   ├── models/       # Mongoose schemas
│   │   ├── mongodb.ts    # Database connection
│   │   └── types.ts      # TypeScript types
│   ├── new/              # Create note page
│   ├── practice/         # Daily practice page
│   ├── pricing/          # Pricing & payments page
│   ├── sign-in/          # Clerk sign-in
│   ├── sign-up/          # Clerk sign-up
│   ├── welcome/          # Landing page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Dashboard
│   └── globals.css       # Global styles
├── middleware.ts         # Clerk authentication middleware
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── package.json          # Dependencies
```

---

## 🎯 Usage

### Creating a Note
1. Sign up/Sign in using Clerk authentication
2. Click **"New Note"** on the dashboard
3. Enter topic title and your understanding
4. Click **"Save Note"**

### AI Analysis (Premium)
1. Create a note
2. Click **"Analyze with AI"**
3. Get instant feedback on your understanding
4. See accuracy score, correct points, and areas to improve

### Daily Practice (Premium)
1. Go to **"Daily Practice"** from dashboard
2. Review a random note as a flashcard
3. Try to recall the answer
4. Flip the card to reveal
5. Complete daily challenges!

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

4. **Set up Razorpay Webhooks** (Optional)
   - Add webhook URL: `https://yourdomain.vercel.app/api/webhooks/razorpay`
   - Subscribe to: `subscription.activated`, `subscription.cancelled`, `payment.failed`

---

## 🎨 Features in Detail

### Smart Note-Taking
- Create unlimited notes with topic and understanding
- Edit and delete notes anytime
- Mobile-responsive card interface
- Expandable text with "Read more" functionality

### AI Analysis (Premium)
- Powered by OpenRouter's LLMs
- Analyzes your understanding accuracy
- Identifies correct points and gaps
- Provides comprehensive summaries
- Suggests next concepts to learn

### Daily Practice (Premium)
- Spaced repetition algorithm
- Flip card animations
- Daily challenge tracking
- Review statistics
- Progress monitoring

### Payment Integration
- Secure Razorpay integration
- Subscription management
- Auto-renewal handling
- Cancel anytime
- ₹99/month or ₹999/year pricing

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Clerk](https://clerk.com/) - Authentication made easy
- [MongoDB](https://www.mongodb.com/) - Database
- [OpenRouter](https://openrouter.ai/) - AI model access
- [Razorpay](https://razorpay.com/) - Payment gateway
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vercel](https://vercel.com/) - Deployment platform

---

## 📧 Contact

**Developer:** Dhanush Sai Reddy  
**GitHub:** [@ydhanush8](https://github.com/ydhanush8)  
**Project Link:** [https://github.com/ydhanush8/MemoMind](https://github.com/ydhanush8/MemoMind)

---

<div align="center">
  <strong>Built with ❤️ using Next.js and TypeScript</strong>
</div>
