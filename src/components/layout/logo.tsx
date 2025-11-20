
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8 40H17.2929C17.6834 40 18.0584 39.842 18.3414 39.5589L39.5589 18.3414C39.842 18.0584 40 17.6834 40 17.2929V8"
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 12V24H36"
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8L40 40"
        stroke="hsl(var(--foreground))"
        strokeWidth="4"
        strokeOpacity="0.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
