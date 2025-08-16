# 🚀 TapWave Deployment Runbook

## Quick Start Guide (Go Live in Under 1 Hour)

### Prerequisites Checklist
- [ ] Telegram Bot Token: `7762908475:AAEJ-Bf6kGyIl6wuTZptK8n_WJafzjbyJqs`
- [ ] Supabase Account: `https://wqoeqlnlqcoqenhyohyd.supabase.co`
- [ ] Supabase Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] Adsgram Publisher ID (optional for demo)
- [ ] Vercel Account
- [ ] Railway/Render Account

---

## Step 1: Database Setup (5 minutes)

### 1.1 Create Supabase Tables
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project: `wqoeqlnlqcoqenhyohyd`
3. Navigate to **SQL Editor**
4. Copy and paste the entire contents of `database/schema.sql`
5. Click **Run** to execute

### 1.2 Verify Tables Created
Check that these tables exist:
- [ ] `users`
- [ ] `ledger`
- [ ] `tasks`
- [ ] `withdrawals`
- [ ] `ad_events`

---

## Step 2: Frontend Deployment (10 minutes)

### 2.1 Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **New Project**
3. Import your repository
4. Configure environment variables:

```env
TELEGRAM_BOT_TOKEN=7762908475:AAEJ-Bf6kGyIl6wuTZptK8n_WJafzjbyJqs
NEXT_PUBLIC_SUPABASE_URL=https://wqoeqlnlqcoqenhyohyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxb2VxbG5scWNvcWVuaHlvaHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzIzODYsImV4cCI6MjA3MDkwODM4Nn0.Fz7IfJGe_isEe3W1Sy683wzRnmvdzX9rktZJV1qlyWc
NEXT_PUBLIC_ADSGRAM_PUBLISHER_ID=your_publisher_id_here
NEXTAUTH_SECRET=your-random-secret-key-here
ADSGRAM_WEBHOOK_SECRET=your-webhook-secret-here
ADMIN_API_KEY=your-admin-key-here
```

5. Click **Deploy**
6. Note your deployment URL (e.g., `https://tapwave-telegram-miniapp.vercel.app`)

### 2.2 Test Frontend
- [ ] Visit your Vercel URL
- [ ] Should show "This app must be opened through Telegram" (correct behavior)
- [ ] Check API endpoints work: `/api/auth/telegram` should return 401

---

## Step 3: Bot Deployment (15 minutes)

### 3.1 Deploy Bot to Railway
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Set **Root Directory** to `bot`
5. Configure environment variables:

```env
TELEGRAM_BOT_TOKEN=7762908475:AAEJ-Bf6kGyIl6wuTZptK8n_WJafzjbyJqs
WEBAPP_URL=https://your-vercel-url.vercel.app
NODE_ENV=production
WEBHOOK_URL=https://your-railway-url.railway.app
PORT=3000
```

6. Deploy and note your Railway URL

### 3.2 Alternative: Deploy to Render
1. Go to [Render Dashboard](https://render.com/dashboard)
2. Click **New** → **Web Service**
3. Connect your repository
4. Set **Root Directory** to `bot`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `npm start`
7. Add environment variables (same as above)

---

## Step 4: Telegram Bot Configuration (10 minutes)

### 4.1 Configure with BotFather
1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Use your existing bot or create new one
3. Set up WebApp:
   ```
   /setmenubutton
   @your_bot_name
   TapWave - https://your-vercel-url.vercel.app
   ```

4. Set bot commands:
   ```
   /setcommands
   @your_bot_name
   start - Launch TapWave Mini App
   help - Get help and support
   stats - View your statistics
   ```

5. Set bot description:
   ```
   /setdescription
   @your_bot_name
   🌊 TapWave - Earn coins by watching ads and completing tasks! Withdraw as Telegram Stars or TON cryptocurrency.
   ```

### 4.2 Test Bot
- [ ] Message your bot `/start`
- [ ] Should show welcome message with "Launch TapWave" button
- [ ] Click button should open your Mini App
- [ ] App should load without "must be opened through Telegram" error

---

## Step 5: Final Testing (10 minutes)

### 5.1 End-to-End Test
1. **Authentication Test**:
   - [ ] Open bot in Telegram
   - [ ] Click "Launch TapWave"
   - [ ] App should load and show dashboard

2. **API Test**:
   ```bash
   # Test from your local machine
   curl -X POST https://your-vercel-url.vercel.app/api/auth/telegram \
     -H "Content-Type: application/json" \
     -d '{"initData": "test"}'
   # Should return 401 (correct)
   ```

3. **Database Test**:
   - [ ] Check Supabase dashboard for any errors
   - [ ] Verify tables have proper structure

### 5.2 Production Checklist
- [ ] Frontend deployed and accessible
- [ ] Bot deployed and responding
- [ ] Database tables created
- [ ] WebApp configured in Telegram
- [ ] All environment variables set
- [ ] API endpoints returning expected responses
- [ ] No console errors in browser

---

## Step 6: Go Live! (5 minutes)

### 6.1 Announce Your Bot
1. Share your bot link: `https://t.me/your_bot_name`
2. Test with friends and family
3. Monitor logs for any issues

### 6.2 Monitor Performance
- **Vercel**: Check function logs and performance
- **Railway/Render**: Monitor bot uptime and response times
- **Supabase**: Watch database usage and query performance

---

## 🔧 Troubleshooting

### Common Issues

#### "This app must be opened through Telegram"
- ✅ **Expected behavior** when accessing directly in browser
- ❌ **Problem** if shown when opened through Telegram bot
- **Fix**: Check Telegram WebApp configuration with BotFather

#### Database Connection Errors
- Check Supabase URL and anon key
- Verify tables exist (run schema.sql)
- Check RLS policies are enabled

#### Bot Not Responding
- Verify bot token is correct
- Check Railway/Render deployment logs
- Ensure webhook URL is set correctly

#### API 500 Errors
- Check Vercel function logs
- Verify environment variables
- Test database connection

### Debug Commands

```bash
# Test API endpoints
curl -X GET https://your-vercel-url.vercel.app/api/health
curl -X POST https://your-vercel-url.vercel.app/api/auth/telegram -d '{"initData":"test"}'

# Check bot webhook
curl https://api.telegram.org/bot7762908475:AAEJ-Bf6kGyIl6wuTZptK8n_WJafzjbyJqs/getWebhookInfo

# Test database connection (in Supabase SQL Editor)
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM tasks;
```

---

## 📊 Post-Launch Monitoring

### Key Metrics to Track
- **User Registrations**: New users per day
- **Ad Views**: Completed ad views and rewards
- **Withdrawals**: Pending and completed withdrawals
- **API Performance**: Response times and error rates
- **Bot Uptime**: Message delivery and response rates

### Daily Checks
- [ ] Check Vercel deployment status
- [ ] Monitor Railway/Render bot uptime
- [ ] Review Supabase database usage
- [ ] Check for any error logs
- [ ] Verify withdrawal requests are processing

---

## 🎉 Success!

Your TapWave Telegram Mini App is now live and ready to earn revenue through policy-compliant ad monetization!

### Next Steps
1. **Marketing**: Share your bot with target audience
2. **Analytics**: Set up detailed tracking and monitoring
3. **Optimization**: Monitor user behavior and optimize rewards
4. **Scaling**: Plan for increased traffic and database scaling
5. **Features**: Add new tasks, games, and reward mechanisms

### Support
- **Documentation**: See README.md for detailed information
- **Issues**: Create GitHub issues for bugs or feature requests
- **Community**: Join our Telegram group for support

**🚀 Congratulations on launching your Telegram Mini App!**
