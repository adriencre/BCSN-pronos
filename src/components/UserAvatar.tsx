"use client";

interface UserAvatarProps {
  avatar?: string | null;
  className?: string;
  alt?: string;
}

export default function UserAvatar({
  avatar = "🏀",
  className = "w-10 h-10 text-xl",
  alt = "Avatar",
}: UserAvatarProps) {
  const avatarValue = avatar || "🏀";
  const isImage =
    avatarValue.startsWith("data:image/") ||
    avatarValue.startsWith("http://") ||
    avatarValue.startsWith("https://") ||
    avatarValue.startsWith("/");

  if (isImage) {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center shrink-0 ${className}`}
      >
        <img
          src={avatarValue}
          alt={alt}
          className="w-full h-full object-cover rounded-[inherit]"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <span>{avatarValue}</span>
    </div>
  );
}
