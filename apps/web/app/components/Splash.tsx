/** Locale-neutral splash, prerendered into the static HTML before the app hydrates. */
export function Splash() {
  return (
    <div className="glow-bg flex min-h-dvh items-center justify-center" aria-hidden="true">
      <img
        src="/favicon.svg"
        alt=""
        width={64}
        height={64}
        className="splash-pulse rounded-[18px] shadow-card"
      />
    </div>
  );
}
