/**
 * Desktop wallpaper — pure CSS + a little inline SVG, so it costs no image download.
 * It stays dark in both themes (like a real OS wallpaper).
 * To use your own picture instead, replace the contents with an <img> (object-cover).
 */
export function Wallpaper() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-graphite">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 55% at 85% 8%, rgba(239,255,0,0.14), transparent 62%), radial-gradient(55% 60% at 8% 100%, rgba(255,214,0,0.10), transparent 60%), radial-gradient(40% 40% at 50% 50%, rgba(25,28,32,0.9), transparent 80%)',
        }}
      />
      <div className="grid-bg absolute inset-0 opacity-80 [--grid-line:rgba(245,245,233,0.035)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" fill="none">
        <g stroke="#EFFF00" strokeWidth="1.2">
          <rect x="1010" y="-120" width="520" height="520" rx="64" transform="rotate(18 1270 140)" opacity="0.10" />
          <rect x="1090" y="-60" width="380" height="380" rx="48" transform="rotate(18 1280 130)" opacity="0.07" />
          <circle cx="1440" cy="780" r="260" opacity="0.07" />
          <circle cx="1440" cy="780" r="170" opacity="0.06" />
        </g>
        <g stroke="#F5F5E9" strokeWidth="1" opacity="0.07">
          <path d="M-40 640 L360 300 L760 640" />
          <path d="M-40 700 L360 360 L760 700" />
        </g>
        <path d="M0 820 C 300 740, 520 880, 900 790 S 1400 720, 1600 780" stroke="#EFFF00" strokeWidth="1" opacity="0.12" />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  )
}
