import AuthImagePattern from '@/Components/Auth/authImagePatten';
import { PropsWithChildren } from 'react';
import Logo from '@/Components/Main/Logo';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="relative h-screen mx-auto overflow-hidden max-w-[1920px] bg-base-100 flex flex-col lg:flex-row">
            {/* Logo/Brand - Mobile Only*/}
            <div className='flex justify-start gap-3 m-4 lg:hidden'>
                <Logo className='size-8 text-primary' />
                <h1 className="text-2xl font-bold text-primary">CASHFAM</h1>
            </div>

            <div className="flex-1 z-[1] flex items-center justify-center p-4 lg:p-0">
                <div className='flex flex-col w-full max-w-lg lg:max-w-2xl'>
                    {/* Logo/Brand - Desktop Only*/}
                    <div className='hidden lg:flex justify-center gap-1 items-center'>
                        <Logo className='size-8 text-primary' />
                        <h1 className="text-2xl font-bold text-primary">CASHFAM</h1>
                    </div>

                    {/* Card container */}
                    <fieldset className="card bg-base-200 p-10 lg:bg-transparent shadow-xl lg:shadow-none">
                        {children}
                    </fieldset>
                </div>
            </div>
            <div className='w-1/3 hidden lg:flex' />
            <div className='absolute z-[0] w-[45rem] -right-120 md:-top-10 md:-right-96 lg:-top-20 lg:-right-24'>
                <AuthImagePattern />
            </div>
        </div>
    );
}
