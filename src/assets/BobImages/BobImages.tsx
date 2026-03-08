import React from 'react';

import defaultPng from './default.png';
import deliciousPng from './delicious.png';
import happyPng from './happy.png';
import sleepyPng from './sleepy.png';
import surprisedPng from './surprised.png';
import thinkingPng from './thinking.png';

export type BobImageName = 'default' | 'delicious' | 'happy' | 'sleepy' | 'surprised' | 'thinking';

export type BobImagesProps = {
  name?: BobImageName;
  size?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
};

const bobImageMap: Record<BobImageName, string> = {
  default: defaultPng,
  delicious: deliciousPng,
  happy: happyPng,
  sleepy: sleepyPng,
  surprised: surprisedPng,
  thinking: thinkingPng,
};

export default function BobImages({
  name = 'default',
  size = 200,
  alt,
  className,
  style,
}: BobImagesProps) {
  const src = bobImageMap[name];

  return (
    <img
      src={src}
      alt={alt ?? `bob-${name}`}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        userSelect: 'none',
        ...style,
      }}
      draggable={false}
      loading="lazy"
    />
  );
}
