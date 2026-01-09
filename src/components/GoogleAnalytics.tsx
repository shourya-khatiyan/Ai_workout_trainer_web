import { useEffect } from 'react';

const GA_MEASUREMENT_ID = 'G-YR0SG31L3J';

declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[]) => void;
    }
}

const GoogleAnalytics = () => {
    useEffect(() => {
        // Load the Google Analytics script
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        script.async = true;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag(...args: unknown[]) {
            window.dataLayer.push(args);
        };
        window.gtag('js', new Date());
        window.gtag('config', GA_MEASUREMENT_ID);

        return () => {
            // Cleanup script on unmount
            document.head.removeChild(script);
        };
    }, []);

    return null;
};

export default GoogleAnalytics;