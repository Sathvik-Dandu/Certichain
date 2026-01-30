import React, { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CinematicHero = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);


    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });


    useEffect(() => {
        const loadImages = async () => {
            const loadedImages = [];

            // First try to import from src assets (works when images are inside src/assets)
            try {
                const modules = import.meta.glob('../assets/hero-sequence/*.jpg', { eager: true, as: 'url' });
                const keys = Object.keys(modules).sort();
                for (const path of keys) {
                    const src = modules[path];
                    await new Promise((resolve) => {
                        const img = new Image();
                        img.src = src;
                        img.onload = () => {
                            loadedImages.push(img);
                            resolve();
                        };
                        img.onerror = () => resolve();
                    });
                }
            } catch (e) {
                // ignore and fall through to public fallback
            }

            // If nothing loaded, try to load from public folder (/hero-sequence/...)
            if (loadedImages.length === 0) {
                const maxFrames = 40; // conservative default
                for (let i = 1; i <= maxFrames; i++) {
                    const idx = String(i).padStart(3, '0');
                    const filename = `ezgif-frame-${idx}.jpg`;
                    const src = `/hero-sequence/${filename}`;
                    // attempt to load image from public
                    await new Promise((resolve) => {
                        const img = new Image();
                        img.src = src;
                        img.onload = () => {
                            loadedImages.push(img);
                            resolve();
                        };
                        img.onerror = () => resolve();
                    });
                }
            }

            setImages(loadedImages);
            setIsLoaded(true);
        };

        loadImages();
    }, []);


    useEffect(() => {
        if (!isLoaded || images.length === 0) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');

        let animationFrameId;

        const renderLoop = () => {

            const scrollY = window.scrollY;
            const containerTop = container.offsetTop;
            const containerHeight = container.offsetHeight;
            const windowHeight = window.innerHeight;


            const startScroll = containerTop;
            const endScroll = containerTop + containerHeight - windowHeight;

            let progress = (scrollY - startScroll) / (endScroll - startScroll);
            progress = Math.min(Math.max(progress, 0), 1);


            const totalFrames = images.length;
            const frameIndex = Math.min(
                Math.floor(progress * totalFrames),
                totalFrames - 1
            );


            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }



            if (frameIndex >= 0 && frameIndex < totalFrames) {
                const img = images[frameIndex];
                if (img) {
                    const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
                    const centerShift_x = (canvas.width - img.width * ratio) / 2;
                    const centerShift_y = (canvas.height - img.height * ratio) / 2;

                    ctx.drawImage(
                        img,
                        0, 0, img.width, img.height,
                        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
                    );
                }
            }


            animationFrameId = requestAnimationFrame(renderLoop);
        };


        animationFrameId = requestAnimationFrame(renderLoop);

        return () => cancelAnimationFrame(animationFrameId);
    }, [isLoaded, images]);

    return (
        <div
            ref={containerRef}
            className="cinematic-container"
            style={{ height: '400vh', position: 'relative' }}
        >
            <div className="sticky-wrapper" style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
                <canvas
                    ref={canvasRef}
                    style={{
                        display: 'block',
                        width: '100%',
                        height: '100%'
                    }}
                />

                <div className="scan-overlay"></div>


                <motion.div
                    className="hero-overlay-stage centered"
                    style={{
                        opacity: useTransform(scrollYProgress, [0, 0.20, 0.25], [1, 1, 0]),
                        y: useTransform(scrollYProgress, [0, 0.25], [0, -50])
                    }}
                >
                    <div className="hero-glass-card">
                        <h1 className="cinematic-title">
                            Secure. Verifiable. <br />
                            <span className="text-gradient">Tamper-Proof.</span>
                        </h1>
                    </div>
                </motion.div>


                <motion.div
                    className="hero-overlay-stage left-aligned"
                    style={{
                        opacity: useTransform(scrollYProgress, [0.25, 0.30, 0.50, 0.55], [0, 1, 1, 0]),
                        x: useTransform(scrollYProgress, [0.25, 0.35], [-50, 0])
                    }}
                >
                    <div className="hero-glass-card">
                        <h2 className="cinematic-subtitle-large">
                            Instant Authentication.
                        </h2>
                    </div>
                </motion.div>


                <motion.div
                    className="hero-overlay-stage right-aligned"
                    style={{
                        opacity: useTransform(scrollYProgress, [0.55, 0.60, 0.80, 0.85], [0, 1, 1, 0]),
                        x: useTransform(scrollYProgress, [0.55, 0.65], [50, 0])
                    }}
                >
                    <div className="hero-glass-card">
                        <h2 className="cinematic-subtitle-large text-right">
                            Blockchain <br /> Anchored.
                        </h2>
                    </div>
                </motion.div>


                <motion.div
                    className="hero-overlay-stage centered"
                    style={{
                        opacity: useTransform(scrollYProgress, [0.85, 0.90], [0, 1]),
                        scale: useTransform(scrollYProgress, [0.85, 0.95], [0.8, 1]),
                        pointerEvents: useTransform(scrollYProgress, (v) => v > 0.9 ? 'auto' : 'none')
                    }}
                >
                    <div className="hero-glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="verified-badge">
                            <span className="icon">✓</span> Verified Secure
                        </div>
                        <div className="hero-actions mt-8" style={{ marginTop: '2rem' }}>
                            <button onClick={() => navigate("/verify")} className="btn btn-primary btn-lg glow">
                                Verify Now
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style jsx="true">{`
                .text-gradient {
                    background: linear-gradient(135deg, var(--secondary), var(--accent));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .cinematic-title {
                    font-size: 2.8rem;
                    font-weight: 800;
                    color: white;
                    text-align: center;
                    margin-bottom: 0;
                    text-shadow: 0 4px 10px rgba(0,0,0,0.3);
                }

                .cinematic-subtitle-large {
                    font-size: 2rem;
                    font-weight: 700;
                    color: white;
                    text-shadow: 0 4px 10px rgba(0,0,0,0.3);
                    line-height: 1.1;
                }

                .hero-glass-card {
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    padding: 1.25rem 1.75rem;
                    border-radius: 18px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.45);
                }

                .hero-overlay-stage {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    z-index: 10;
                    padding: 4rem;
                    pointer-events: none;
                }

                .hero-overlay-stage.centered {
                    align-items: center;
                    justify-content: center;
                }

                .hero-overlay-stage.left-aligned {
                    align-items: flex-start;
                    justify-content: center;
                    padding-left: 10%;
                }

                .hero-overlay-stage.right-aligned {
                    align-items: flex-end;
                    justify-content: center;
                    padding-right: 10%;
                    text-align: right;
                }

                .text-right {
                    text-align: right;
                }

                .scan-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(to bottom, 
                        rgba(0, 0, 0, 0.4) 0%, 
                        rgba(0, 0, 0, 0.2) 100%
                    );
                    pointer-events: none;
                    z-index: 5;
                }

                .scan-overlay::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 20%;
                    background: linear-gradient(to bottom, 
                        rgba(0, 180, 216, 0) 0%, 
                        rgba(0, 180, 216, 0.05) 50%, 
                        rgba(0, 180, 216, 0) 100%
                    );
                    animation: scan 3s linear infinite;
                }

                @keyframes scan {
                    0% { top: -20%; }
                    100% { top: 120%; }
                }

                .btn.glow {
                    box-shadow: 0 0 20px rgba(0, 180, 216, 0.5);
                    border: 1px solid rgba(255,255,255,0.2);
                    pointer-events: auto;
                }

                .verified-badge {
                    background: rgba(76, 175, 80, 0.2);
                    border: 1px solid var(--success);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 50px;
                    font-size: 1.5rem;
                    font-weight: bold;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 0 30px rgba(76, 175, 80, 0.4);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                @media (max-width: 768px) {
                    .cinematic-title {
                        font-size: 1.8rem;
                    }
                    .cinematic-subtitle-large {
                        font-size: 1.2rem;
                    }
                    .hero-glass-card {
                        padding: 1rem;
                        width: 90%;
                        border-radius: 12px;
                    }
                    .verified-badge {
                        font-size: 1rem;
                        padding: 0.6rem 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default CinematicHero;
