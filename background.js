chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureScreenshot") {
    chrome.tabs.captureVisibleTab(null, { format: "png", quality: 100 }, (dataUrl) => {
      sendResponse({ screenshotUrl: dataUrl });
    });
    return true; // Indicates that the response is sent asynchronously
  }
});
