const Avatar = ({ username }: { username: string }) => {
    const initial = username
        ?.split(" ")
        .map((word: string) => word[0])
        .join("")
        .toUpperCase() || "?"

    return (
        <div className="size-full rounded-full text-3xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
            {initial}
        </div>
    )
}

export default Avatar