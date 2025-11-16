# ⚡ Quick Start - 2 Minutes

## Step 1: Get API Key (30 seconds)
1. Go to https://platform.deepseek.com
2. Sign up/login
3. Create API key
4. Copy the key (starts with `sk-`)

## Step 2: Configure (15 seconds)
1. Open `.env.local` in project root
2. Replace `your_api_key_here` with your key:
```env
DEEPSEEK_API_KEY=sk-your-actual-key-here
```

## Step 3: Start (30 seconds)
```bash
npm run dev
```

## Step 4: Test (30 seconds)
1. Open http://localhost:3000
2. Type: "Hi, how are you?"
3. Get empathetic response ✅

---

## That's It! 🎉

You now have a working AI mental health chatbot.

### What You Can Do:
- ✅ Have emotional support conversations
- ✅ Conversations persist (localStorage)
- ✅ Auto-summarization prevents context overflow
- ✅ Crisis detection with resources
- ✅ Beautiful, calming UI

### Next Steps:
- Read **SETUP_GUIDE.md** for detailed setup
- Read **CONFIGURATION.md** to customize
- Read **README.md** for full documentation

### Common Issues:

**"API key required" error?**
- Make sure you saved `.env.local`
- Restart dev server: Ctrl+C, then `npm run dev`

**"Failed to get response"?**
- Check API key is correct
- Check internet connection
- Verify API key has credits

**Need help?**
- Check browser console (F12) for errors
- Review SETUP_GUIDE.md troubleshooting section

---

## File Structure at a Glance

```
📁 app/
  └── api/chat/route.ts     ← API endpoint
  └── page.tsx              ← Main page

📁 components/
  └── chat-interface.tsx    ← Chat UI

📁 lib/
  ├── deepseek.ts          ← DeepSeek client
  ├── memory.ts            ← Memory system
  └── config.ts            ← Configuration

📄 .env.local              ← Your API key HERE
📄 README.md               ← Full docs
📄 SETUP_GUIDE.md          ← Detailed setup
📄 CONFIGURATION.md        ← Customization guide
```

## Quick Customization

### Change the name:
Edit `lib/config.ts`:
```typescript
APP_TITLE: 'Your Bot Name'
```

### Change AI creativity:
Edit `lib/config.ts`:
```typescript
CHAT_TEMPERATURE: 0.9  // More creative (0.0-1.0)
```

### Add your crisis resources:
Edit `lib/config.ts` → `CrisisResources.RESOURCES`

---

## Test Scenarios

### Test 1: Basic Chat ✅
**You:** "Hello"
**Bot:** Warm greeting

### Test 2: Emotional Support ✅
**You:** "I'm feeling anxious"
**Bot:** Validation + reflective questions

### Test 3: Crisis Detection ✅
**You:** "I'm feeling suicidal"
**Bot:** Crisis resources appear + supportive response

### Test 4: Memory ✅
**You:** Have 10+ message conversation
**Expected:** AI maintains context through summarization

### Test 5: Persistence ✅
**You:** Refresh page
**Expected:** Conversation still there

---

## Production Deployment (Vercel)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push

# Deploy on Vercel
# 1. Go to vercel.com
# 2. Import your repo
# 3. Add DEEPSEEK_API_KEY env variable
# 4. Deploy
```

---

## Support & Resources

- 📚 **Full Docs**: README.md
- 🔧 **Detailed Setup**: SETUP_GUIDE.md  
- ⚙️ **Customization**: CONFIGURATION.md
- 🆘 **Crisis Resources**: 988 (US) | findahelpline.com

---

**⚠️ Important:** This is NOT a substitute for professional mental health care. Always include appropriate disclaimers.

---

Made with ❤️ using Next.js, DeepSeek AI, and shadcn/ui

