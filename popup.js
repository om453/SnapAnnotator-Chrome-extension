let isAnnotating = false;

chrome.storage.local.get(['isAnnotating'], (result) => {
    isAnnotating = result.isAnnotating || false;
    updateButtonVisibility();
});

function updateButtonVisibility() {
    document.getElementById('captureBtn').style.display = isAnnotating ? 'none' : 'block';
    document.getElementById('saveBtn').style.display = isAnnotating ? 'block' : 'none';
}

document.getElementById('captureBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.url.startsWith('chrome://')) {
            alert('Cannot capture screenshots of chrome:// pages.');
            return;
        }

        chrome.scripting.executeScript({
            target: {tabId: activeTab.id},
            files: ['content.js']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
            chrome.runtime.sendMessage({action: "captureScreenshot"}, (response) => {
                if (response && response.screenshotUrl) {
                    chrome.tabs.sendMessage(activeTab.id, {
                        action: "initializeAnnotation",
                        screenshotUrl: response.screenshotUrl
                    }, () => {
                        isAnnotating = true;
                        chrome.storage.local.set({isAnnotating: true});
                        updateButtonVisibility();
                        window.close();
                    });
                }
            });
        });
    });
});

document.getElementById('saveBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getAnnotatedScreenshot"}, (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            } else if (response && response.annotatedScreenshotUrl) {
                chrome.downloads.download({
                    url: response.annotatedScreenshotUrl,
                    filename: 'annotated_screenshot.png',
                    saveAs: true
                }, (downloadId) => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                    } else {
                        chrome.tabs.sendMessage(tabs[0].id, {action: "cleanupAnnotation"});
                        isAnnotating = false;
                        chrome.storage.local.set({isAnnotating: false});
                        updateButtonVisibility();
                    }
                });
            }
        });
    });
});

updateButtonVisibility();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "finishAnnotation") {
    isAnnotating = true;
    updateButtonVisibility();
  }
});