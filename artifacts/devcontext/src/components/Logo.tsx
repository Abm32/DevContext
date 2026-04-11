interface LogoProps {
  size?: number
  className?: string
}

export function LogoIcon({ size = 28, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="url(#logo-bg)" />
      <path
        d="M10 12.5L14 16.5L10 20.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 20.5H22"
        stroke="url(#logo-line)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="22" cy="11" r="3" fill="url(#logo-dot)" opacity="0.9" />
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="logo-line" x1="16" y1="20.5" x2="22" y2="20.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.6" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <linearGradient id="logo-dot" x1="19" y1="8" x2="25" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#34D399" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function LogoFull({ size = 28, className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoIcon size={size} />
      <span
        className="font-bold tracking-tight text-white"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: size * 0.57,
        }}
      >
        DevContext
      </span>
    </div>
  )
}
