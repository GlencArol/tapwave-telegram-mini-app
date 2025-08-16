const { Telegraf } = require('telegraf');
const express = require('express');

// Bot configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7762908475:AAEJ-Bf6kGyIl6wuTZptK8n_WJafzjbyJqs';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-domain.vercel.app';
const PORT = process.env.PORT || 3001;

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Initialize Express server for webhooks
const app = express();
app.use(express.json());

// Bot commands
bot.start(async (ctx) => {
  try {
    const user = ctx.from;
    const startParam = ctx.startPayload; // For referral tracking
    
    console.log(`User ${user.id} (${user.first_name}) started the bot`);
    
    // Check if this is a referral
    let referralMessage = '';
    if (startParam && startParam.startsWith('ref')) {
      const referrerId = startParam.replace('ref', '');
      referralMessage = `\n\n🎁 You were invited by a friend! You'll both receive bonus coins when you start earning.`;
      
      // Track referral (you could make an API call to your backend here)
      console.log(`Referral detected: User ${user.id} referred by ${referrerId}`);
    }
    
    const welcomeMessage = `🌊 Welcome to TapWave, ${user.first_name}!

💰 Earn coins by:
• Watching advertisements
• Completing daily tasks
• Referring friends
• Daily check-ins

🎯 Your coins can be withdrawn as:
• Telegram Stars ⭐
• TON cryptocurrency 💎
• USDT (coming soon) 💰

Ready to start earning?${referralMessage}`;

    // Create inline keyboard with WebApp button
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '🚀 Launch TapWave',
            web_app: { url: WEBAPP_URL }
          }
        ],
        [
          {
            text: '📊 My Stats',
            callback_data: 'stats'
          },
          {
            text: '👥 Invite Friends',
            callback_data: 'referral'
          }
        ],
        [
          {
            text: '❓ Help',
            callback_data: 'help'
          }
        ]
      ]
    };

    await ctx.reply(welcomeMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Error in start command:', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
});

// Help command
bot.help(async (ctx) => {
  const helpMessage = `🆘 <b>TapWave Help</b>

<b>How to earn coins:</b>
• 📺 Watch ads: 10 coins per ad
• ✅ Complete tasks: 25-200 coins
• 👥 Refer friends: 100 coins per referral
• 📅 Daily bonus: 50 coins per day

<b>How to withdraw:</b>
• Minimum: 100 coins
• Methods: Telegram Stars, TON wallet
• Processing: Usually within 24 hours

<b>Commands:</b>
/start - Launch the app
/help - Show this help
/stats - View your statistics

<b>Support:</b>
If you need help, contact @tapwave_support`;

  await ctx.reply(helpMessage, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Launch TapWave',
            web_app: { url: WEBAPP_URL }
          }
        ]
      ]
    }
  });
});

// Stats command
bot.command('stats', async (ctx) => {
  try {
    const user = ctx.from;
    
    // In production, you would fetch real stats from your API
    const mockStats = {
      balance: 1250,
      totalEarned: 2500,
      adsWatched: 45,
      tasksCompleted: 12,
      referrals: 3
    };

    const statsMessage = `📊 <b>Your TapWave Stats</b>

💰 <b>Current Balance:</b> ${mockStats.balance} coins
📈 <b>Total Earned:</b> ${mockStats.totalEarned} coins
📺 <b>Ads Watched:</b> ${mockStats.adsWatched}
✅ <b>Tasks Completed:</b> ${mockStats.tasksCompleted}
👥 <b>Referrals:</b> ${mockStats.referrals}

Keep earning to reach higher levels! 🚀`;

    await ctx.reply(statsMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Launch TapWave',
              web_app: { url: WEBAPP_URL }
            }
          ]
        ]
      }
    });

  } catch (error) {
    console.error('Error in stats command:', error);
    await ctx.reply('Unable to fetch stats right now. Please try again later.');
  }
});

