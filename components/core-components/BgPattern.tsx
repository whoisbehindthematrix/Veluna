import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect } from 'react-native-svg';

const PATTERN_WIDTH = 32;
const PATTERN_HEIGHT = 64;
const PATTERN_PATH =
  "M0 28h20V16h-4v8H4V4h28v28h-4V8H8v12h4v-8h12v20H0v-4zm12 8h20v4H16v24H0v-4h12V36zm16 12h-4v12h8v4H20V44h12v12h-4v-8zM0 36h8v20H0v-4h4V40H0v-4z";

export interface BgPatternProps {
  width: number;
  height: number;
  backgroundColor?: string;
  patternColor?: string;
  patternId?: string;
}

/**
 * Repeating SVG pattern background (matches styles/bgpattern.css).
 * Use with onLayout to get width/height, or wrap in a View and pass dimensions.
 */
export default function BgPattern({
  width,
  height,
  backgroundColor = '#e8b9ac',
  patternColor = '#eaa598',
  patternId = 'bg-pattern',
}: BgPatternProps) {
  if (width <= 0 || height <= 0) return null;
  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <Defs>
        <Pattern
          id={patternId}
          x="0"
          y="0"
          width={PATTERN_WIDTH}
          height={PATTERN_HEIGHT}
          patternUnits="userSpaceOnUse"
        >
          <Path
            d={PATTERN_PATH}
            fill={patternColor}
            fillRule="evenodd"
            fillOpacity={1}
          />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} fill={backgroundColor} />
      <Rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill={`url(#${patternId})`}
      />
    </Svg>
  );
}
