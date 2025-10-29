# TalkSpark 💬✨

TalkSpark is an AI-powered conversation starter generator that helps you create personalized, engaging opening lines for dating apps, networking, or casual chats. Generate openers in different tones, get follow-up suggestions, and save your favorites with smart reminders.

## Features

- **AI-Powered Generation**: Leverages Lovable AI (Google Gemini) to create context-aware conversation starters
- **Multiple Tones**: Choose from Playful, Sincere, Confident, or Funny tones
- **Smart Variations**: Generate safer, warmer, funnier, or shorter versions with one click
- **Content Filtering**: Built-in safety filters for appropriate, respectful conversations
- **Follow-Up Suggestions**: Get contextual follow-up messages to keep conversations flowing
- **Favorites System**: Save openers with star ratings and optional 24-hour reminders
- **Character Limit**: All openers are capped at 220 characters for optimal messaging
- **Beautiful Animations**: Smooth fade-in effects powered by Framer Motion
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **Backend**: Supabase Edge Functions (Deno)
- **AI**: Lovable AI Gateway (Google Gemini 2.5 Flash)
- **Storage**: LocalStorage for favorites and reminders
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd talkspark
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
# or
bun dev
```

5. Open your browser to `http://localhost:8080`

## Building for Production

```bash
npm run build
# or
bun run build
```

The optimized production build will be in the `dist` folder.

### Preview production build:
```bash
npm run preview
# or
bun preview
```

## Project Structure

```
talkspark/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui base components
│   │   ├── OpenerCard.tsx  # Individual opener display
│   │   ├── OpenerList.tsx  # List of openers
│   │   ├── FollowUpList.tsx # Follow-up suggestions
│   │   ├── ProfileInput.tsx # User input for profile
│   │   ├── TonePicker.tsx  # Tone selection
│   │   ├── ReminderBanner.tsx # 24h reminder notifications
│   │   └── Navigation.tsx  # App navigation
│   ├── contexts/
│   │   └── TalkSparkContext.tsx # Global state management
│   ├── lib/
│   │   ├── analytics.ts    # Event tracking
│   │   └── utils.ts        # Utility functions
│   ├── pages/
│   │   ├── Generator.tsx   # Main generation page
│   │   ├── Saved.tsx       # Favorites page
│   │   └── NotFound.tsx    # 404 page
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── supabase/
│   └── functions/
│       └── generate/
│           └── index.ts    # AI generation edge function
├── public/                 # Static assets
└── package.json
```

## Key Features Explained

### Content Filtering
The app includes automatic content filtering to ensure all generated openers are appropriate:
- Blocks explicit, offensive, or inappropriate language
- Enforces 220-character limit on all openers
- Client-side and server-side validation

### Variation Buttons
Each opener includes four variation options:
- **Safer**: More appropriate and professional
- **Warmer**: Friendlier and more emotionally engaging
- **Funnier**: More humorous and playful
- **Shorter**: Condensed to under 120 characters

### 24-Hour Reminders
When saving an opener, you can enable a 24-hour reminder:
- Stores reminder timestamp in localStorage
- Shows banner notification when reminder expires
- Quick CTA to generate follow-up messages

### Star Ratings
Rate openers 1-5 stars:
- Automatically saves to favorites when rated
- Helps track your most effective conversation starters
- Stored locally for privacy

## Supabase Edge Function

The `/generate` edge function handles:
- Profile text analysis
- Tone-based generation
- Content filtering
- Max length enforcement
- Variation styles
- Follow-up generation

### API Endpoint
```
POST /functions/v1/generate
```

### Request Body
```json
{
  "profileText": "interested in hiking and photography",
  "tones": ["playful", "sincere"],
  "mode": "opener",
  "variationStyle": "warmer" // optional
}
```

### Response
```json
{
  "results": [
    "Your hiking photos caught my eye! What's the most unexpected thing you've photographed on a trail?",
    "Fellow outdoor photographer here! Do you prefer sunrise or golden hour shots?",
    "I noticed you're into hiking and photography. What's your favorite spot that combines both?",
    "Quick question: mountains or beaches for photography? And what's your dream hiking destination?"
  ]
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous key | Yes |
| `LOVABLE_API_KEY` | Lovable AI Gateway key (server-side) | Yes |

## Analytics Events

The app tracks the following anonymous events:
- `generated_opener`: When openers are created
- `generated_followup`: When follow-ups are generated
- `clicked_copy`: When text is copied to clipboard
- `saved_opener`: When an opener is saved to favorites
- `rated_item`: When a star rating is given
- `generated_variation`: When a variation is requested

No personal data is collected.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- AI powered by Lovable AI Gateway (Google Gemini)
- Icons from [Lucide](https://lucide.dev)

## Support

For issues, questions, or suggestions, visit the [Lovable Project](https://lovable.dev/projects/d6b03911-b31e-4118-8b6b-849bcb46de49)

---

Made with ❤️ using Lovable
