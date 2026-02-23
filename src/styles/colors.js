const dark = {
  bg: {
    primary: '#000000',
    secondary: '#060606',
    tertiary: '#0C0C0C',
    elevated: '#141414',
    surface: '#1A1A1A',
    hover: '#222222',
    active: '#2A2A2A',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    tertiary: '#6B6B6B',
    muted: '#404040',
    inverse: '#000000',
  },
  border: {
    primary: '#1E1E1E',
    secondary: '#2A2A2A',
    focus: '#3A3A3A',
  },
  accent: {
    purple: '#957FFF',
    cyan: '#56FFFF',
    blue: '#47B6FF',
  },
  status: {
    positive: '#34D399',
    negative: '#F87171',
    warning: '#FBBF24',
    info: '#47B6FF',
  },
  chart: {
    series: ['#957FFF', '#47B6FF', '#56FFFF', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#67E8F9'],
  },
  transparent: {
    white5: 'rgba(255, 255, 255, 0.05)',
    white10: 'rgba(255, 255, 255, 0.10)',
    white15: 'rgba(255, 255, 255, 0.15)',
    white20: 'rgba(255, 255, 255, 0.20)',
  },
};

const light = {
  bg: {
    primary: '#FAFAFA',
    secondary: '#F5F5F5',
    tertiary: '#EFEFEF',
    elevated: '#FFFFFF',
    surface: '#F8F8F8',
    hover: '#F0F0F0',
    active: '#E8E8E8',
  },
  text: {
    primary: '#111111',
    secondary: '#555555',
    tertiary: '#888888',
    muted: '#BBBBBB',
    inverse: '#FFFFFF',
  },
  border: {
    primary: '#E5E5E5',
    secondary: '#D5D5D5',
    focus: '#C0C0C0',
  },
  accent: {
    purple: '#7C5CFC',
    cyan: '#0CBDBD',
    blue: '#2E9BF0',
  },
  status: {
    positive: '#16A34A',
    negative: '#DC2626',
    warning: '#D97706',
    info: '#2E9BF0',
  },
  chart: {
    series: ['#7C5CFC', '#2E9BF0', '#0CBDBD', '#16A34A', '#D97706', '#DC2626', '#8B5CF6', '#06B6D4'],
  },
  transparent: {
    white5: 'rgba(0, 0, 0, 0.03)',
    white10: 'rgba(0, 0, 0, 0.06)',
    white15: 'rgba(0, 0, 0, 0.09)',
    white20: 'rgba(0, 0, 0, 0.12)',
  },
};

let _current = dark;

function makeProxy(getTarget) {
  return new Proxy({}, {
    get(_, prop) {
      const val = getTarget()[prop];
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        return makeProxy(() => getTarget()[prop]);
      }
      return val;
    },
    ownKeys() {
      return Reflect.ownKeys(getTarget());
    },
    getOwnPropertyDescriptor(_, prop) {
      return { configurable: true, enumerable: true, value: getTarget()[prop] };
    },
  });
}

export const colors = makeProxy(() => _current);

export function applyTheme(theme) {
  _current = theme === 'light' ? light : dark;
}

export function getCurrentThemeName() {
  return _current === light ? 'light' : 'dark';
}
