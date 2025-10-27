# 🎲 Bingo Web Application

A modern, real-time multiplayer Bingo game built with Next.js, React, and TypeScript. Create or join rooms, play with friends, and enjoy a smooth gaming experience with a beautiful, responsive interface.

## 🚀 Features

### 🎮 Game Features
- **Multiplayer Bingo**: Play with friends in real-time
- **Room System**: Create or join game rooms with unique codes
- **Customizable Avatars**: Choose from a variety of fun emoji avatars
- **Player Limits**: Set custom player limits for each game (2+ players)
- **Responsive Design**: Play on any device, from desktop to mobile

### 🛠 Technical Features
- **Next.js 14**: Built with the App Router for optimal performance
- **Real-time Updates**: WebSocket-powered game state synchronization
- **Modern UI**: Beautiful, accessible components with Radix UI
- **Theming**: Built-in dark/light mode support
- **Form Validation**: Robust input validation with Zod
- **Type Safety**: Full TypeScript support for better developer experience
- **Optimized Build**: Fast loading with code splitting and optimization

## 🎮 How to Play

1. **Start a Game**
   - Enter your name and choose an avatar
   - Set the maximum number of players (2-10)
   - Click "Create Room" to generate a game room
   - Share the room code with friends

2. **Join a Game**
   - Enter your name and choose an avatar
   - Enter the room code shared by the host
   - Click "Join Room" to enter the game

3. **Game Rules**
   - Each player gets a unique Bingo card
   - Numbers are drawn automatically
   - First to complete a row, column, or diagonal wins
   - The game supports multiple winning patterns

## 🛠 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Supabase account (for authentication)
- Git (for version control)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Fairoz007/bingo.git
   cd bingo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to start playing!

### Production Build

To create a production build:

```bash
npm run build
# or
yarn build
```

Then start the production server:

```bash
npm start
# or
yarn start
```

## 🏗 Project Structure

```
.
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   └── rooms/               # Room management endpoints
│   ├── room/                    # Game room pages
│   │   └── [roomCode]/          # Dynamic route for game rooms
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Home/Landing page
├── components/                  # Reusable UI components
│   ├── ui/                      # ShadCN/UI components
│   ├── avatar-carousel.tsx      # Avatar selection component
│   └── player-count-selector.tsx# Player count selector
├── lib/                         # Utility functions
│   ├── supabase/                # Supabase client and helpers
│   └── utils.ts                 # General utilities
├── public/                      # Static assets
│   └── images/                  # Image assets
└── styles/                      # Global styles
    └── globals.css              # Main stylesheet
```

## 🧪 Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

## 🐛 Debugging

To enable debug logging, set the following environment variable:

```bash
NEXT_PUBLIC_DEBUG=true
```

## 👥 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 🐛 Reporting Issues

Found a bug? Please open an issue with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS version
- Any relevant error messages

### 🛠 Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation when necessary
- Keep the code style consistent

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Special thanks to the following amazing projects that made this possible:

- [Next.js](https://nextjs.org/) - The React Framework for Production
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Lucide](https://lucide.dev/) - Beautiful & consistent icons
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [React Hook Form](https://react-hook-form.com/) - Performant, flexible forms

## 📬 Contact

Have questions or feedback? Feel free to reach out!

- GitHub: [@Fairoz007](https://github.com/Fairoz007)
- Project Link: [https://github.com/Fairoz007/bingo](https://github.com/Fairoz007/bingo)