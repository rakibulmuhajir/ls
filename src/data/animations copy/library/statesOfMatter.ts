// src/data/animations/library/statesOfMatter.ts
import { AnimationConfig } from '../types';
import { baseAnimationTemplate } from './baseAnimationTemplate';

export const statesOfMatter: AnimationConfig = {
  height: 350,
  autoPlay: true,
  loop: true,
  features: {
    temperature: true,
    zoom: true,
    speed: true,
    particleCount: true
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
    <script>
        // States of Matter specific animation code
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 15;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        // Create particles for each state
        const particles = [];
        const particleGeometry = new THREE.SphereGeometry(0.3, 16, 16);

        // Create particle grid
        for (let i = 0; i < 200; i++) {
            const material = new THREE.MeshPhongMaterial({
                color: 0x3498db,
                emissive: 0x2980b9,
                emissiveIntensity: 0.2
            });
            const particle = new THREE.Mesh(particleGeometry, material);
            particle.userData.basePosition = new THREE.Vector3(
                (i % 10 - 5) * 1.5,
                (Math.floor(i / 10) % 10 - 5) * 1.5,
                (Math.floor(i / 100) - 1) * 1.5
            );
            particle.position.copy(particle.userData.basePosition);
            scene.add(particle);
            particles.push(particle);
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        scene.add(directionalLight);

        // Handle control updates
        window.handleControlUpdate = (control, value) => {
            if (control === 'temperature') {
                // Update particle colors based on temperature
                particles.forEach(p => {
                    p.material.color.setHex(AnimationUtils.getTemperatureColor(value));
                });
            }
            if (control === 'zoom') {
                AnimationUtils.applyZoom(camera, value);
            }
            if (control === 'particleCount') {
                AnimationUtils.updateParticleCount(particles, value);
            }
        };

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            if (animationState.isPlaying) {
                const time = Date.now() * 0.001 * animationState.speed;
                const temp = animationState.temperature;

                particles.forEach((particle, i) => {
                    if (!particle.visible) return;

                    const basePos = particle.userData.basePosition;

                    if (temp < 0) {
                        // Solid state - vibrate in place
                        particle.position.x = basePos.x + Math.sin(time * 2 + i) * 0.1;
                        particle.position.y = basePos.y + Math.cos(time * 2 + i) * 0.1;
                        particle.position.z = basePos.z;
                    } else if (temp < 100) {
                        // Liquid state - flow but stay close
                        const flowSpeed = temp / 100;
                        particle.position.x = basePos.x + Math.sin(time + i) * flowSpeed;
                        particle.position.y = basePos.y + Math.cos(time + i) * flowSpeed;
                        particle.position.z = basePos.z + Math.sin(time * 0.5 + i) * flowSpeed * 0.5;
                    } else {
                        // Gas state - random motion
                        const speed = AnimationUtils.getParticleSpeed(temp);
                        particle.position.x += (Math.random() - 0.5) * speed * 50;
                        particle.position.y += (Math.random() - 0.5) * speed * 50;
                        particle.position.z += (Math.random() - 0.5) * speed * 50;

                        // Boundary check
                        if (Math.abs(particle.position.x) > 20) particle.position.x *= -0.9;
                        if (Math.abs(particle.position.y) > 20) particle.position.y *= -0.9;
                        if (Math.abs(particle.position.z) > 20) particle.position.z *= -0.9;
                    }
                });

                if (animationState.rotation3D) {
                    scene.rotation.y += 0.005 * animationState.speed;
                }
            }

            renderer.render(scene, camera);
        }

        // Initialize controls
        window.handleControlUpdate('temperature', animationState.temperature);
        window.handleControlUpdate('zoom', animationState.zoom);
        window.handleControlUpdate('particleCount', animationState.particleCount);

        animate();
    </script>
  </body>
  </html>
`
};
