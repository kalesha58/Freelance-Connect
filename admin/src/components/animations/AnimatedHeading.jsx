import React, { useState, useEffect } from 'react';

const AnimatedHeading = ({ text, className = "", style = {} }) => {
    const [isStarted, setIsStarted] = useState(false);
    const charDelay = 30;
    const initialDelay = 200;
    const transitionDuration = 500;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsStarted(true);
        }, initialDelay);
        return () => clearTimeout(timer);
    }, []);

    const lines = text.split('\n');

    return (
        <h1 className={className} style={{ ...style, lineHeight: 1.1 }}>
            {lines.map((line, lineIndex) => {
                const prevLinesLength = lines.slice(0, lineIndex).join('').length;
                
                return (
                    <div key={lineIndex} style={{ display: 'block' }}>
                        {line.split('').map((char, charIndex) => {
                            const delay = (prevLinesLength * charDelay) + (charIndex * charDelay);
                            
                            return (
                                <span
                                    key={charIndex}
                                    style={{
                                        display: 'inline-block',
                                        opacity: isStarted ? 1 : 0,
                                        transform: isStarted ? 'translateX(0)' : 'translateX(-18px)',
                                        transition: `opacity ${transitionDuration}ms ease-out, transform ${transitionDuration}ms ease-out`,
                                        transitionDelay: `${delay}ms`,
                                        whiteSpace: 'pre'
                                    }}
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                </span>
                            );
                        })}
                    </div>
                );
            })}
        </h1>
    );
};

export default AnimatedHeading;
