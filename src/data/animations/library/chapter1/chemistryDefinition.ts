export const chemistryDefinition = {
  height: 600,
  autoPlay: true,
  loop: false, // Set to false as animations are event-driven
  features: {
    speed: true,
    zoom: true,
    rotation3D: true
  },
  template: {
    type: 'definition',
    config: {}
  },
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            overflow: hidden;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            color: white;
        }

        #container {
            width: 100vw;
            height: 100vh;
            position: relative;
        }

        #scene-container {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
        }

        /* Game-style Side Menu */
        #game-menu {
            position: absolute;
            top: 50%;
            left: 10px; /* Adjusted for a less boxy feel */
            transform: translateY(-50%);
            z-index: 100;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .menu-item {
            /* Removed background and border for a less "boxy" look, relying on text and hover effects */
            padding: 12px 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            min-width: 180px; /* Ensure text fits */
            text-align: left;
            border-left: 3px solid transparent; /* For active state */
        }

        .menu-item:hover {
            transform: translateX(5px);
            background-color: rgba(78, 205, 196, 0.1);
        }

        .menu-item.active {
            border-left: 3px solid #4ECDC4;
            background-color: rgba(78, 205, 196, 0.2);
            transform: translateX(5px);
        }

        .menu-icon {
            font-size: 20px;
            margin-right: 10px;
            vertical-align: middle;
        }

        .menu-text {
            font-size: 16px;
            font-weight: 500;
            color: white;
            vertical-align: middle;
        }

        /* Title */
        #title {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            text-align: center;
            background: rgba(0,0,0,0.2);
            padding: 10px 25px;
            border-radius: 15px;
            backdrop-filter: blur(5px);
        }

        .title-main {
            font-size: 22px;
            font-weight: bold;
            color: #4ECDC4;
            margin-bottom: 3px;
        }

        .title-sub {
            font-size: 13px;
            color: rgba(255,255,255,0.7);
        }

        /* Info Panel (replaces animation-status) */
        #info-panel {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            background: rgba(0,0,0,0.7);
            padding: 15px 25px;
            border-radius: 10px;
            border: 1px solid rgba(78, 205, 196, 0.3);
            backdrop-filter: blur(8px);
            opacity: 0;
            transition: all 0.5s ease;
            width: 80%;
            max-width: 500px;
            text-align: center;
        }

        #info-panel.visible {
            opacity: 1;
            bottom: 30px; /* Animate in */
        }

        .info-text {
            font-size: 14px;
            color: #E0E0E0;
            line-height: 1.6;
        }
        .info-text strong {
            color: #4ECDC4;
        }

        /* Loading */
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 200;
            text-align: center;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(78, 205, 196, 0.2);
            border-top: 3px solid #4ECDC4;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .highlight-glow {
            animation: glowPulse 1.5s infinite alternate;
        }

        @keyframes glowPulse {
            from { box-shadow: 0 0 10px #4ECDC4, 0 0 20px #4ECDC4; }
            to { box-shadow: 0 0 20px #66e0d5, 0 0 30px #66e0d5; }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            #game-menu {
                left: 5px;
                gap: 5px;
                top: 60px; /* Position below title on mobile */
                transform: translateY(0);
            }
            .menu-item {
                padding: 10px 12px;
                min-width: 150px;
            }
            .menu-icon { font-size: 18px; }
            .menu-text { font-size: 14px; }
            .title-main { font-size: 18px; }
            .title-sub { font-size: 12px; }
            #info-panel { width: 90%; font-size: 13px; padding: 10px 15px; }
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
    <div id="container">
        <div id="loading">
            <div class="spinner"></div>
            <div style="color: #4ECDC4; font-size: 16px;">Loading Chemistry Lab...</div>
        </div>

        <div id="title">
            <div class="title-main">Interactive Chemistry Lab</div>
            <div class="title-sub">Explore fundamental concepts</div>
        </div>

        <div id="game-menu">
            <div class="menu-item active" data-concept="intro">
                <span class="menu-icon">🏠</span>
                <span class="menu-text">Welcome</span>
            </div>
            <div class="menu-item" data-concept="properties">
                <span class="menu-icon">📊</span> <!-- Changed icon -->
                <span class="menu-text">Properties</span>
            </div>
            <div class="menu-item" data-concept="composition">
                <span class="menu-icon">🧪</span>
                <span class="menu-text">Composition</span>
            </div>
            <div class="menu-item" data-concept="structure">
                <span class="menu-icon">⚛️</span> <!-- Changed icon -->
                <span class="menu-text">Structure</span>
            </div>
        </div>

        <div id="scene-container"></div>

        <div id="info-panel">
            <div class="info-text">Select a concept from the menu to begin.</div>
        </div>
    </div>

    <script>
        let scene, camera, renderer;
        let currentConcept = 'intro';
        let sceneObjects = {
            water: null,
            salt: null,
            elementsGroup: null, // Group containing all element samples
            elementMap: new Map() // To easily access element 3D objects by symbol
        };
        let activeAnimations = {
            properties: null,
            composition: null,
            structure: null
        };
        let isAnimatingGlobal = false; // Prevents multiple concept animations
        let clock = new THREE.Clock();

        // Element data store
        const elementDataStore = {
            'H': { name: 'Hydrogen', symbol: 'H', atomicNumber: 1, atomicMass: '1.008 u', color: 0xFFFFFF,
                   description: 'The lightest and most abundant chemical element.' },
            'O': { name: 'Oxygen', symbol: 'O', atomicNumber: 8, atomicMass: '15.999 u', color: 0xFF4444,
                   description: 'Highly reactive nonmetal, essential for respiration.' },
            'He': { name: 'Helium', symbol: 'He', atomicNumber: 2, atomicMass: '4.0026 u', color: 0xD4AF37, // Gold-ish
                   description: 'A noble gas, the second lightest element.' },
            'U': { name: 'Uranium', symbol: 'U', atomicNumber: 92, atomicMass: '238.03 u', color: 0x00FF00, // Bright Green for radioactive feel
                   description: 'A heavy, radioactive metal used in nuclear reactors.' },
            'C': { name: 'Carbon', symbol: 'C', atomicNumber: 6, atomicMass: '12.011 u', color: 0x444444,
                   description: 'Forms the basis of all known life.' },
            'Na': { name: 'Sodium', symbol: 'Na', atomicNumber: 11, atomicMass: '22.990 u', color: 0xAAAAFF, // Light blue/silver
                   description: 'A highly reactive alkali metal.' },
            'Cl': { name: 'Chlorine', symbol: 'Cl', atomicNumber: 17, atomicMass: '35.45 u', color: 0x90EE90, // Light green for Cl gas
                   description: 'A reactive halogen, commonly found in salt.'}
        };


        function initThreeJS() {
            scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0x1a1a2e, 15, 60);

            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 3, 12);
            camera.lookAt(0, 0, 0);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.setClearColor(0x000000, 0); // Transparent background for HTML gradient

            document.getElementById('scene-container').appendChild(renderer.domElement);

            setupLighting();
            createLabEnvironment();

            document.getElementById('loading').style.display = 'none';
            showInfoPanel('Welcome to the Interactive Chemistry Lab! Click menu items to explore.', 5000);
        }

        function setupLighting() {
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
            mainLight.position.set(5, 10, 7);
            mainLight.castShadow = true;
            mainLight.shadow.mapSize.width = 2048;
            mainLight.shadow.mapSize.height = 2048;
            scene.add(mainLight);

            const pointLight = new THREE.PointLight(0x4ECDC4, 0.7, 30);
            pointLight.position.set(-5, 5, 5);
            scene.add(pointLight);
        }

        function createLabEnvironment() {
            const tableGeometry = new THREE.BoxGeometry(15, 0.3, 8);
            const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x34495e, shininess: 20 });
            const table = new THREE.Mesh(tableGeometry, tableMaterial);
            table.position.y = -1.15;
            table.receiveShadow = true;
            scene.add(table);

            sceneObjects.water = createWaterBottle();
            sceneObjects.salt = createSaltShaker();
            sceneObjects.elementsGroup = createElementSamples();

            createBackgroundParticles();
        }

        function createWaterBottle() { /* ... (keep existing createWaterBottle, ensure it's added to scene) ... */
            const group = new THREE.Group();
            const bottleGeometry = new THREE.CylinderGeometry(0.7, 0.5, 2.5, 16);
            const bottleMaterial = new THREE.MeshPhongMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.6, shininess: 80 });
            const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
            bottle.castShadow = true;
            group.add(bottle);

            const capGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 16);
            const capMaterial = new THREE.MeshPhongMaterial({ color: 0x2980b9 });
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.y = 1.375;
            cap.castShadow = true;
            group.add(cap);

            group.position.set(-3.5, 0, 0);
            group.userData.name = 'Water Bottle';
            scene.add(group);
            return group;
        }

        function createSaltShaker() { /* ... (keep existing createSaltShaker, ensure it's added to scene) ... */
            const group = new THREE.Group();
            const shakerGeometry = new THREE.CylinderGeometry(0.5, 0.6, 2, 16);
            const shakerMaterial = new THREE.MeshPhongMaterial({ color: 0xEAEAEA, shininess: 40 });
            const shaker = new THREE.Mesh(shakerGeometry, shakerMaterial);
            shaker.castShadow = true;
            group.add(shaker);

            const topGeometry = new THREE.CylinderGeometry(0.3, 0.5, 0.3, 16);
            const topMaterial = new THREE.MeshPhongMaterial({ color: 0xBDC3C7 });
            const top = new THREE.Mesh(topGeometry, topMaterial);
            top.position.y = 1.15;
            top.castShadow = true;
            group.add(top);

            group.position.set(3.5, -0.1, 0); // slightly lower
            group.userData.name = 'Salt Shaker';
            scene.add(group);
            return group;
        }

        function createElementSamples() {
            const group = new THREE.Group();
            const elementsToShow = ['H', 'O', 'He', 'U', 'C', 'Na']; // H, O, He, U are for properties
            const positions = [
                [-5, 0, 2.5], [-3, 0, 2.5], [-1, 0, 2.5], // H, O, He
                [1, 0, 2.5], [3, 0, 2.5], [5, 0, 2.5]    // U, C, Na
            ];

            elementsToShow.forEach((symbol, index) => {
                const elData = elementDataStore[symbol];
                if (!elData) return;

                const elGroup = new THREE.Group();

                const baseGeo = new THREE.CylinderGeometry(0.45, 0.55, 0.2, 16);
                const baseMat = new THREE.MeshPhongMaterial({color: 0x555555});
                const base = new THREE.Mesh(baseGeo, baseMat);
                base.position.y = -0.4;
                elGroup.add(base);

                const sampleGeo = new THREE.SphereGeometry(0.35, 32, 32);
                const sampleMat = new THREE.MeshPhongMaterial({
                    color: elData.color,
                    shininess: 80,
                    emissive: (symbol === 'U') ? elData.color : 0x000000, // Glow for Uranium
                    emissiveIntensity: (symbol === 'U') ? 0.5 : 1,
                });
                const sample = new THREE.Mesh(sampleGeo, sampleMat);
                sample.castShadow = true;
                elGroup.add(sample);

                // Label
                const canvas = document.createElement('canvas');
                canvas.width = 128; canvas.height = 64;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#222'; ctx.fillRect(0,0,128,64);
                ctx.fillStyle = 'white'; ctx.font = 'bold 30px Arial';
                ctx.textAlign = 'center'; ctx.fillText(elData.symbol, 64, 45);
                const labelTexture = new THREE.CanvasTexture(canvas);
                const labelMat = new THREE.SpriteMaterial({ map: labelTexture });
                const labelSprite = new THREE.Sprite(labelMat);
                labelSprite.scale.set(1, 0.5, 1);
                labelSprite.position.set(0, -0.7, 0);
                elGroup.add(labelSprite);

                elGroup.position.set(...positions[index]);
                elGroup.userData = { ...elData, type: 'element_sample', originalEmissive: sampleMat.emissive.getHex() };
                group.add(elGroup);
                sceneObjects.elementMap.set(symbol, elGroup);
            });
            group.position.y = 0; // Adjust if needed
            scene.add(group);
            return group;
        }


        function createBackgroundParticles() { /* ... (keep existing or similar) ... */
            for (let i = 0; i < 50; i++) {
                const geometry = new THREE.SphereGeometry(Math.random() * 0.05 + 0.02, 8, 8);
                const material = new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.6 ? 0x4ECDC4 : (Math.random() > 0.3 ? 0x64B5F6 : 0xffffff),
                    transparent: true,
                    opacity: Math.random() * 0.4 + 0.2
                });
                const particle = new THREE.Mesh(geometry, material);
                particle.position.set(
                    (Math.random() - 0.5) * 30,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 30 - 10 // Biased towards back
                );
                particle.userData.velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.005,
                    (Math.random() - 0.5) * 0.005,
                    (Math.random() - 0.5) * 0.005
                );
                scene.add(particle);
            }
        }

        // --- Camera Animation Utility ---
        let cameraAnimation;
        function animateCameraTo(targetPosition, lookAtTarget, duration = 1500, onComplete = null) {
            if (cameraAnimation) cancelAnimationFrame(cameraAnimation);

            const startPosition = camera.position.clone();
            const startLookAt = new THREE.Vector3(); // Current lookAt
            camera.getWorldDirection(startLookAt).multiplyScalar(10).add(camera.position); // A bit hacky to get current lookAt point

            const finalLookAt = lookAtTarget.clone();
            let startTime = null;

            function animate(time) {
                if (startTime === null) startTime = time;
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI); // Ease in-out

                camera.position.lerpVectors(startPosition, targetPosition, easeProgress);

                const currentLookAt = new THREE.Vector3().lerpVectors(startLookAt, finalLookAt, easeProgress);
                camera.lookAt(currentLookAt);

                if (progress < 1) {
                    cameraAnimation = requestAnimationFrame(animate);
                } else {
                    cameraAnimation = null;
                    if (onComplete) onComplete();
                }
            }
            cameraAnimation = requestAnimationFrame(animate);
        }

        // --- Info Panel ---
        let infoPanelTimeout;
        function showInfoPanel(htmlContent, duration = null) {
            const panel = document.getElementById('info-panel');
            const textElement = panel.querySelector('.info-text');
            textElement.innerHTML = htmlContent;
            panel.classList.add('visible');

            if (infoPanelTimeout) clearTimeout(infoPanelTimeout);
            if (duration) {
                infoPanelTimeout = setTimeout(() => hideInfoPanel(), duration);
            }
        }

        function hideInfoPanel() {
            if (infoPanelTimeout) clearTimeout(infoPanelTimeout);
            document.getElementById('info-panel').classList.remove('visible');
        }

        // --- Highlighting ---
        let currentHighlightedObject = null;
        function highlightObject(object, glow = true) {
            if (currentHighlightedObject && currentHighlightedObject.userData.sphere) {
                 currentHighlightedObject.userData.sphere.material.emissive.setHex(currentHighlightedObject.userData.originalEmissive || 0x000000);
            }
            currentHighlightedObject = null;

            if (object && object.children && object.children.length > 0) {
                const sphere = object.children.find(child => child.geometry.type === 'SphereGeometry'); // Assuming the main part is a sphere
                if (sphere) {
                    object.userData.sphere = sphere; // cache it
                    object.userData.originalEmissive = sphere.material.emissive.getHex();
                    sphere.material.emissive.setHex(0x4ECDC4); // Highlight color
                    currentHighlightedObject = object;
                }
            }
        }
        function clearHighlight() {
             if (currentHighlightedObject && currentHighlightedObject.userData.sphere) {
                 currentHighlightedObject.userData.sphere.material.emissive.setHex(currentHighlightedObject.userData.originalEmissive || 0x000000);
            }
            currentHighlightedObject = null;
        }


        // --- PROPERTIES ANIMATION ---
        async function animateProperties() {
            if (isAnimatingGlobal) return;
            isAnimatingGlobal = true;
            showInfoPanel('Exploring element properties...');

            const elementsToFeature = ['O', 'H', 'He', 'U'];
            const originalCameraPos = camera.position.clone();
            const originalLookAt = new THREE.Vector3(0,0,0); // Assuming initial lookAt is origin

            for (const symbol of elementsToFeature) {
                const elementObj = sceneObjects.elementMap.get(symbol);
                if (!elementObj) continue;

                const elData = elementDataStore[symbol];
                highlightObject(elementObj);

                const targetCamPos = elementObj.position.clone().add(new THREE.Vector3(0, 1, 3)); // Adjust camera offset
                await new Promise(resolve => animateCameraTo(targetCamPos, elementObj.position, 1200, resolve));

                showInfoPanel(
                    \`<strong>\${elData.name} (\${elData.symbol})</strong><br>
                    Atomic Number: \${elData.atomicNumber}<br>
                    Atomic Mass: \${elData.atomicMass}<br>
                    <em>\${elData.description}</em>\`
                );
                await new Promise(resolve => setTimeout(resolve, 3500)); // Time to read
                clearHighlight();
            }

            showInfoPanel('Properties exploration complete. Returning to main view.', 2000);
            animateCameraTo(originalCameraPos, originalLookAt, 1500, () => {
                isAnimatingGlobal = false;
            });
        }

        // --- COMPOSITION ANIMATION ---
        let compositionElements = [];
        async function animateComposition() {
            if (isAnimatingGlobal) return;
            isAnimatingGlobal = true;
            showInfoPanel('Analyzing chemical compositions...');

            compositionElements.forEach(el => scene.remove(el));
            compositionElements = [];

            const originalCameraPos = camera.position.clone();
            const originalLookAt = new THREE.Vector3(0,0,0);

            // 1. Water (H2O)
            const waterBottle = sceneObjects.water;
            highlightObject(waterBottle.children[0]); // Highlight bottle mesh itself
            let targetCamPosWater = waterBottle.position.clone().add(new THREE.Vector3(0, 1, 4));
            await new Promise(resolve => animateCameraTo(targetCamPosWater, waterBottle.position, 1200, resolve));
            showInfoPanel('Water (H₂O) is composed of Hydrogen and Oxygen.');

            const h1 = createFloatingAtom('H', elementDataStore['H'].color, waterBottle.position, new THREE.Vector3(-1, 0.5, 0.5));
            const h2 = createFloatingAtom('H', elementDataStore['H'].color, waterBottle.position, new THREE.Vector3(-1, -0.5, 0.5));
            const o = createFloatingAtom('O', elementDataStore['O'].color, waterBottle.position, new THREE.Vector3(1, 0, 0.5));
            compositionElements.push(h1, h2, o);
            scene.add(h1, h2, o);
            await new Promise(resolve => setTimeout(resolve, 3000));
            clearHighlight();

            // 2. Salt (NaCl)
            const saltShaker = sceneObjects.salt;
            highlightObject(saltShaker.children[0]);
            let targetCamPosSalt = saltShaker.position.clone().add(new THREE.Vector3(0, 1, 4));
            await new Promise(resolve => animateCameraTo(targetCamPosSalt, saltShaker.position, 1200, resolve));
            showInfoPanel('Table Salt (NaCl) is composed of Sodium and Chlorine.');

            const na = createFloatingAtom('Na', elementDataStore['Na'].color, saltShaker.position, new THREE.Vector3(-1, 0.3, 0.5));
            const cl = createFloatingAtom('Cl', elementDataStore['Cl'].color, saltShaker.position, new THREE.Vector3(1, 0.3, 0.5));
            compositionElements.push(na, cl);
            scene.add(na, cl);
            await new Promise(resolve => setTimeout(resolve, 3000));
            clearHighlight();

            showInfoPanel('Composition analysis complete. Returning to main view.', 2000);
            animateCameraTo(originalCameraPos, originalLookAt, 1500, () => {
                compositionElements.forEach(el => scene.remove(el));
                compositionElements = [];
                isAnimatingGlobal = false;
            });
        }

        function createFloatingAtom(symbol, color, originPosition, offsetPosition, scale = 0.4) {
            const group = new THREE.Group();
            const atomGeo = new THREE.SphereGeometry(scale, 16, 16);
            const atomMat = new THREE.MeshPhongMaterial({ color: color, shininess: 70 });
            const atomMesh = new THREE.Mesh(atomGeo, atomMat);
            group.add(atomMesh);

            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0,0,64,64); // Transparent background
            ctx.fillStyle = 'white'; ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center'; ctx.fillText(symbol, 32, 42);
            const labelTexture = new THREE.CanvasTexture(canvas);
            const labelMat = new THREE.SpriteMaterial({ map: labelTexture });
            const labelSprite = new THREE.Sprite(labelMat);
            labelSprite.scale.set(scale * 1.5, scale * 1.5 * (64/64), 1); // Adjust scale based on aspect
            labelSprite.position.y = scale * 1.5; // Position above atom
            group.add(labelSprite);

            group.position.copy(originPosition); // Start at origin
            // Animate to offset
            const targetPos = originPosition.clone().add(offsetPosition);
            animateObjectToTarget(group, targetPos, 1000);
            return group;
        }

        function animateObjectToTarget(object, targetPosition, duration) {
            const startPos = object.position.clone();
            let startTime = null;
            function anim(time) {
                if (startTime === null) startTime = time;
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
                object.position.lerpVectors(startPos, targetPosition, easeProgress);
                if (progress < 1) requestAnimationFrame(anim);
            }
            requestAnimationFrame(anim);
        }


        // --- STRUCTURE ANIMATION ---
        let atomicStructureVisuals = [];
        async function animateStructure() {
            if (isAnimatingGlobal) return;
            isAnimatingGlobal = true;

            atomicStructureVisuals.forEach(obj => scene.remove(obj));
            atomicStructureVisuals = [];

            const originalCameraPos = camera.position.clone();
            const originalLookAt = new THREE.Vector3(0,0,0); // Default lookAt

            // Focus on Helium for demonstration
            const elementSymbol = 'He';
            const elementObj = sceneObjects.elementMap.get(elementSymbol);
            const elData = elementDataStore[elementSymbol];

            if (!elementObj || !elData) {
                showInfoPanel('Could not find element for structure view.', 3000);
                isAnimatingGlobal = false;
                return;
            }

            showInfoPanel(\`Visualizing atomic structure of \${elData.name}...\`);
            highlightObject(elementObj);
            const focusPoint = elementObj.position.clone().add(new THREE.Vector3(0, 2, 0)); // Point above element
            const camPos = elementObj.position.clone().add(new THREE.Vector3(0, 2, 4)); // Camera slightly above and in front

            await new Promise(resolve => animateCameraTo(camPos, focusPoint, 1200, resolve));
            elementObj.visible = false; // Hide the sample

            // Create atomic structure (Helium: 2p, 2n, 2e)
            const nucleus = new THREE.Group();
            // Protons
            const protonGeo = new THREE.SphereGeometry(0.2, 16, 16);
            const protonMat = new THREE.MeshPhongMaterial({ color: 0xff0000 });
            const p1 = new THREE.Mesh(protonGeo, protonMat); p1.position.set(-0.15, 0, 0);
            const p2 = new THREE.Mesh(protonGeo, protonMat); p2.position.set(0.15, 0.05, 0.05);
            nucleus.add(p1, p2);
            // Neutrons
            const neutronGeo = new THREE.SphereGeometry(0.2, 16, 16);
            const neutronMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
            const n1 = new THREE.Mesh(neutronGeo, neutronMat); n1.position.set(0, -0.15, 0.05);
            const n2 = new THREE.Mesh(neutronGeo, neutronMat); n2.position.set(0.05, 0.1, -0.1);
            nucleus.add(n1, n2);

            nucleus.position.copy(focusPoint);
            scene.add(nucleus);
            atomicStructureVisuals.push(nucleus);

            // Electrons
            const electronGeo = new THREE.SphereGeometry(0.08, 16, 16);
            const electronMat = new THREE.MeshPhongMaterial({ color: 0x0000ff });
            const electrons = [];
            const orbitRadius = 1.5;
            for (let i = 0; i < 2; i++) {
                const electron = new THREE.Mesh(electronGeo, electronMat);
                electron.userData.angle = (i / 2) * Math.PI * 2 + Math.random() * 0.5; // Stagger start
                electron.userData.orbitSpeed = 0.01 + Math.random() * 0.005;
                electron.position.set(
                    Math.cos(electron.userData.angle) * orbitRadius,
                    0, // simple planar orbit for now
                    Math.sin(electron.userData.angle) * orbitRadius
                );
                nucleus.add(electron); // Add to nucleus group so they move with it
                electrons.push(electron);
                atomicStructureVisuals.push(electron); // Though they are children, good for direct removal
            }

            activeAnimations.structure = { nucleus, electrons, orbitRadius };

            showInfoPanel("Atomic structure (protons, neutrons, electrons) determines an element's chemical behavior and properties.", 6000);

            await new Promise(resolve => setTimeout(resolve, 6000)); // Display time

            activeAnimations.structure = null; // Stop electron animation
            atomicStructureVisuals.forEach(obj => scene.remove(obj)); // obj might be group or individual mesh
            atomicStructureVisuals = [];
            elementObj.visible = true; // Show sample again
            clearHighlight();

            showInfoPanel('Structure view complete. Returning to main view.', 2000);
            animateCameraTo(originalCameraPos, originalLookAt, 1500, () => {
                isAnimatingGlobal = false;
            });
        }


        // --- Menu Interaction ---
        function handleMenuClick(concept) {
            if (concept === currentConcept || isAnimatingGlobal) return;

            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.concept === concept) {
                    item.classList.add('active');
                }
            });
            currentConcept = concept;
            hideInfoPanel(); // Clear previous messages
            clearHighlight(); // Clear any existing highlights

            // Reset camera if a previous animation left it focused
            if (camera.position.distanceTo(new THREE.Vector3(0, 3, 12)) > 0.1) {
                 animateCameraTo(new THREE.Vector3(0, 3, 12), new THREE.Vector3(0,0,0), 800);
            }


            switch(concept) {
                case 'intro':
                    showInfoPanel('Welcome! Explore chemistry concepts by clicking the menu.', 4000);
                    // Potentially reset camera to default if it was moved
                    animateCameraTo(new THREE.Vector3(0, 3, 12), new THREE.Vector3(0,0,0), 1000);
                    break;
                case 'properties':
                    animateProperties();
                    break;
                case 'composition':
                    animateComposition();
                    break;
                case 'structure':
                    animateStructure();
                    break;
            }
            createParticleBurst(true); // Subtle burst
        }

        function createParticleBurst(subtle = false) { /* ... (keep existing or similar) ... */
            const count = subtle ? 10 : 20;
            const spread = subtle ? 1 : 2;
            const size = subtle ? 0.03 : 0.05;

            for (let i = 0; i < count; i++) {
                const geometry = new THREE.SphereGeometry(size, 8, 8);
                const material = new THREE.MeshBasicMaterial({
                    color: [0x4ECDC4, 0xFF6B6B, 0xFFD93D, 0x6BCF7F][Math.floor(Math.random() * 4)],
                    transparent: true, opacity: 0.9
                });
                const particle = new THREE.Mesh(geometry, material);
                particle.position.set( (Math.random() - 0.5) * spread, Math.random() * spread + 1, (Math.random() - 0.5) * spread );
                const velocity = new THREE.Vector3( (Math.random() - 0.5) * 0.1, Math.random() * 0.05 + 0.02, (Math.random() - 0.5) * 0.1 );
                particle.userData = { velocity, life: 1.0, isBurstParticle: true };
                scene.add(particle);
            }
        }


        // --- Animation Loop ---
        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();

            // Gentle rotation for scene items (if not focused by an animation)
            if (!isAnimatingGlobal) {
                if (sceneObjects.water) sceneObjects.water.rotation.y += 0.002;
                if (sceneObjects.salt) sceneObjects.salt.rotation.y += 0.002;
                if (sceneObjects.elementsGroup) sceneObjects.elementsGroup.rotation.y += 0.001;
            }

            // Animate background particles & burst particles
            scene.traverse((object) => {
                if (object.userData.velocity) {
                    object.position.addScaledVector(object.userData.velocity, delta * 20); // Adjust multiplier for speed

                    if (object.userData.isBurstParticle) {
                        object.userData.velocity.y -= 0.002; // Gravity for burst
                        object.userData.life -= delta * 0.8;
                        object.material.opacity = Math.max(0, object.userData.life);
                        if (object.userData.life <= 0) scene.remove(object);
                    } else { // Background particles
                        if (Math.abs(object.position.x) > 15) object.position.x = -object.position.x;
                        if (Math.abs(object.position.y) > 10) object.position.y = -object.position.y;
                        if (Math.abs(object.position.z) > 15) object.position.z = -object.position.z;
                    }
                }
            });

            // Electron orbits for Structure animation
            if (activeAnimations.structure && activeAnimations.structure.electrons) {
                const { electrons, nucleus, orbitRadius } = activeAnimations.structure;
                electrons.forEach(e => {
                    e.userData.angle += e.userData.orbitSpeed;
                    e.position.set(
                        Math.cos(e.userData.angle) * orbitRadius,
                        Math.sin(e.userData.angle * 0.7) * orbitRadius * 0.3, // Slight wobble on Y
                        Math.sin(e.userData.angle) * orbitRadius
                    );
                });
                nucleus.rotation.y += 0.005; // Gently rotate nucleus
            }


            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => handleMenuClick(item.dataset.concept));
        });

        window.addEventListener('message', (event) => {
            // Existing message handling
        });

        window.addEventListener('load', () => {
            setTimeout(() => {
                initThreeJS();
                animate();
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'animationReady', animation: 'chemistry-explorer'
                    }));
                }
            }, 200); // Slight delay for assets
        });
    </script>
</body>
</html>
`
};
