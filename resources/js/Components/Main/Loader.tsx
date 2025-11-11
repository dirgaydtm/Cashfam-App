import { useEffect, useState } from 'react';

const Loader = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Detect page reload/navigation
        const handleBeforeUnload = () => {
            setShouldRender(true);
            // Delay untuk trigger animasi
            setTimeout(() => setIsLoading(true), 10);
        };

        // Listen for page unload
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 bg-primary/50 flex items-center justify-center z-100 transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0'
                }`}
        >
            <div className={`flex flex-col items-center gap-4 transition-transform duration-500 ${isLoading ? 'scale-100' : 'scale-75'
                }`}>
                <span className="loading loading-infinity w-24 text-white"></span>
            </div>
        </div>
    )
}

export default Loader
