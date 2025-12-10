# AI Facilitator - Local Setup

## Quick Start

### 1. Set up environment variables
Create a `.env.local` file in the root directory:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get your API key from: https://console.anthropic.com/

### 2. Run locally
Two options:

**Option A: Run both server and React app together**
```bash
npm run dev
```

This starts:
- Backend server on `http://localhost:5000`
- React frontend on `http://localhost:3000`

**Option B: Run separately (if you want to debug)**
```bash
# Terminal 1: Start the server
npm run server

# Terminal 2: Start the React app
npm start
```

### 3. Open in browser
Navigate to `http://localhost:3000`

## What you'll see
The AI Facilitator chat interface will load and start with the opening question from Section 4 of the lesson. You can then have a conversation with the facilitator about the I-Model.

## Testing in an iframe
To test the facilitator as an iframe (like it would appear in LearnWorld):

```html
<iframe src="http://localhost:3000" width="800" height="600"></iframe>
```

## Deploying to Vercel

When you're ready to deploy:

1. Push your code to GitHub:
```bash
git add .
git commit -m "AI Facilitator ready for deployment"
git push origin main
```

2. Connect to Vercel:
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Add environment variable: `ANTHROPIC_API_KEY`
   - Click Deploy

That's it! Vercel will automatically deploy on every push to main.

## File Structure

- `src/App.tsx` - Main React component with chat UI
- `src/App.css` - Styling
- `server.ts` - Express backend that calls Claude API
- `api/facilitator.ts` - Vercel serverless function (for production)
