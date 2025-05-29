export const baseAnimationTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            transition: box-shadow 0.3s ease;
        }
        #canvas-container {
            width: 100vw;
            height: 100vh;
            position: relative;
        }

        #safety-warning {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 59, 48, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            z-index: 100;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 90%;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
    <div id="canvas-container"></div>
    <script>
        // Animation state
        let animationState = {
            temperature: 20,
            zoom: 1,
            speed: 1,
            showBefore: true,
            rotation3D: true,
            particleCount: 50,
            pressure: 1,
            concentration: 0.5,
            isPlaying: true,
            safetyStatus: { isSafe: true, warnings: [] }
        };

        // Initialize with passed state
        if (window.initialState) {
            animationState = { ...animationState, ...window.initialState };
        }

        // Safety functions
        function handleSafetyStatus(status) {
            if (!status.isSafe) {
                document.body.style.boxShadow = 'inset 0 0 0 3px #ff3b30';
                showSafetyWarning(status.warnings);
            } else {
                document.body.style.boxShadow = 'none';
                hideSafetyWarning();
            }
        }

        function showSafetyWarning(warnings) {
            let warningEl = document.getElementById('safety-warning');
            if (!warningEl) {
                warningEl = document.createElement('div');
                warningEl.id = 'safety-warning';
                document.body.appendChild(warningEl);
            }

            // Update content
            warningEl.innerHTML = warnings.join(' ⚠️ ') +
                '<br><small>Adjust parameters to safe levels</small>';
        }

        function hideSafetyWarning() {
            const warningEl = document.getElementById('safety-warning');
            if (warningEl) warningEl.remove();
        }

        // Handle control updates from React Native
        window.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'controlUpdate') {
                    animationState[data.control] = data.value;

                    // Handle safety update
                    if (data.control === 'safetyStatus') {
                        handleSafetyStatus(data.value);
                    }

                    // Call animation-specific update handler
                    if (window.handleControlUpdate) {
                        window.handleControlUpdate(data.control, data.value);
                    }
                }

                if (data.action === 'restart' && window.resetAnimation) {
                    window.resetAnimation();
                }
            } catch (e) {
                console.error('Message handling error:', e);
            }
        });

        // Send state updates back to React Native
        function sendStateUpdate(state) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'stateUpdate',
                    state: state
                }));
            }
        }

        // Common animation utilities
        const AnimationUtils = {
            // Temperature effects
            getTemperatureColor: (temp) => {
                if (temp < 0) return 0x87CEEB; // Ice blue
                if (temp < 50) return 0x4169E1; // Royal blue
                if (temp < 100) return 0xFF8C00; // Dark orange
                return 0xFF4500; // Orange red
            },

            // Particle motion based on temperature
            getParticleSpeed: (temp) => {
                return 0.001 + (temp + 100) / 10000;
            },

            // Zoom handling
            applyZoom: (camera, zoom) => {
                camera.position.z = 15 / zoom;
                camera.updateProjectionMatrix();
            },

            // Speed time scaling
            getTimeScale: (speed) => {
                return speed;
            },

            // Particle visibility
            updateParticleCount: (particles, count) => {
                particles.forEach((p, i) => {
                    p.visible = i < count;
                });
            }
        };

        // Export for use in animations
        window.AnimationUtils = AnimationUtils;
        window.animationState = animationState;
        window.sendStateUpdate = sendStateUpdate;

        // Initialize safety status
        handleSafetyStatus(animationState.safetyStatus);
    </script>
</body>
</html>
`;
