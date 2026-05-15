"use client";

interface ScrollCueProps {
  className?: string;
  targetId?: string;
}

export function ScrollCue({ className = "", targetId }: ScrollCueProps) {
  function handleClick() {
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
    }
  }

  return (
    <button
      aria-label="Scroll down"
      className={`group flex flex-col items-center gap-2 text-soft/40 transition hover:text-soft/70 ${className}`}
      onClick={handleClick}
    >
      <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em]">scroll</span>
      <svg
        aria-hidden="true"
        className="h-8 w-4 animate-bounce group-hover:text-lime reduced-motion:animate-none"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 16 32"
      >
        <rect className="opacity-50" height="20" rx="4" stroke="currentColor" strokeWidth={1.5} width="10" x="3" y="1" />
        <circle className="animate-scrollDot" cx="8" cy="7" fill="currentColor" r="2" />
        <path
          className="opacity-40"
          d="M5 26 L8 30 L11 26"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
