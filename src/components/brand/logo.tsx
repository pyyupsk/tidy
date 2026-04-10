const sizes = {
  sm: { icon: 16, text: "text-sm", gap: "gap-1.5" },
  md: { icon: 24, text: "text-lg", gap: "gap-2" },
} as const

type LogoProps = {
  size?: keyof typeof sizes
}

export function Logo({ size = "md" }: Readonly<LogoProps>) {
  const { icon, text, gap } = sizes[size]

  return (
    <div className={`flex items-center ${gap}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="14" fill="oklch(0.205 0 0)" />
        <rect
          x="13"
          y="13"
          width="11"
          height="11"
          rx="2"
          fill="oklch(0.922 0 0)"
        />
        <rect
          x="27"
          y="13"
          width="11"
          height="11"
          rx="2"
          fill="oklch(0.922 0 0)"
        />
        <rect
          x="41"
          y="13"
          width="11"
          height="11"
          rx="2"
          fill="oklch(0.269 0 0)"
        />
        <rect
          x="13"
          y="27"
          width="11"
          height="11"
          rx="2"
          fill="oklch(0.922 0 0)"
        />
        <rect
          x="27"
          y="27"
          width="11"
          height="11"
          rx="2"
          fill="oklch(0.269 0 0)"
        />
        <rect
          x="41"
          y="27"
          width="11"
          height="11"
          rx="2"
          fill="oklch(0.269 0 0)"
        />
        <rect
          x="13"
          y="41"
          width="11"
          height="11"
          rx="2"
          fill="oklch(0.269 0 0)"
        />
        <rect
          x="27"
          y="41"
          width="11"
          height="11"
          rx="2"
          fill="oklch(0.269 0 0)"
        />
        <rect
          x="41"
          y="41"
          width="11"
          height="11"
          rx="2"
          fill="oklch(0.269 0 0)"
        />
      </svg>
      <span
        className={`font-sans font-medium tracking-tight text-foreground ${text}`}
      >
        tidy
      </span>
    </div>
  )
}
