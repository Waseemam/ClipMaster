# ClipMaster

A powerful clipboard manager built with Electron, React, Tailwind CSS, and shadcn/ui.

## Features

- ⚡ **Electron** - Cross-platform desktop application
- ⚛️ **React** - Modern UI framework
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🎭 **shadcn/ui** - Beautiful, accessible component library
- 🔥 **Vite** - Lightning-fast development with HMR

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run in Development Mode

```bash
npm start
```

### Build for Production

```bash
npm run package
```

### Create Installers

```bash
npm run make
```

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

## Database Configuration

Your `.env` file contains the MSSQL database configuration:

- **Server**: localhost:1433
- **Database**: ClipFlow
- **User**: clipmaster

Make sure to update these credentials before connecting to your database.

## Tech Stack

- **Electron 39.0.0** - Desktop app framework
- **React 18** - UI library
- **Vite 5** - Build tool
- **Tailwind CSS 3** - Styling
- **shadcn/ui** - Component library
- **Electron Forge** - Build and package tools

## License

MIT

