import React from "react";
import { commonIcons, type CommonIconName } from "./commonIcons";

export type CommonIconProps = {
  name: CommonIconName;
  size?: number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
  title?: string;
  onClick?: React.MouseEventHandler<SVGElement>;
};

export function CommonIcon({
  name,
  size = 20,
  className,
  color,
  style,
  title,
  onClick,
}: CommonIconProps) {
  const IconComponent = commonIcons[name];

  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      style={style}
      title={title}
      onClick={onClick}
    />
  );
}
