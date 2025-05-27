// src/data/animations/library/hydrogenOxygenWater.ts
import { AnimationConfig } from '../types';

export const hydrogenOxygenWater: AnimationConfig = {
  height: 300,
  autoPlay: true,
  loop: false,
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        /* Add your full animation styles here */
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
    <div id="canvas-container"></div>
    <script>
        // Your full Three.js animation code here
        // Add message posting for communication with React Native

        // When animation completes:
        window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'animationComplete'
        }));

        // Listen for control messages
        window.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            if (data.action === 'restart') {
                resetAnimation();
            }
        });
    </script>
</body>
</html>
`
};

// src/data/animations/library/statesOfMatter.ts
import { AnimationConfig } from '../types';

export const statesOfMatter: AnimationConfig = {
  height: 250,
  autoPlay: true,
  loop: true,
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* States of matter animation styles */
    </style>
</head>
<body>
    <!-- States of matter animation HTML -->
</body>
</html>
`
};
