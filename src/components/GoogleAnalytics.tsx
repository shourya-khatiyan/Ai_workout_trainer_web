import { useEffect } from 'react';

declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[]) => void;
    }
}

/**
 * injects the google analytics gtag script and initializes tracking.
 * reads measurement id from VITE_GA_MEASUREMENT_ID env var.
 */
const GoogleAnalytics = () => {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

    useEffect(() => {
        if (!measurementId) return;

        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        script.async = true;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag(...args: unknown[]) {
            window.dataLayer.push(args);
        };
        window.gtag('js', new Date());
        window.gtag('config', measurementId);

        return () => {
            document.head.removeChild(script);
        };
    }, [measurementId]);

    return null;
};

export default GoogleAnalytics;
