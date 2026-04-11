document.addEventListener("DOMContentLoaded", () => {
    // Ensure GSAP and ScrollTrigger are available
    gsap.registerPlugin(ScrollTrigger);

    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;

    // --- THREE.JS SETUP ---
    const scene = new THREE.Scene();

    // Add subtle fog to blend into background
    scene.fog = new THREE.FogExp2(0x050505, 0.02);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xff4500, 2); // Orange tint
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0x22c55e, 1.5); // Green tint
    dirLight2.position.set(-10, 10, -10);
    scene.add(dirLight2);

    // --- ABSTRACT KEYBOARD GEOMETRY ---
    const keysGroup = new THREE.Group();
    const rows = 5;
    const cols = 15;
    const keySize = 1.2;
    const gap = 0.2;

    // Dark sleek material for keys
    const material = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.2,
        metalness: 0.8
    });

    const geometry = new THREE.BoxGeometry(keySize, keySize * 0.4, keySize);
    const allKeys = []; // Keep references for animations

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            // Give some randomness inside the grid for a tech vibe
            if (Math.random() > 0.9) continue;

            const key = new THREE.Mesh(geometry, material.clone());

            // Randomly assign emissive color to select keys
            if (Math.random() > 0.95) {
                key.material.emissive = new THREE.Color(0xff4500);
                key.material.emissiveIntensity = 2;
            } else if (Math.random() > 0.95) {
                key.material.emissive = new THREE.Color(0x22c55e);
                key.material.emissiveIntensity = 1.5;
            }

            const x = (j - cols / 2) * (keySize + gap);
            const z = (i - rows / 2) * (keySize + gap);
            const y = 0;

            key.position.set(x, y, z);

            // Save initial position for restoring later
            key.userData = {
                originalPos: { x, y, z },
                randomOffset: {
                    x: (Math.random() - 0.5) * 20,
                    y: Math.random() * 20,
                    z: (Math.random() - 0.5) * 20
                },
                randomRotation: {
                    x: Math.random() * Math.PI * 2,
                    y: Math.random() * Math.PI * 2,
                    z: Math.random() * Math.PI * 2
                }
            };

            keysGroup.add(key);
            allKeys.push(key);
        }
    }

    // Initial positioning of keyboard (like it's lying on a desk)
    keysGroup.rotation.x = Math.PI / 8;
    scene.add(keysGroup);

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();

        // Add subtle floating effect to entire group
        keysGroup.position.y = Math.sin(time * 0.5) * 0.5;

        renderer.render(scene, camera);
    }
    animate();

    // --- GSAP SCROLL ANIMATIONS ---

    // We animate the keys directly based on scroll
    // As we scroll down, the keyboard rotates up and explodes apart slightly

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: document.querySelector(".scroll-container") || document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
        }
    });

    // 1. Rotate the whole keyboard group to face the camera more
    tl.to(keysGroup.rotation, {
        x: Math.PI / 2,
        z: Math.PI / 4,
        ease: "none"
    }, 0);

    // 2. Move camera slightly
    tl.to(camera.position, {
        z: 10,
        y: 5,
        ease: "none"
    }, 0);

    // 3. Explode keys randomly based on their userData properties
    allKeys.forEach((key, i) => {
        tl.to(key.position, {
            x: key.userData.originalPos.x + key.userData.randomOffset.x * 0.5,
            y: key.userData.originalPos.y + key.userData.randomOffset.y * 0.5,
            z: key.userData.originalPos.z + key.userData.randomOffset.z * 0.5,
            ease: "power1.inOut"
        }, 0);

        tl.to(key.rotation, {
            x: key.userData.randomRotation.x,
            y: key.userData.randomRotation.y,
            z: key.userData.randomRotation.z,
            ease: "power1.inOut"
        }, 0);
    });

    // --- ADVANCED SECTION ANIMATIONS ---
    const panels = document.querySelectorAll('.panel');
    panels.forEach((panel) => {
        const title = panel.querySelector('.title');
        if (title) {
            // Un-bind from strict CSS transition
            title.style.transition = 'none';
            gsap.fromTo(title,
                { x: -100, opacity: 0, scale: 0.8 },
                {
                    x: 0, opacity: 1, scale: 1,
                    scrollTrigger: {
                        trigger: panel,
                        start: "top 85%",
                        end: "top 50%",
                        scrub: 1.5
                    }
                }
            );
        }

        // Apply a gentle parallax to the grid containers themselves
        const container = panel.querySelector('.container-faculties, .container-students');
        if (container) {
            gsap.fromTo(container,
                { y: 120 },
                {
                    y: -80,
                    scrollTrigger: {
                        trigger: panel,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1.5
                    }
                }
            );
        }
    });

    // --- 3D TILT EFFECT ON CARDS ---
    const allCards = document.querySelectorAll('.card, .student-card');

    allCards.forEach(card => {
        gsap.set(card, { transformPerspective: 1000 });

        card.addEventListener('mouseenter', () => {
            // Strip CSS transition so GSAP can take over transform instantly without lag
            card.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease, background 0.4s ease';

            gsap.to(card, {
                y: -12,
                scale: 1.03,
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

            // Tilt limit config (degrees)
            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.3, // snappy tracking
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
                    // Restore original css transitions after snap back finishes
                    card.style.transition = '';
                }
            });
        });
    });

    // Resize handler
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});

