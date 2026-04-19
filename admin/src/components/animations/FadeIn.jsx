import React, { useState, useEffect } from 'react';

const FadeIn = ({ children, delay = 0, duration = 1000, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div 
            className={`transition-opacity ease-out ${className}`}
            style={{ 
                opacity: isVisible ? 1 : 0, 
                transitionDuration: `${duration}ms` 
            }}
        >
            {children}
        </div>
    );
};

export default FadeIn;
