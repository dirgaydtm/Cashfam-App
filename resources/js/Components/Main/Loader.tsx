import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

const Loader = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const showLoader = () => {
            setShouldRender(true);
            setTimeout(() => setIsLoading(true), 10);
        };

        const hideLoader = () => {
            setIsLoading(false);
            setTimeout(() => setShouldRender(false), 300);
        };

        const removeStartListener = router.on('start', showLoader);
        const removeFinishListener = router.on('finish', hideLoader);

        window.addEventListener('beforeunload', showLoader);

        return () => {
            removeStartListener();
            removeFinishListener();
            window.removeEventListener('beforeunload', showLoader);
        };
    }, []);

    if (!shouldRender) return null;

    return (
        <div className={`fixed inset-0 bg-primary/50 flex items-center justify-center z-100 transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`transition-transform duration-500 ${isLoading ? 'scale-100' : 'scale-75'}`}>
                <span className="loading loading-infinity w-24 text-white"></span>
            </div>
        </div>
    )
}

export default Loader
