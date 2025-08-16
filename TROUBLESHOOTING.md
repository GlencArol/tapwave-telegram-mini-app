# 🔧 TapWave Troubleshooting Guide

## Common Deployment Issues & Solutions

### 1. **Vercel Deployment Errors**

#### ❌ Error: "404 Page Not Found" on Vercel
**Solution:** 
1. **Test the deployment first:** Visit `https://your-app.vercel.app/test`
   - If this works, your deployment is successful
   - The main page requires Telegram WebApp context

2. **Check build logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on latest deployment → View Function Logs
   - Look for any build errors

3. **Verify environment variables:**
   - Go to Settings → Environment Variables
   - Ensure all variables are set correctly
   - Redeploy after adding variables

4. **Force redeploy:**
   ```bash
   git commit --allow-empty -m "Force redeploy"
   git push
   ```

#### ❌ Error: "functions property cannot be used with builds property"
**Solution:** ✅ Fixed! Updated `vercel.json` to remove conflicting properties.

#### ❌ Error: "Environment variables not found"
**Solution:** 
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable manually:
   - Name: `TELEGRAM_BOT_TOKEN`
   - Value: `7762908475:AAEJ-Bf6kGyIl6wuTZptK8n_WJafzjbyJqs`
   - Repeat for all variables in the table

#### ❌ Error: "Build failed - Module not found"
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### ❌ Error: "This app must be opened through Telegram"
**This is expected behavior!** The main page only works in Telegram WebApp context.
- Test page: `https://your-app.vercel.app/test` (should work in browser)
- Main app: Only works when opened through Telegram bot

### 2. **Database Connection Issues**

#### ❌ Error: "Could not find table 'users'"
**Solution:**
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Copy and paste entire `database/schema.sql` content
4. Click **Run**

#### ❌ Error: "Invalid API key"
**Solution:**
1. Check Supabase project settings
2. Copy the correct **anon/public** key (not service_role key)
3. Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` in environment variables

### 3. **Telegram Bot Issues**

#### ❌ Error: "Bot not responding"
**Solution:**
1. Check bot token is correct: `7762908475:AAEJ-Bf6kGyIl6wuTZptK8n_WJafzjbyJqs`
2. Test bot manually: Send `/start` to your bot
3. Check Railway/Render deployment logs

#### ❌ Error: "WebApp not opening"
**Solution:**
1. Message @BotFather
2. Use command: `/setmenubutton`
3. Set WebApp URL to your Vercel deployment URL

### 4. **API Endpoint Issues**

#### ❌ Error: "401 Unauthorized" (Expected for invalid data)
**This is correct behavior!** The API should reject invalid Telegram data.

#### ❌ Error: "500 Internal Server Error"
**Solution:**
1. Check Vercel function logs
2. Verify all environment variables are set
3. Test database connection in Supabase

### 5. **Local Development Issues**

#### ❌ Error: "Port 8000 already in use"
**Solution:**
```bash
# Kill process on port 8000
fuser -k 8000/tcp
# Or use different port
PORT=3001 npm run dev
```

#### ❌ Error: "Module not found: @/lib/..."
**Solution:**
Check `tsconfig.json` has correct path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 🚀 Quick Fixes

### Reset Everything
```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Restart dev server
npm run dev

# 3. Test API
curl -X POST http://localhost:8000/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData": "test"}'
# Should return 401 (correct)
```

### Verify Environment Variables
```bash
# Check if .env.local exists and has all variables
cat .env.local | grep -E "(TELEGRAM_BOT_TOKEN|SUPABASE_URL|NEXTAUTH_SECRET)"
```

### Test Database Connection
```sql
-- Run in Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
-- Should show: users, ledger, tasks, withdrawals, ad_events
```

## 📞 Getting Help

### Check Logs
- **Vercel:** Dashboard → Functions → View Logs
- **Railway:** Dashboard → Deployments → Logs  
- **Supabase:** Dashboard → Logs

### Test Commands
```bash
# Test Telegram bot
curl "https://api.telegram.org/bot7762908475:AAEJ-Bf6kGyIl6wuTZptK8n_WJafzjbyJqs/getMe"

# Test Vercel deployment
curl "https://your-app.vercel.app/api/auth/telegram" -X POST -d '{"initData":"test"}'

# Test database
# (Use Supabase SQL Editor)
SELECT COUNT(*) FROM users;
```

### Common Status Codes
- **200:** ✅ Success
- **401:** ✅ Unauthorized (expected for invalid Telegram data)
- **404:** ❌ Endpoint not found (check URL)
- **500:** ❌ Server error (check logs and environment variables)

## 🎯 Success Checklist

- [ ] Vercel deployment successful
- [ ] All environment variables set
- [ ] Database tables created
- [ ] Bot responds to `/start`
- [ ] WebApp opens from Telegram
- [ ] API returns 401 for invalid data (correct)
- [ ] No console errors in browser

**If all checked ✅ - You're ready to go live! 🚀**
