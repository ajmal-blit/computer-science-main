document.addEventListener("DOMContentLoaded", () => {
    // Ensure GSAP and ScrollTrigger are available
    gsap.registerPlugin(ScrollTrigger);

    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;

    // --- THREE.JS SETUP: PHOTOREALISTIC ENGINE ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.012); 

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 18, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(document.documentElement.clientWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Photorealistic Rendering Settings
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic color grading
    renderer.toneMappingExposure = 1.1;

    // --- STUDIO LIGHTING SETUP ---
    // Hemisphere light mimics sky/ground light bouncing
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x0f172a, 0.8); // Boosted ambient light
    scene.add(hemiLight);

    // Main key light (Directional is much safer and guarantees the keyboard is hit)
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(15, 40, 20);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    // Rose Underglow
    const roseLight = new THREE.PointLight(0xf43f5e, 15, 50); // Brighter underglow
    roseLight.position.set(-5, 2, -5);
    scene.add(roseLight);

    // Cyan Accent Light for subtle chassis reflection
    const cyanAccent = new THREE.PointLight(0x00e5ff, 25, 60); 
    cyanAccent.position.set(15, 10, 15); // Front-right position to catch the metallic edge
    scene.add(cyanAccent);

    // --- PREMIUM MATERIALS ---
    // Hyper-realistic textured double-shot PBT plastic
    const matWhite = new THREE.MeshStandardMaterial({ 
        color: 0xe2e8f0, // Slightly off-white slate for physical realism
        roughness: 0.7,  // PBT is heavily textured, not shiny
        metalness: 0.0
    });
    
    const matRose = new THREE.MeshStandardMaterial({ 
        color: 0xe11d48, // Deep mechanical rose
        roughness: 0.7,
        metalness: 0.0
    });
    
    // Heavy Anodized Aluminum Plate
    const matPlate = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        roughness: 0.4, // Increased roughness so it doesn't render pitch black
        metalness: 0.6  
    });

    // Cherry MX Red Switch Material
    const matSwitchHousing = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });
    const matSwitchStem = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 }); 

    // --- KEYBOARD CONSTRUCTION ---
    const masterGroup = new THREE.Group();
    const rows = 5; 
    const cols = 16;
    const keySize = 1.2;
    const gap = 0.25;

    // Keyboard layout for labels
    const keyLayout = [
        ['ESC', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'DEL', '', ''],
        ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'BACKSPACE', '', ''],
        ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\', '', ''],
        ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER', '', '', ''],
        ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT', '', '', '', '']
    ];

    // 1. Mechanical Keyboard Chassis (Thick Case)
    const casePadding = 1.2;
    const baseWidth = (cols * (keySize + gap)) + casePadding;
    const baseDepth = (rows * (keySize + gap)) + casePadding;
    const caseGeo = new THREE.BoxGeometry(baseWidth, 1.2, baseDepth);
    const keyboardCase = new THREE.Mesh(caseGeo, matPlate);
    keyboardCase.position.y = -0.4; // Top surface sits at Y = +0.2
    keyboardCase.receiveShadow = true;
    keyboardCase.castShadow = true;
    masterGroup.add(keyboardCase);

    // Inner plate where switches mount
    const innerPlateGeo = new THREE.BoxGeometry(baseWidth - 0.8, 0.1, baseDepth - 0.8);
    const matInnerPlate = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.5, metalness: 0.8 }); // More reflective for RGB bounce
    const innerPlate = new THREE.Mesh(innerPlateGeo, matInnerPlate);
    innerPlate.position.y = 0.6; // Sit perfectly on top of chassis
    keyboardCase.add(innerPlate);

    // 2. Ultra-Realistic Keycap Geometry (OEM Profile with Cylindrical Scoop)
    const keycapHeight = 0.48;
    const keyBaseWidth = keySize * 0.96; // 96% width leaves a tight, realistic gap between keys
    const topWidth = keySize * 0.70;  // Tapered top for typing comfort
    
    // Vertex-Morphed Box Geometry to create the concave scoop
    const keyGeo = new THREE.BoxGeometry(keyBaseWidth, keycapHeight, keyBaseWidth, 16, 1, 16);
    const pos = keyGeo.attributes.position;
    
    for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);
        
        if (y > 0) {
            const xRatio = x / (keyBaseWidth / 2);
            const zRatio = z / (keyBaseWidth / 2);
            
            x = xRatio * (topWidth / 2);
            z = zRatio * (topWidth / 2);
            
            // MATHEMATICAL SCOOP: Concave cylindrical dip matching finger profiles
            const dip = Math.cos((x / (topWidth / 2)) * Math.PI / 2) * 0.08;
            y -= dip;
            
            pos.setX(i, x);
            pos.setY(i, y);
            pos.setZ(i, z);
        }
    }
    keyGeo.computeVertexNormals(); // Recompute lighting for smooth curves

    // Reusable decal geometry mathematically curved to perfectly match the keycap's scoop
    const decalGeo = new THREE.PlaneGeometry(topWidth * 0.85, topWidth * 0.85, 16, 1);
    const dPos = decalGeo.attributes.position;
    for(let i = 0; i < dPos.count; i++) {
        const dx = dPos.getX(i);
        const dip = Math.cos((dx / (topWidth / 2)) * Math.PI / 2) * 0.08;
        dPos.setZ(i, -dip); // Bend the plane down into the valley
    }
    decalGeo.computeVertexNormals();

    // 3. Switch Geometries
    // Cherry-MX style stem for a more "mechanical" look
    const stemHeight = 0.4;
    const stemW = 0.08; 
    const stemT = 0.22; 

    const stemShape = new THREE.Shape();
    stemShape.moveTo(-stemW, -stemT);
    stemShape.lineTo(stemW, -stemT);
    stemShape.lineTo(stemW, -stemW);
    stemShape.lineTo(stemT, -stemW);
    stemShape.lineTo(stemT, stemW);
    stemShape.lineTo(stemW, stemW);
    stemShape.lineTo(stemW, stemT);
    stemShape.lineTo(-stemW, stemT);
    stemShape.lineTo(-stemW, stemW);
    stemShape.lineTo(-stemT, stemW);
    stemShape.lineTo(-stemT, -stemW);
    stemShape.lineTo(-stemW, -stemW);
    stemShape.closePath();

    const stemExtrudeSettings = {
        steps: 1,
        depth: stemHeight,
        bevelEnabled: true, // Smooth edges on the cross
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelSegments: 2
    };
    const stemGeo = new THREE.ExtrudeGeometry(stemShape, stemExtrudeSettings);
    stemGeo.rotateX(-Math.PI / 2); // Orient to stand up
    stemGeo.translate(0, stemHeight / 2, 0); // Move base to origin

    const housingGeo = new THREE.BoxGeometry(keySize * 0.65, 0.35, keySize * 0.65);
    const ringGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.4, 16); // The central switch ring

    const allKeycaps = []; 
    const interactableKeys = [];
    const rgbRings = []; // Array to hold our per-key glowing RGB elements

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            
            const x = (j - cols / 2) * (keySize + gap) + (keySize / 2);
            const z = (i - rows / 2) * (keySize + gap) + (keySize / 2);
            
            // Build the Mechanical Switch (stays on the board)
            const switchGroup = new THREE.Group();
            switchGroup.position.set(x, 0.2, z);
            
            const housing = new THREE.Mesh(housingGeo, matSwitchHousing);
            housing.castShadow = true;
            housing.receiveShadow = true;
            switchGroup.add(housing);

            // Dedicated glowing ring for per-key RGB wave effect
            const ringMat = new THREE.MeshStandardMaterial({
                color: 0x000000,
                emissive: 0x000000,
                emissiveIntensity: 2, // High intensity for a vibrant neon glow
                roughness: 0.2
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.y = 0.05;
            ring.userData = { gridX: j }; // Store the column index for the wave math
            switchGroup.add(ring);
            rgbRings.push(ring);

            const stem = new THREE.Mesh(stemGeo, matSwitchStem);
            stem.position.y = 0.15;
            stem.castShadow = true;
            switchGroup.add(stem);
            
            masterGroup.add(switchGroup);

            // Build the Keycap (this will explode off the switch)
            const label = (keyLayout[i] && keyLayout[i][j]) ? keyLayout[i][j] : '';
            const isModifier = label.length > 1 || j === 0 || j === cols - 2 || j === cols - 1 || i === rows - 1;
            const isRose = isModifier && Math.random() > 0.4;
            const baseMat = isRose ? matRose : matWhite;

            // Build a wrapper group so GSAP and hover interactions don't fight
            const keycapWrapper = new THREE.Group();
            const startY = 0.6;
            keycapWrapper.position.set(x, startY, z);

            // Build the Solid Plastic Keycap Body
            const keycap = new THREE.Mesh(keyGeo, baseMat);
            keycap.castShadow = true;
            keycap.receiveShadow = true;
            keycap.userData = { targetY: 0 }; // Base height relative to wrapper
            keycapWrapper.add(keycap);

            // Add a clean label decal so the text doesn't turn the whole keycap black
            if (label) {
                const textColor = isRose ? '#f8fafc' : '#1e293b'; // White text on rose, dark on white
                
                const textCanvas = document.createElement('canvas');
                const size = 256; // Texture resolution
                textCanvas.width = size;
                textCanvas.height = size;
                const context = textCanvas.getContext('2d');

                context.clearRect(0, 0, size, size); // Transparent background

                // Adjust font size for longer labels
                let fontSize = 70;
                if (label.length > 1) fontSize = 40;
                if (label.length > 4) fontSize = 30;

                context.font = `bold ${fontSize}px Outfit, sans-serif`;
                context.fillStyle = textColor;
                context.textAlign = 'center';
                context.textBaseline = 'middle';

                // Left-align longer keys like 'SHIFT'
                if (label.length > 2) {
                    context.textAlign = 'left';
                    context.fillText(label, 20, size / 2);
                } else {
                    context.fillText(label, size / 2, size / 2);
                }

                const texture = new THREE.CanvasTexture(textCanvas);
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

                // Use StandardMaterial so the decal reacts to 3D lighting identically to the plastic keycap
                const labelMat = new THREE.MeshStandardMaterial({ 
                    map: texture, 
                    transparent: true,
                    roughness: 0.7,
                    metalness: 0.0
                });
                const labelMesh = new THREE.Mesh(decalGeo, labelMat);
                labelMesh.rotation.x = -Math.PI / 2; // Lie flat
                labelMesh.position.y = (keycapHeight / 2) + 0.002; // Hover 0.002 units above the scooped surface
                
                keycap.add(labelMesh);
            }
            
            // Save explosion vectors for GSAP (attached to the wrapper)
            keycapWrapper.userData = {
                originalPos: { x, y: startY, z },
                targetOffset: {
                    x: x * 1.4, // Engineering exploded schematic view
                    y: startY + 3.5 + (Math.random() * 1.5), // Float elegantly in organized layers
                    z: z * 1.4
                },
                targetRotation: {
                    x: (Math.random() - 0.5) * 0.4, // Subtle floaty tilt instead of wild spinning
                    y: (Math.random() - 0.5) * 0.4,
                    z: (Math.random() - 0.5) * 0.4
                }
            };

            masterGroup.add(keycapWrapper);
            allKeycaps.push(keycapWrapper);
            interactableKeys.push(keycap);
        }
    }

    // --- GLOWING DUST PARTICLES ---
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i+=3) {
        posArray[i] = (Math.random() - 0.5) * 35;       // X spread
        posArray[i+1] = (Math.random() * 25) - 5;       // Y spread (mostly above the board)
        posArray[i+2] = (Math.random() - 0.5) * 35;     // Z spread
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Create a circular gradient texture for soft glowing orbs
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 32;
    particleCanvas.height = 32;
    const pContext = particleCanvas.getContext('2d');
    const pGradient = pContext.createRadialGradient(16, 16, 0, 16, 16, 16);
    pGradient.addColorStop(0.1, 'rgba(255, 255, 255, 1)');   // Solid white core
    pGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)'); // Feathered edge
    pGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');   // Fully transparent
    pContext.fillStyle = pGradient;
    pContext.fillRect(0, 0, 32, 32);

    const particlesMat = new THREE.PointsMaterial({
        size: 0.8,
        map: new THREE.CanvasTexture(particleCanvas),
        transparent: true,
        opacity: 0, // Start invisible, fade in on scroll
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // NEW: Parallax Group to handle mouse movement without fighting GSAP
    const parallaxGroup = new THREE.Group();
    parallaxGroup.add(masterGroup);

    // Tilt the whole keyboard slightly towards the user
    masterGroup.rotation.x = Math.PI / 8; 
    scene.add(parallaxGroup); // Add the parent group to the scene

    // --- IDLE HOVER ANIMATION ---
    const clock = new THREE.Clock();
    const mouse = new THREE.Vector2(-1, -1); // Off-screen by default
    const raycaster = new THREE.Raycaster();
    let isExplosionComplete = false; // Flag to trigger the floating animation

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        // The whole board breathes slightly
        masterGroup.position.y = Math.sin(time * 1.5) * 0.3; 

        // Slowly rotate and drift the glowing dust
        particleSystem.rotation.y = time * 0.05;
        particleSystem.rotation.z = Math.sin(time * 0.2) * 0.05;
        
        // Pulse the cyan accent light reflection on the metal chassis
        cyanAccent.intensity = 25 + Math.sin(time * 2) * 15; // Smoothly breathes between 10 and 40 intensity
        
        // --- DYNAMIC PER-KEY RGB WAVE ---
        const waveSpeed = 0.15;
        
        // Animate individual switch rings in a sweeping wave
        rgbRings.forEach((ring) => {
            const waveHue = (time * waveSpeed + ring.userData.gridX * 0.05) % 1;
            ring.material.emissive.setHSL(waveHue, 1.0, 0.4);
        });

        // Sync the main underglow and dust to the center of the wave
        const centerHue = (time * waveSpeed + (cols / 2) * 0.05) % 1;
        roseLight.color.setHSL(centerHue, 1.0, 0.5);
        particlesMat.color.setHSL(centerHue, 1.0, 0.5); 
        
        // --- HOVER INTERACTION (RAYCASTING) ---
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactableKeys, false);
        
        interactableKeys.forEach(k => k.userData.targetY = 0); // Reset all to unpressed
        
        if (intersects.length > 0) {
            intersects[0].object.userData.targetY = -0.15; // Press the hovered key down
        }
        
        interactableKeys.forEach(k => {
            k.position.y += (k.userData.targetY - k.position.y) * 0.3; // Smooth spring physics
        });

        // Parallax effect: smoothly interpolate the group's rotation towards the mouse position
        const parallaxIntensity = 0.25; // How much the keyboard tilts
        const lerpFactor = 0.05; // How smoothly it follows the cursor
        parallaxGroup.rotation.y += ( (mouse.x * parallaxIntensity) - parallaxGroup.rotation.y ) * lerpFactor;
        parallaxGroup.rotation.x += ( (mouse.y * parallaxIntensity) - parallaxGroup.rotation.x ) * lerpFactor;

        // --- POST-EXPLOSION FLOATING ANIMATION ---
        if (isExplosionComplete) {
            const bobbleFrequency = 0.8;
            const bobbleAmplitude = 0.07;

            allKeycaps.forEach(cap => {
                const originalX = cap.userData.originalPos.x;
                const originalZ = cap.userData.originalPos.z;

                // Calculate a unique, smooth bobbing offset for each key based on its original position
                const yOffset = Math.sin(time * bobbleFrequency + originalX * 0.5) * bobbleAmplitude;
                const xOffset = Math.cos(time * bobbleFrequency * 0.8 + originalZ * 0.5) * bobbleAmplitude * 0.5;
                const zOffset = Math.sin(time * bobbleFrequency * 0.6 + originalX * 0.3) * bobbleAmplitude * 0.5;

                // Apply the bobbing offset to the final GSAP position, creating a gentle float
                cap.position.x = cap.userData.targetOffset.x + xOffset;
                cap.position.y = cap.userData.targetOffset.y + yOffset;
                cap.position.z = cap.userData.targetOffset.z + zOffset;
            });
        }

        renderer.render(scene, camera);
    }
    animate();

    // Mouse move listener for parallax
    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener('mousemove', onMouseMove);

    // --- GSAP AUTOMATIC EXPLOSION ON LOAD ---
    const scrollTriggerElem = document.querySelector(".scroll-container");

    // Only initialize animations if the trigger element exists (i.e., on the main page, not the login page)
    if (scrollTriggerElem) {
        const tl = gsap.timeline({
            paused: true, // Start paused so we can trigger it manually
            defaults: { duration: 2.5, ease: "power2.inOut" }, // Smooth easing for both play and reverse
            onComplete: () => {
                isExplosionComplete = true; // Set the flag when the explosion finishes
            },
            onReverseComplete: () => {
                isExplosionComplete = false; // Ensure floating is off when fully assembled
            }
        });

        // 1. Rotate entire board for a dramatic angle
        tl.to(masterGroup.rotation, {
            x: Math.PI / 2.5,
            y: Math.PI / 6,
            z: -Math.PI / 10
        }, 0);

        // 2. Detach keycaps to reveal the Red Switches underneath
        allKeycaps.forEach((cap) => {
            tl.to(cap.position, {
                x: cap.userData.targetOffset.x,
                y: cap.userData.targetOffset.y,
                z: cap.userData.targetOffset.z
            }, 0);

            tl.to(cap.rotation, {
                x: cap.userData.targetRotation.x,
                y: cap.userData.targetRotation.y,
                z: cap.userData.targetRotation.z
            }, 0);
        });

        // 3. Drop the heavy aluminum case/PCB away slightly
        tl.to(masterGroup.position, {
            z: -10 // Push it back into the fog
        }, 0);
        
        // 4. Fade in and drift the glowing dust particles
        tl.to(particlesMat, {
            opacity: 0.6 // Soft glow
        }, 0);
        
        tl.to(particleSystem.position, {
            y: 3 // Drift up slightly for a magical zero-gravity feel
        }, 0);

        // 5. Subtle camera zoom-out to show the full expanded view
        tl.to(camera.position, {
            y: 22, // Pan up slightly
            z: 32  // Pull back
        }, 0);

        // Play automatically on load after 1.5 seconds
        setTimeout(() => {
            tl.play();
        }, 1500);

        // Listen for scroll direction to re-assemble or re-explode dynamically
        ScrollTrigger.create({
            trigger: scrollTriggerElem,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
                if (self.direction === -1) {
                    // Scrolling UP -> Re-assemble
                    isExplosionComplete = false; // Stop floating immediately for a smooth snap-back
                    tl.reverse();
                } else if (self.direction === 1) {
                    // Scrolling DOWN -> Re-explode
                    tl.play();
                }
            }
        });

        // --- UI HTML ELEMENT REVEALS ---
        // Animate all panels that are NOT the about-us section
        const otherPanels = document.querySelectorAll('.panel:not(.about-us), .resource-section, .event-container, .post-query-card, .query-card');
        otherPanels.forEach((panel) => {
            gsap.fromTo(panel,
                { y: 80, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    scrollTrigger: {
                        trigger: panel,
                        start: "top 85%",
                        end: "top 50%",
                        scrub: 1
                    }
                }
            );
        });

        // Create a special animation for the About Us section to slide in from the left
        const aboutUsPanel = document.querySelector('.about-us');
        if (aboutUsPanel) {
            gsap.fromTo(aboutUsPanel,
                { x: -100, opacity: 0 }, // Start from the left
                {
                    x: 0, opacity: 1,
                    scrollTrigger: {
                        trigger: aboutUsPanel,
                        start: "top 85%",
                        end: "top 50%",
                        scrub: 1
                    }
                }
            );
        }
    }

    // --- ADVANCED 3D TILT EFFECT ON CARDS ---
    const allCards = document.querySelectorAll('.card, .student-card');

    allCards.forEach(card => {
        gsap.set(card, { transformPerspective: 1000 });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease, background 0.4s ease';
            gsap.to(card, {
                y: -10,
                scale: 1.02,
                duration: 0.4,
                ease: "power2.out",
                overwrite: "auto"
            });
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.3,
                ease: "power1.out",
                overwrite: "auto"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                y: 0,
                scale: 1,
                rotateX: 0,
                rotateY: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.4)",
                overwrite: "auto",
                onComplete: () => {
                    card.style.transition = '';
                }
            });
        });
    });

    // Responsive Canvas Resizing
    window.addEventListener("resize", () => {
        camera.aspect = document.documentElement.clientWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(document.documentElement.clientWidth, window.innerHeight);
    });
});
