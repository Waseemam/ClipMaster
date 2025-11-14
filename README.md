# ClipMaster

A powerful clipboard manager and note-taking app built with Electron, React, Tailwind CSS, and shadcn/ui.

## Features

- 📋 **Clipboard Manager** - Automatic clipboard history tracking with AI-generated titles
- 📝 **Note Editor** - Rich markdown editor with live preview
- 🤖 **AI Integration** - Auto markdown formatting, text summarization, and smart tagging
- 💾 **Local SQLite Storage** - All data stored locally, works completely offline
- ⚡ **Electron** - Cross-platform desktop application
- ⚛️ **React** - Modern UI framework
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🎭 **shadcn/ui** - Beautiful, accessible component library
- 🔥 **Vite** - Lightning-fast development with HMR

## Getting Started

### Prerequisites

1. Node.js installed on your system
2. ✅ OpenAI API key already embedded in the app!

### Setup

1. **Install Dependencies**

```bash
npm install
```

2. **Run in Development Mode**

```bash
npm start
```

The app will create a local SQLite database automatically at:
- **Windows**: `C:\Users\[username]\AppData\Roaming\ClipMaster\clipmaster.db`
- **macOS**: `~/Library/Application Support/ClipMaster/clipmaster.db`
- **Linux**: `~/.config/ClipMaster/clipmaster.db`

### Build for Production

```bash
npm run package
```

### Create Installers

```bash
npm run make
```

This will create installers in the `out/` directory.

**✨ Ready to share!** The built EXE includes everything - just send `ClipMaster-Setup.exe` to your friends!

## Project Structure

```
ClipMaster/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   ├── lib/
│   │   └── utils.js     # Utility functions (cn, etc.)
│   ├── App.jsx          # Main React component
│   ├── index.css        # Global styles with Tailwind
│   ├── main.js          # Electron main process
│   ├── preload.js       # Electron preload script
│   └── renderer.js      # React app entry point
├── index.html
├── components.json      # shadcn/ui configuration
├── tailwind.config.js   # Tailwind configuration
└── package.json
```

## Adding shadcn/ui Components

You can add more components from shadcn/ui:

```bash
npx shadcn@latest add [component-name]
```

Available components: https://ui.shadcn.com/docs/components

## Database

ClipMaster uses **SQLite** for local storage. No external database server required!

- **Location**: Stored in the app's data directory
- **Backup**: Simply copy the `data/clipmaster.db` file
- **Tables**: 
  - `notes` - Your markdown notes with tags and folders
  - `clipboard_items` - Clipboard history (text and images)
  - `folders` - Note organization
  - `tags` - Tag management

All data is stored locally and works completely offline.

## Tech Stack

- **Electron 39.0.0** - Desktop app framework
- **React 18** - UI library
- **Vite 5** - Build tool
- **SQLite (sql.js)** - Local database
- **OpenAI API** - AI-powered features
- **Tailwind CSS 3** - Styling
- **shadcn/ui** - Component library
- **React Markdown** - Markdown rendering
- **Electron Forge** - Build and package tools

## AI Features

ClipMaster includes several AI-powered features using OpenAI:

- 🤖 **Auto Markdown** - Convert plain text to properly formatted markdown
- 📊 **Summarize** - Generate concise summaries of your notes
- ✨ **Fix & Clear** - Improve grammar, spelling, and clarity
- 🏷️ **Auto Title & Tags** - Automatically generate titles and tags for notes
- 💡 **Smart Clipboard Titles** - AI-generated titles for clipboard items

## License

MIT

