export default function CurvedDivider() {
  return (
    <div className="w-full bg-black">
      <br />
      <svg
        className="w-full h-16"
        viewBox="0 0 1920 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6600" stopOpacity="0.2"/>
            <stop offset="20%" stopColor="#FF6600" stopOpacity="0.6"/>
            <stop offset="50%" stopColor="#FF6600" stopOpacity="1"/>
            <stop offset="80%" stopColor="#FF6600" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#FF6600" stopOpacity="0.2"/>
          </linearGradient>
        </defs>
        <path
          stroke="url(#fadeGradient)"
          strokeWidth="3"
          fill="none"
          d="M0,16 Q960,-28 1920,16"
        />
      </svg>
    </div>
  );
}

  