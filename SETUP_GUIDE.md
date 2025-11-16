# 🚀 Setup Guide - AI Mental Health Chatbot

## Quick Start (5 Minutes)

### Step 1: Get Your DeepSeek API Key

1. Visit [https://platform.deepseek.com](https://platform.deepseek.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key and copy it

### Step 2: Configure the Application

1. Open the `.env.local` file in the project root
2. Replace `your_api_key_here` with your actual API key:

```env
DEEPSEEK_API_KEY=sk-your-actual-key-here
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
```

### Step 3: Start the Development Server

Open your terminal in the project directory and run:

```bash
npm run dev
```

Wait for the message: `✓ Ready in X.XXs`

### Step 4: Test the Application

1. Open your browser to [http://localhost:3000](http://localhost:3000)
2. You should see the "Supportive Listener" interface
3. Try sending a test message like "Hi, I'm feeling stressed today"
4. The AI should respond with empathetic support

## Troubleshooting

### Issue: "DeepSeek API key is required"

**Solution:** 
- Make sure `.env.local` file exists in the project root
- Verify the API key is correct (starts with `sk-`)
- Restart the development server after adding the key

### Issue: "Failed to get response" error

**Solution:**
- Check your internet connection
- Verify your API key is active and has credits
- Check the DeepSeek API status page
- Look at the browser console (F12) for detailed errors

### Issue: Page won't load or shows errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: Conversation doesn't persist

**Solution:**
- Check browser console for localStorage errors
- Make sure you're using a modern browser (Chrome, Firefox, Edge)
- Check if browser is in private/incognito mode (localStorage may be disabled)

## Testing the Application

### Test 1: Basic Conversation
1. Send: "Hello"
2. Expect: Warm greeting and invitation to share

### Test 2: Emotional Support
1. Send: "I'm feeling really anxious about work"
2. Expect: Validation of feelings, reflective questions

### Test 3: Crisis Detection
1. Send: "I'm feeling really down and thinking about hurting myself"
2. Expect: 
   - Compassionate response
   - Crisis resources alert appears at top
   - Professional help gently suggested

### Test 4: Memory & Continuity
1. Have a conversation with several messages
2. Refresh the page
3. Expect: Previous messages should still be visible
4. Continue conversation - AI should remember context

### Test 5: Long Conversation
1. Send 10+ messages back and forth
2. Expect: Conversation should remain coherent
3. Check browser console - you may see "Summarization" messages
4. AI should still reference earlier topics despite summarization

## Development Tips

### Hot Reload
- The app uses Next.js hot reload
- Save any file and changes appear immediately
- No need to restart the server for code changes

### View API Calls
- Open browser DevTools (F12)
- Go to Network tab
- Filter by "chat"
- You can see the API requests and responses

### Check Memory System
- Open browser Console (F12)
- The memory system logs when it creates summaries
- Look for messages like "Summarization triggered"

### Modify AI Behavior
- Edit `lib/memory.ts` → `getSystemPrompt()` method
- Changes apply immediately (hot reload)
- Test with different scenarios

### Adjust Memory Settings
In `lib/memory.ts`:
```typescript
const MAX_RECENT_MESSAGES = 10;  // Increase for longer context
const SUMMARIZE_THRESHOLD = 8;   // Decrease for more frequent summaries
```

### Customize Crisis Keywords
In `lib/deepseek.ts`:
```typescript
const crisisKeywords = [
  'suicide', 'kill myself', // ... add more
];
```

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. Add environment variables:
   - `DEEPSEEK_API_KEY`: Your API key
   - `DEEPSEEK_API_BASE`: https://api.deepseek.com/v1
5. Click "Deploy"

### Other Platforms

For other platforms (Netlify, AWS, etc.):
1. Build the project: `npm run build`
2. Set environment variables in your platform
3. Deploy the `.next` folder as a Node.js application
4. Ensure Node.js 18+ is available

## API Rate Limits

DeepSeek has rate limits on API calls:
- Free tier: Check DeepSeek documentation
- If you hit limits, the app will show an error
- Consider upgrading your plan for production use

## Security Notes

### For Development
- `.env.local` is gitignored by default - never commit API keys
- Use `.env.example` as a template for others

### For Production
- Use environment variables in your hosting platform
- Consider implementing rate limiting
- Add user authentication if needed
- Monitor API usage and costs

## Additional Features You Can Add

### 1. User Accounts
- Implement NextAuth.js for authentication
- Store conversations per user in a database
- Sync across devices

### 2. Conversation History
- Add a sidebar with past conversations
- Implement conversation titles/summaries
- Allow loading previous conversations

### 3. Export Conversations
- Add a download button to export chat history
- Format as PDF or text file
- Help users save important insights

### 4. Dark Mode Toggle
- The theme is already configured in `globals.css`
- Add a toggle button in the UI
- Store preference in localStorage

### 5. Voice Input
- Use Web Speech API for voice-to-text
- Add a microphone button
- Convert speech to text input

## Support

If you encounter issues not covered here:
1. Check the main README.md for more details
2. Review the browser console for errors
3. Check DeepSeek API status and documentation
4. Verify all dependencies are installed correctly

## Next Steps

Once everything is working:
- ✅ Customize the system prompt for your use case
- ✅ Adjust the UI colors and branding
- ✅ Add any additional features you need
- ✅ Test thoroughly with various scenarios
- ✅ Deploy to production when ready

---

**Remember:** This is a support tool, not a replacement for professional mental health care. Always include appropriate disclaimers and crisis resources.

