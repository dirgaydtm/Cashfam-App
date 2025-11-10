import { ReactNode, useEffect, useRef, useState } from 'react';
import { UserIcon, Palette, LogOut, Home, Plus, RectangleEllipsis } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { User , PageProps } from '@/types';
import InitialAvatar from './InitialAvatar';

interface MenuItem {
    type: 'item';
    key: string;
    label: string;
    icon: ReactNode;
    href?: string;
    method?: 'get' | 'post' | 'put' | 'delete';
    className?: string;
}

const MENU_ITEMS: MenuItem[] = [
    {
        type: 'item',
        key: 'dashboard',
        label: 'Dashboard',
        icon: <Home className='size-5' />,
        href: route('dashboard'),
    },
    {
        type: 'item',
        key: 'profile',
        label: 'Profile',
        icon: <UserIcon className='size-5' />,
        href: route('profile.edit'),
    },
    {
        type: 'item',
        key: 'theme',
        label: 'Theme',
        icon: <Palette className='size-5' />,
        href: route('theme')
    },
    {
        type: 'item',
        key: 'logout',
        label: 'Logout',
        icon: <LogOut className='size-5' />,
        href: route('logout'),
        method: 'post',
        className: 'text-error'
    },
];
interface NavbarProps {
    onCreateBook?: () => void;
    onJoinBook?: () => void;
}

const Navbar = ({ onCreateBook, onJoinBook }: NavbarProps) => {
    const { props, url } = usePage<PageProps>();
    const { user } = props.auth;

    const isDashboard = url === '/dashboard';

    return (
        <nav className="navbar bg-base-100 shadow-sm p-3 sticky top-0 z-50 lg:px-10" role="navigation">
            {/* Logo Section */}
            <div className="navbar-start">
                <Link href={route('dashboard')} className='flex justify-start items-center gap-2 m-2 hover:opacity-80 transition-opacity'>
                    {/* Logo image. Place your image file into `public/images/` with the exact filename below. */}
                    {/* We compute a simple average color from the loaded image and apply it to the title. */}
                    <LogoInline src="/images/WhatsApp_Image_2025-10-14_at_08.23.25_01803d64__1_-removebg-preview.png" alt="CashFam logo" />
                </Link>
            </div>

            <div className="navbar-end gap-6">
                {isDashboard && (
                    <div className="hidden md:flex gap-2">
                        <button
                            className="p-3 cursor-pointer rounded-full border-0 hover:bg-base-300"
                            onClick={onCreateBook}
                            title="Create new book"
                            aria-label="Create new financial book"
                        >
                            <Plus size={24} />
                        </button>
                        <button
                            className="p-3 cursor-pointer rounded-full border-0 hover:bg-base-300"
                            onClick={onJoinBook}
                            title="Join existing book"
                            aria-label="Join existing financial book"
                        >
                            <RectangleEllipsis size={24} />
                        </button>
                    </div>
                )}

                <div className="dropdown dropdown-end w-fit">
                    <div
                        tabIndex={0}
                        className="cursor-pointer size-8 md:size-11"
                        role="button"
                        aria-label="User menu"
                    >
                        <InitialAvatar username={user.name} />
                    </div>
                    <ul className="menu menu-sm dropdown-content mt-4 p-0 z-[1] border bg-base-100 rounded-box pb-3 md:w-72">
                        <li className="menu-title m-2">
                            <span className='text-base text-base-content/90'>{user.name}</span>
                            <span className="text-xs text-base-content/60">{user.email}</span>
                        </li>
                        {MENU_ITEMS.map((item: MenuItem) => (
                            <li key={item.key}>
                                <Link
                                    href={item.href}
                                    method={item.method as any}
                                    as={item.method === 'post' ? 'button' : undefined}
                                    className={`${item.className || ''}`.trim()}
                                >
                                    <span className="flex text-sm items-center py-1.5 gap-2">
                                        {item.icon}
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar

function LogoInline({ src, alt }: { src: string; alt?: string }) {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [color, setColor] = useState<string | null>(null);

    useEffect(() => {
        const img = imgRef.current;
        if (!img) return;

        const computeColor = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const w = 32;
                const h = 32;
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, w, h);
                const data = ctx.getImageData(0, 0, w, h).data;

                let r = 0, g = 0, b = 0, count = 0;
                for (let i = 0; i < data.length; i += 16) {
                    const alpha = data[i + 3];
                    if (alpha === 0) continue;
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }
                if (count > 0) {
                    r = Math.round(r / count);
                    g = Math.round(g / count);
                    b = Math.round(b / count);
                    setColor(`rgb(${r}, ${g}, ${b})`);
                }
            } catch (err) {
                // ignore (likely CORS)
            }
        };

        if (img.complete && img.naturalWidth) {
            computeColor();
        } else {
            img.addEventListener('load', computeColor);
        }

        return () => img.removeEventListener('load', computeColor);
    }, [src]);

    return (
        <>
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className="w-8 md:w-18 object-contain"
                onError={(e) => {
                    // @ts-ignore
                    e.currentTarget.src = '/images/logo-fallback.png';
                }}
            />
            <h1
                className={`text-base md:text-2xl font-bold ${color ? '' : 'text-primary'}`}
                style={color ? { color } : undefined}
            >
                CASHFAM
            </h1>
        </>
    );
}
