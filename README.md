# SnapAnnotator

SnapAnnotator is a powerful Chrome extension that allows users to capture, annotate, and save screenshots directly within their browser. This tool is perfect for designers, developers, and anyone who needs to quickly capture and mark up web content.

## Features

1. **One-Click Screenshot Capture**: Easily capture the visible area of any web page with a single click.
2. **In-Browser Annotation**: Draw and highlight to your screenshots without leaving your browser.
3. **Customizable Drawing Tools**: Choose from various colors and brush sizes to suit your annotation needs.
4. **Eraser Functionality**: Quickly remove unwanted annotations with the eraser tool.
5. **Draggable Toolbar**: A movable annotation toolbar for a clutter-free workspace.
6. **Save and Download**: Save your annotated screenshots directly to your computer in PNG format.

## Technical Details

- Built with Manifest V3 for improved security and performance.
- Uses Chrome's `tabs`, `activeTab`, `storage`, `scripting`, and `downloads` APIs.
- Implements a content script for in-page annotations.
- Utilizes a background service worker for screenshot capture.
- Employs local storage to manage annotation states across browser sessions.

## Code Structure

- `manifest.json`: Extension configuration file (```json:manifest.json startLine: 1 endLine: 25```)
- `popup.html`: User interface for the extension popup (```html:popup.html startLine: 1 endLine: 15```)
- `popup.js`: Handles user interactions and communication with other extension components (```javascript:popup.js startLine: 1 endLine: 78```)
- `content.js`: Manages the annotation canvas and drawing tools (```javascript:content.js startLine: 1 endLine: 173```)
- `background.js`: Captures screenshots of the active tab (```javascript:background.js startLine: 1 endLine: 8```)
- `styles.css`: Styles the extension popup for a clean, modern look (```
css:styles.css startLine: 1 endLine: 48```)

## Installation

1. Clone this repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Usage

1. Click the SnapAnnotator icon in your Chrome toolbar.
2. Press the "Capture Screenshot" button to take a screenshot of the current tab.
3. Use the annotation tools to mark up your screenshot.
4. Click "Finish" when done annotating.
5. In the extension popup, click "Save Screenshot" to download your annotated image.
