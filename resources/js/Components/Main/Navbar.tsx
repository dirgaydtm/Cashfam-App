import { ReactNode } from 'react';
import { PiggyBank, User, Settings, LogOut, Home } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { User as usertype } from '@/types';
import InitialAvatar from './InitialAvatar';

type MenuActions =
    | { type: 'item'; key: string; label: string; icon: ReactNode; href?: string; method?: string; asButton?: boolean; className?: string }
    | { type: 'divider'; key: string };

const MenuActions: MenuActions[] = [

    {
        type: 'item',
        key: 'profile',
        label: 'Profile',
        icon: <User className='size-5' />,
        href: route('profile.edit'),
    },
    {
        type: 'item',
        key: 'theme',
        label: 'Theme',
        icon: <Settings className='size-5' />,
        href: route('theme')
    },
    {
        type: 'item',
        key: 'dashboard',
        label: 'Dashboard',
        icon: <Home className='size-5' />,
        href: route('dashboard'),
    },
    {
        type: 'item',
        key: 'logout',
        label: 'Logout',
        icon: <LogOut className='size-5' />,
        href: route('logout'),
        method: 'post',
        asButton: true,
        className: 'text-error'
    },
];

const Navbar = ({ user }: { user: usertype }) => {
    return (
        <div className="navbar bg-base-200 shadow-sm p-3 sticky top-0 z-50 lg:px-10">
            <div className="navbar-start">

                {/* Logo */}
                <div className='flex justify-start items-center gap-2 m-2'>
                    <PiggyBank className='size-8 text-primary' />
                    <h1 className="text-2xl font-bold text-primary">CASHFAM</h1>
                </div>
            </div>


            <div className="navbar-end gap-6">
                {/* User dropdown */}
                <div className="dropdown dropdown-end w-fit">
                    <div tabIndex={0} role="button" className="btn btn-ghost size-11 btn-circle">
                        <InitialAvatar username={user.name} />
                    </div>
                    <ul className="menu menu-sm dropdown-content mt-3 z-[1] gap-0.5 px-2 pb-3  shadow bg-base-100 rounded-box w-72">
                        <li className="menu-title">
                            <span className='text-base text-base-content/90'>{user.name}</span>
                            <span className="text-xs text-base-content/60">{user.email}</span>
                        </li>
                        {MenuActions.map(item => {
                            if (item.type === 'divider') {
                                return <div key={item.key} className="divider my-1"></div>;
                            }
                            return (
                                <li key={item.key}>
                                    <Link
                                        href={item.href}
                                        method={item.method as any}
                                        as={item.asButton ? 'button' : undefined}
                                        className={`${item.className || ''}`.trim()}
                                    >
                                        <span className="flex text-sm items-center py-1 gap-2">
                                            {item.icon}
                                            {item.label}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Navbar
