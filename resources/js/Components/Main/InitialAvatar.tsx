interface Avatar {
    username: string;
    className?: string;
}

const Avatar = ({ username, className }: Avatar) => {
    const initial = username
        ?.split(" ")
        .map((word: string) => word[0])
        .join("")
        .toUpperCase() || "?"

    return (
        <div className={`size-full select-none rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center font-bold text-white shadow-md ${className ?? ''}`}>
            {initial}
        </div>
    )
}

export default Avatar