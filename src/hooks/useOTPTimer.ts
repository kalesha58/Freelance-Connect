import { useState, useEffect, useCallback, useRef } from 'react';

const useOTPTimer = (initialTime: number = 30) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isExpired, setIsExpired] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const start = useCallback(() => {
        setIsExpired(false);
        setTimeLeft(initialTime);

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [initialTime]);

    useEffect(() => {
        start();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [start]);

    const restart = useCallback(() => {
        start();
    }, [start]);

    return { timeLeft, isExpired, restart };
};

export default useOTPTimer;
