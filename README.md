# Article to Markdown Extension

A Chrome extension that converts web articles to clean Markdown format and copies them to your clipboard.

## Features

- 🎯 One-click conversion of web articles to Markdown
- 📋 Automatically copies to clipboard
- 🔍 Smart article detection algorithm
- ✅ Visual feedback with badge indicators
- 🚀 Works on any webpage

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon will appear in your toolbar

## Usage

1. Navigate to any article or blog post
2. Click the extension icon in your toolbar
3. The article will be converted to Markdown and copied to your clipboard
4. Look for the green ✓ badge for success or red ! for errors

## How it Works

The extension uses:
- **Content Script**: Analyzes the page structure to identify and extract article content
- **Background Script**: Handles extension icon clicks and manages clipboard operations
- **Offscreen Document**: Safely handles clipboard writing in Manifest V3

## Supported Elements

- Headers (H1-H6)
- Paragraphs
- Bold and italic text
- Links
- Images
- Lists (ordered and unordered)
- Code blocks and inline code
- Blockquotes
- Horizontal rules

## Permissions

- `activeTab`: Access the current tab's content
- `scripting`: Inject content scripts dynamically
- `clipboardWrite`: Copy converted Markdown to clipboard
- `offscreen`: Create offscreen documents for clipboard operations

## Development

### File Structure
```
md-extension/
├── manifest.json       # Extension configuration
├── background.js       # Service worker for handling extension events
├── content.js          # Content script for article extraction
├── offscreen.js        # Handles clipboard operations
├── offscreen.html      # Offscreen document HTML
└── icons/              # Extension icons
```

### Building from Source

No build process required! This extension uses vanilla JavaScript and can be loaded directly into Chrome.

## License

MIT