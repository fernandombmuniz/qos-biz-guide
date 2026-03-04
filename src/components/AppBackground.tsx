import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const AppBackground = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -40]);

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden bg-[#020617] bg-dashboard-animate">
            <motion.div
                style={{ y }}
                className="absolute inset-0 pointer-events-none h-[120%]"
            >
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.06" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </motion.div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.4)_100%)] pointer-events-none" />
        </div>
    );
};

export default AppBackground;
