// src/data/animations/library/hydrogenOxygenWater.ts
import { AnimationConfig } from '../types';
import { baseAnimationTemplate } from './baseAnimationTemplate';

export const hydrogenOxygenWater: AnimationConfig = {
  height: 500,
  autoPlay: true,
  loop: false,
  features: {
    speed: true,
    beforeAfter: true,
    rotation3D: true,
    temperature: true,
  },
    safety: {
        maxTemperature: 100,
        maxPressure: 2,
        maxConcentration: 1.0,
        minDistance: 0.5,
        requiredEquipment: ['Safety Goggles', 'Gloves'],
        hazardousReactions: ['explosive', 'toxic']
    },
  html: baseAnimationTemplate + `
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
