import { useCallback, useEffect, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

const SQUARE_SIZE = 260;
const HUE_HEIGHT = 28;
const HANDLE_SIZE = 22;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) {
      h = (((g - b) / d) % 6) * 60;
    } else if (max === g) {
      h = ((b - r) / d + 2) * 60;
    } else {
      h = ((r - g) / d + 4) * 60;
    }
    if (h < 0) {
      h += 360;
    }
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

type Props = {
  value: string;
  onChange: (hex: string) => void;
};

function ColorPicker({ value, onChange }: Props) {
  const initial = hexToHsv(value);
  const [hue, setHue] = useState(initial.h);
  const [sat, setSat] = useState(initial.s);
  const [val, setVal] = useState(initial.v);

  useEffect(() => {
    const parsed = hexToHsv(value);
    setHue(parsed.h);
    setSat(parsed.s);
    setVal(parsed.v);
  }, [value]);

  const emit = useCallback(
    (h: number, s: number, v: number) => {
      onChange(hsvToHex(h, s, v));
    },
    [onChange],
  );

  const handleSquareTouch = useCallback(
    (evt: GestureResponderEvent) => {
      const { locationX, locationY } = evt.nativeEvent;
      const s = clamp(locationX / SQUARE_SIZE, 0, 1);
      const v = clamp(1 - locationY / SQUARE_SIZE, 0, 1);
      setSat(s);
      setVal(v);
      emit(hue, s, v);
    },
    [hue, emit],
  );
  const handleSquareTouchRef = useRef(handleSquareTouch);
  handleSquareTouchRef.current = handleSquareTouch;

  const handleHueTouch = useCallback(
    (evt: GestureResponderEvent) => {
      const { locationX } = evt.nativeEvent;
      const h = clamp((locationX / SQUARE_SIZE) * 360, 0, 360);
      setHue(h);
      emit(h, sat, val);
    },
    [sat, val, emit],
  );
  const handleHueTouchRef = useRef(handleHueTouch);
  handleHueTouchRef.current = handleHueTouch;

  const squarePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => handleSquareTouchRef.current(evt),
      onPanResponderMove: evt => handleSquareTouchRef.current(evt),
    }),
  ).current;

  const huePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => handleHueTouchRef.current(evt),
      onPanResponderMove: evt => handleHueTouchRef.current(evt),
    }),
  ).current;

  const hueColor = hsvToHex(hue, 1, 1);

  return (
    <View style={styles.container}>
      <View style={styles.square} {...squarePan.panHandlers}>
        <Svg width={SQUARE_SIZE} height={SQUARE_SIZE}>
          <Defs>
            <LinearGradient id="saturation" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#ffffff" stopOpacity={1} />
              <Stop offset="1" stopColor={hueColor} stopOpacity={1} />
            </LinearGradient>
            <LinearGradient id="brightness" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity={0} />
              <Stop offset="1" stopColor="#000000" stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={SQUARE_SIZE} height={SQUARE_SIZE} fill="url(#saturation)" />
          <Rect x={0} y={0} width={SQUARE_SIZE} height={SQUARE_SIZE} fill="url(#brightness)" />
        </Svg>
        <View
          pointerEvents="none"
          style={[
            styles.handle,
            {
              left: sat * SQUARE_SIZE - HANDLE_SIZE / 2,
              top: (1 - val) * SQUARE_SIZE - HANDLE_SIZE / 2,
              backgroundColor: value,
            },
          ]}
        />
      </View>

      <View style={styles.hueBar} {...huePan.panHandlers}>
        <Svg width={SQUARE_SIZE} height={HUE_HEIGHT}>
          <Defs>
            <LinearGradient id="hue" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#ff0000" />
              <Stop offset="0.17" stopColor="#ffff00" />
              <Stop offset="0.33" stopColor="#00ff00" />
              <Stop offset="0.5" stopColor="#00ffff" />
              <Stop offset="0.67" stopColor="#0000ff" />
              <Stop offset="0.83" stopColor="#ff00ff" />
              <Stop offset="1" stopColor="#ff0000" />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={SQUARE_SIZE} height={HUE_HEIGHT} rx={HUE_HEIGHT / 2} fill="url(#hue)" />
        </Svg>
        <View
          pointerEvents="none"
          style={[
            styles.hueHandle,
            {
              left: (hue / 360) * SQUARE_SIZE - HANDLE_SIZE / 2,
              backgroundColor: hueColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    borderWidth: 3,
    borderColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  hueBar: {
    width: SQUARE_SIZE,
    height: HUE_HEIGHT,
    marginTop: 18,
    justifyContent: 'center',
  },
  hueHandle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    borderWidth: 3,
    borderColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
});

export default ColorPicker;
