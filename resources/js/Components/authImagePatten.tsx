import React from 'react';

const AuthImagePattern = () => {
    return (
        <div className="flex w-full items-center rotate-[15deg] justify-center">
            <div className="size-full justify-center">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[...Array(18)].map((_, i) => (
                        <div
                            key={i}
                            className={`aspect-square rounded-2xl  bg-primary ${i % 2 === 0 ? "animate-pulse" : ""} ${i % 2 !== 0 ? "animate-pulse [animation-delay:3s]" : ""}`}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
};

export default AuthImagePattern;