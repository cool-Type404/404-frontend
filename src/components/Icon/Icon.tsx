import React from "react";

export type IconProps = {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  ariaHidden?: boolean;
};

export default function Icon({
  src,
  alt,
  children,
  size = 18,
  className,
  style,
  ariaLabel,
  ariaHidden,
}: IconProps) {
  const computedAriaHidden = ariaHidden ?? (!ariaLabel && !alt);

  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? ariaLabel ?? ""}
        width={size}
        height={size}
        className={className}
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          ...style,
        }}
        aria-hidden={computedAriaHidden}
      />
    );
  }

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        fontSize: size,
        lineHeight: 1,
        ...style,
      }}
      aria-label={ariaLabel}
      aria-hidden={computedAriaHidden}
    >
      {children}
    </span>
  );
}