// Handle callback queries
bot.on('callback_query', async (ctx) => {
  try {
    const data = ctx.callbackQuery.data;
    const user = ctx.from;

    switch (data) {
      case 'stats':
        await ctx.answerCbQuery();
        await ctx.editMessageText(`📊 <b>Your TapWave Stats</b>

💰 <b>Current Balance:</b> 1250 coins
📈 <b>Total Earned:</b> 2500 coins
📺 <b>Ads Watched:</b> 45
✅ <b>Tasks Completed:</b> 12
👥 <b>Referrals:</b> 3

Keep earning to reach higher levels! 🚀`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🚀 Launch TapWave',
                  web_app: { url: WEBAPP_URL }
                }
              ],
              [
                {
                  text: '🔙 Back',
                  callback_data: 'back'
                }
              ]
            ]
          }
        });
        break;

      case 'referral':
        await ctx.answerCbQuery();
        const referralLink = `https://t.me/${ctx.botInfo.username}?start=ref${user.id}`;
        await ctx.editMessageText(`👥 <b>Invite Friends & Earn!</b>

🎁 <b>Referral Rewards:</b>
• You get: 100 coins per friend
• Your friend gets: 50 welcome bonus
• Plus 10% of their future earnings!

📎 <b>Your Referral Link:</b>
<code>${referralLink}</code>

Share this link with friends to start earning! 💰`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '📤 Share Link',
                  url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('🌊 Join me on TapWave and start earning coins! 💰')}`
                }
              ],
              [
                {
                  text: '🚀 Launch TapWave',
                  web_app: { url: WEBAPP_URL }
                }
              ],
              [
                {
                  text: '🔙 Back',
                  callback_data: 'back'
                }
              ]
            ]
          }
        });
        break;

      case 'help':
        await ctx.answerCbQuery();
        await ctx.editMessageText(`🆘 <b>TapWave Help</b>

<b>How to earn coins:</b>
• 📺 Watch ads: 10 coins per ad
• ✅ Complete tasks: 25-200 coins
• 👥 Refer friends: 100 coins per referral
• 📅 Daily bonus: 50 coins per day

<b>How to withdraw:</b>
• Minimum: 100 coins
• Methods: Telegram Stars, TON wallet
• Processing: Usually within 24 hours

<b>Support:</b>
If you need help, contact @tapwave_support`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🚀 Launch TapWave',
                  web_app: { url: WEBAPP_URL }
                }
              ],
              [
                {
                  text: '🔙 Back',
                  callback_data: 'back'
                }
              ]
            ]
          }
        });
        break;

      case 'back':
        await ctx.answerCbQuery();
        const welcomeMessage = `🌊 Welcome back to TapWave, ${user.first_name}!

💰 Ready to earn more coins?`;

        await ctx.editMessageText(welcomeMessage, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🚀 Launch TapWave',
                  web_app: { url: WEBAPP_URL }
                }
              ],
              [
                {
                  text: '📊 My Stats',
                  callback_data: 'stats'
                },
                {
                  text: '👥 Invite Friends',
                  callback_data: 'referral'
                }
              ],
              [
                {
                  text: '❓ Help',
                  callback_data: 'help'
                }
              ]
            ]
          }
        });
        break;

      default:
        await ctx.answerCbQuery('Unknown action');
    }

  } catch (error) {
    console.error('Error handling callback query:', error);
    await ctx.answerCbQuery('Something went wrong. Please try again.');
  }
});

// Handle errors
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  console.error('Context:', ctx);
});

// Admin commands (for monitoring)
bot.command('admin', async (ctx) => {
  const adminIds = [123456789]; // Add your Telegram ID here
  
  if (!adminIds.includes(ctx.from.id)) {
    return;
  }

  const adminMessage = `🔧 <b>TapWave Admin Panel</b>

<b>System Status:</b> ✅ Online
<b>Total Users:</b> 1,234
<b>Active Today:</b> 456
<b>Total Rewards Paid:</b> 125,000 coins
<b>Pending Withdrawals:</b> 12

<b>Recent Activity:</b>
• 45 new users today
• 234 ads watched
• 89 tasks completed
• 23 referrals`;

  await ctx.reply(adminMessage, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📊 Full Stats',
            callback_data: 'admin_stats'
          },
          {
            text: '💸 Withdrawals',
            callback_data: 'admin_withdrawals'
          }
        ]
      ]
    }
  });
});

// Express routes for webhooks
app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the bot
async function startBot() {
  try {
    if (process.env.NODE_ENV === 'production') {
      // Use webhooks in production
      const webhookUrl = `${process.env.WEBHOOK_URL}/webhook`;
      await bot.telegram.setWebhook(webhookUrl);
      console.log(`Webhook set to: ${webhookUrl}`);
      
      app.listen(PORT, () => {
        console.log(`Bot server running on port ${PORT}`);
      });
    } else {
      // Use polling in development
      await bot.telegram.deleteWebhook();
      bot.launch();
      console.log('Bot started with polling');
    }

    console.log('TapWave bot is running!');
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Start the bot
startBot();

module.exports = { bot, app };
