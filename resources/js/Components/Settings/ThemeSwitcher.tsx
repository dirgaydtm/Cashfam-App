import { useState, useEffect } from 'react';
import { Palette, Monitor, Sun, Moon } from 'lucide-react';

const themes = [
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
    { name: 'Corporate', value: 'corporate', icon: Monitor },
    { name: 'Synthwave', value: 'synthwave', icon: Palette },
    { name: 'Retro', value: 'retro', icon: Palette },
    { name: 'Cyberpunk', value: 'cyberpunk', icon: Palette },
    { name: 'Valentine', value: 'valentine', icon: Palette },
    { name: 'Halloween', value: 'halloween', icon: Palette },
    { name: 'Garden', value: 'garden', icon: Palette },
    { name: 'Forest', value: 'forest', icon: Palette },
    { name: 'Aqua', value: 'aqua', icon: Palette },
    { name: 'Lofi', value: 'lofi', icon: Palette },
    { name: 'Pastel', value: 'pastel', icon: Palette },
    { name: 'Fantasy', value: 'fantasy', icon: Palette },
    { name: 'Wireframe', value: 'wireframe', icon: Monitor },
    { name: 'Black', value: 'black', icon: Moon },
    { name: 'Luxury', value: 'luxury', icon: Palette },
    { name: 'Dracula', value: 'dracula', icon: Moon },
    { name: 'CMYK', value: 'cmyk', icon: Palette },
    { name: 'Autumn', value: 'autumn', icon: Palette },
    { name: 'Business', value: 'business', icon: Monitor },
    { name: 'Acid', value: 'acid', icon: Palette },
    { name: 'Lemonade', value: 'lemonade', icon: Sun },
    { name: 'Night', value: 'night', icon: Moon },
    { name: 'Coffee', value: 'coffee', icon: Palette },
    { name: 'Winter', value: 'winter', icon: Palette },
    { name: 'Dim', value: 'dim', icon: Moon },
    { name: 'Nord', value: 'nord', icon: Palette },
    { name: 'Sunset', value: 'sunset', icon: Sun },
];

export default function ThemeSwitcher() {
    const [currentTheme, setCurrentTheme] = useState<string>('light');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Get theme from localStorage or system preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        setCurrentTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const changeTheme = (theme: string) => {
        setCurrentTheme(theme);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        setIsOpen(false);
    };

    const getCurrentThemeInfo = () => {
        return themes.find(theme => theme.value === currentTheme) || themes[0];
    };

    const currentThemeInfo = getCurrentThemeInfo();
    const IconComponent = currentThemeInfo.icon;

    return (
        <div className="dropdown dropdown-end">
            <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
                onClick={() => setIsOpen(!isOpen)}
            >
                <IconComponent size={20} />
            </div>
            {isOpen && (
                <div className="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-base-100 border border-base-200">
                    <div className="card-body">
                        <h3 className="card-title text-sm">Choose Theme</h3>
                        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                            {themes.map((theme) => {
                                const ThemeIcon = theme.icon;
                                return (
                                    <button
                                        key={theme.value}
                                        className={`btn btn-sm justify-start ${currentTheme === theme.value ? 'btn-primary' : 'btn-ghost'
                                            }`}
                                        onClick={() => changeTheme(theme.value)}
                                        data-theme={theme.value}
                                    >
                                        <ThemeIcon size={16} />
                                        <span>{theme.name}</span>
                                        {currentTheme === theme.value && (
                                            <div className="ml-auto">
                                                <div className="w-2 h-2 rounded-full bg-current"></div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="card-actions justify-end mt-4">
                            <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => setIsOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
