import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import Loader from '@/Components/Main/Loader';
import AOS from 'aos';
import 'aos/dist/aos.css';

const appName = import.meta.env.VITE_APP_NAME || 'Cashfam';

AOS.init();

const savedTheme = localStorage.getItem('app-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <Loader />
                <App {...props} />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
