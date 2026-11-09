// The Flow logo, traced from the brand video so it stays faithful to the original.
// It is drawn as a mask, so its colour follows the text colour: set it with
// e.g. `text-landing` or `text-landing/60` and size it with a height class.
const RATIO = { logo: 2806 / 1159, mark: 896 / 1159 };

export function FlowLogo({ variant = "logo", className = "" }: { variant?: "logo" | "mark"; className?: string }) {
  const url = `url(/flow-${variant}.svg)`;
  return (
    <span
      role="img"
      aria-label="Flow"
      className={`inline-block bg-current ${className}`}
      style={{
        aspectRatio: RATIO[variant],
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
