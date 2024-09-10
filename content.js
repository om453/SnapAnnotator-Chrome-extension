// This script will be injected into the web page
let annotationCanvas;
let ctx;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let initialScreenshot;

function createAnnotationCanvas(screenshotUrl) {
  // Remove existing canvas if any
  if (annotationCanvas) {
    annotationCanvas.remove();
  }

  // Create a new canvas
  annotationCanvas = document.createElement('canvas');
  annotationCanvas.style.position = 'fixed';
  annotationCanvas.style.top = '0';
  annotationCanvas.style.left = '0';
  annotationCanvas.style.zIndex = '9999';
  annotationCanvas.width = window.innerWidth;
  annotationCanvas.height = window.innerHeight;

  document.body.appendChild(annotationCanvas);

  ctx = annotationCanvas.getContext('2d');
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Load the screenshot onto the canvas
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, annotationCanvas.width, annotationCanvas.height);
  };
  img.src = screenshotUrl;

  initialScreenshot = new Image();
  initialScreenshot.src = screenshotUrl;

  // Add event listeners for drawing
  annotationCanvas.addEventListener('mousedown', startDrawing);
  annotationCanvas.addEventListener('mousemove', draw);
  annotationCanvas.addEventListener('mouseup', stopDrawing);
  annotationCanvas.addEventListener('mouseout', stopDrawing);
}

function startDrawing(e) {
  isDrawing = true;
  [lastX, lastY] = [e.clientX, e.clientY];
}

function draw(e) {
  if (!isDrawing) return;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();
  [lastX, lastY] = [e.clientX, e.clientY];
}

function stopDrawing() {
  isDrawing = false;
}

function showAnnotationTools() {
  const toolsDiv = document.createElement('div');
  toolsDiv.id = 'annotation-tools';
  toolsDiv.style.position = 'fixed';
  toolsDiv.style.top = '10px';
  toolsDiv.style.left = '10px';
  toolsDiv.style.zIndex = '10000';
  toolsDiv.style.backgroundColor = '#333';
  toolsDiv.style.padding = '10px';
  toolsDiv.style.borderRadius = '5px';
  toolsDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  toolsDiv.style.cursor = 'move';
  toolsDiv.style.userSelect = 'none';

  toolsDiv.innerHTML = `
    <button id="finish-annotation" style="background-color: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-right: 10px;">Finish</button>
    <input type="color" id="color-picker" value="#ff0000" style="vertical-align: middle; margin-right: 10px;">
    <input type="range" id="size-slider" min="1" max="20" value="5" style="vertical-align: middle; margin-right: 10px;">
    <button id="eraser" style="background-color: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Eraser</button>
  `;
  document.body.appendChild(toolsDiv);

  // Make the toolkit draggable
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  toolsDiv.addEventListener("mousedown", dragStart);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", dragEnd);

  function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    isDragging = true;
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;
      setTranslate(currentX, currentY, toolsDiv);
    }
  }

  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }

  document.getElementById('finish-annotation').addEventListener('click', () => {
    chrome.storage.local.set({isAnnotating: true});
    chrome.runtime.sendMessage({action: "finishAnnotation"});
    toolsDiv.remove();
  });

  document.getElementById('color-picker').addEventListener('change', (e) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = e.target.value;
    ctx.lineWidth = document.getElementById('size-slider').value;
  });
  
  document.getElementById('size-slider').addEventListener('input', (e) => {
    ctx.lineWidth = e.target.value;
    if (ctx.globalCompositeOperation === 'destination-out') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = document.getElementById('color-picker').value;
    }
  });

  document.getElementById('eraser').addEventListener('click', () => {
    ctx.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);
    ctx.drawImage(initialScreenshot, 0, 0, annotationCanvas.width, annotationCanvas.height);
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "initializeAnnotation") {
      createAnnotationCanvas(request.screenshotUrl);
      showAnnotationTools();
      sendResponse({success: true});
  } else if (request.action === "getAnnotatedScreenshot") {
      const dataUrl = annotationCanvas.toDataURL('image/png');
      sendResponse({annotatedScreenshotUrl: dataUrl});
  } else if (request.action === "cleanupAnnotation") {
      if (annotationCanvas) {
          annotationCanvas.remove();
          annotationCanvas = null;
      }
      const toolsDiv = document.getElementById('annotation-tools');
      if (toolsDiv) {
          toolsDiv.remove();
      }
  }
  return true;
});