/* eslint-disable @typescript-eslint/no-var-requires */
const { fontFamily } = require('tailwindcss/defaultTheme');

function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

// Thang màu thương hiệu mới (redesign web công khai — xem .claude/change-log.md).
// Hai màu chốt: brand-blue #1769B3 và brand-green #1AA851. brand-teal là màu cầu nối
// hue nằm giữa hai màu trên, dùng cho dịch vụ Hải quan + gradient.

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
  important: true,
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      zIndex: {
        100: '100',
      },
      fontFamily: {
        primary: ['Inter', ...fontFamily.sans],
        // Font mới cho trang public redesign — nạp qua @fontsource trong src/lib/fonts.ts.
        display: ['"Be Vietnam Pro"', ...fontFamily.sans],
      },
      backgroundImage: {
        'bg-footer': "url('/images/footer-bg.jpg')", // Custom background
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        'yellow-primary': '#efbd2b',
        'pussy-color': 'rgba(178, 173, 173, 0.13)',
        'background-footer': '#000000',
        'color-footer': '#fff',
        'yellow-secondary': '#1464a9',
        dark: '#222222',

        // ── Redesign web công khai (trang chủ + 3 trang dịch vụ) ──
        // Hai màu chủ đạo do người dùng chốt: xanh dương #1769B3, xanh lá #1AA851.
        'brand-blue': {
          50: '#EAF3FB', 100: '#CFE4F5', 200: '#9FC9EB', 300: '#6FAEE1',
          400: '#3F93D7', 500: '#1769B3', 600: '#135A96', 700: '#0F4A79',
          800: '#0B3A5C', 900: '#082A40',
        },
        'brand-green': {
          50: '#E9F8EF', 100: '#C8EFD8', 200: '#96E0B2', 300: '#64D18C',
          400: '#39BE69', 500: '#1AA851', 600: '#158943', 700: '#116B34',
          800: '#0D4D26', 900: '#083318',
        },
        // Cầu nối hue giữa xanh dương và xanh lá — dịch vụ Hải quan + gradient.
        'brand-teal': {
          50: '#E7F6F5', 100: '#C3E9E7', 200: '#8CD5D1', 300: '#55C1BB',
          400: '#2CACA5', 500: '#12888A', 600: '#0E6E72', 700: '#0B565A',
          800: '#083E41', 900: '#052729',
        },
        navy: {
          50: '#EAF0F5', 100: '#C7D6E3', 200: '#93AEC7', 300: '#5F86AB',
          400: '#345E85', 500: '#0A2A45', 600: '#082238', 700: '#061A2B',
          800: '#04131E', 900: '#020B11',
        },
        amber: {
          50: '#FEF6E7', 100: '#FCE6BC', 200: '#F9CD79', 300: '#F6B536',
          400: '#F2A413', 500: '#D98D0A', 600: '#B37409', 700: '#8C5B07',
          800: '#664205', 900: '#402903',
        },
        paper: '#F6F9FB',
        'ink-soft': '#566B7C',
        'surface-line': '#DFE7ED',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      boxShadow: {
        'card-item': '0px 6px 30px rgba(0, 0, 0, 0.1)',
        toogle: '0px 0px 20px rgba(0, 0, 0, 0.1)',
        // Redesign web công khai
        soft: '0 1px 2px rgba(10,42,69,.06), 0 12px 32px rgba(10,42,69,.08)',
        lift: '0 24px 48px -12px rgba(10,42,69,.28)',
      },
      // Thang chữ display cho hero/tiêu đề mục — co giãn theo viewport, không
      // nhảy bậc. Tỉ lệ học từ maersk.com: cỡ lớn nhưng nét NHẸ (font-light /
      // font-normal ở nơi dùng) và letter-spacing bình thường, cho cảm giác
      // điềm đạm thay vì đậm-siết kiểu quảng cáo.
      fontSize: {
        'display-xl': ['clamp(2.25rem, 4vw, 3.5rem)', { lineHeight: '1.12', letterSpacing: '0' }],
        'display-lg': ['clamp(1.875rem, 3vw, 2.75rem)', { lineHeight: '1.16', letterSpacing: '0' }],
        'display-md': ['clamp(1.5rem, 2.2vw, 2rem)', { lineHeight: '1.25', letterSpacing: '0' }],
      },
      keyframes: {
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': {
            opacity: 0.99,
            filter:
              'drop-shadow(0 0 1px rgba(252, 211, 77)) drop-shadow(0 0 15px rgba(245, 158, 11)) drop-shadow(0 0 1px rgba(252, 211, 77))',
          },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': {
            opacity: 0.4,
            filter: 'none',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-700px 0',
          },
          '100%': {
            backgroundPosition: '700px 0',
          },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        // Hướng ngược phải là keyframe RIÊNG, không dùng inline
        // `animation-direction: reverse` được: config có `important: true` nên
        // utility `animate-marquee` là `!important` và luôn đè inline style.
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'draw-line': {
          to: { strokeDashoffset: 0 },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.35, transform: 'scale(1.7)' },
        },
      },
      animation: {
        flicker: 'flicker 3s linear infinite',
        shimmer: 'shimmer 1.3s linear infinite',
        marquee: 'marquee 32s linear infinite',
        'marquee-reverse': 'marquee-reverse 32s linear infinite',
        'draw-line': 'draw-line 1.8s ease-out forwards',
        'pulse-dot': 'pulse-dot 2.4s ease-in-out infinite',
      },
    },
    screens: {
      //mobile
      xs: { min: '0px', max: '639px' },
      // tablet
      sm: { min: '640px', max: '1024px' },
      // PC
      md: { min: '1025px' },

      // ── Breakpoint chuẩn mobile-first — CHỈ dùng cho code public redesign mới
      // (src/components/ui, src/components/public, src/components/home,
      // src/components/service, trang chủ, trang dịch vụ). Không dùng lại tên
      // sm/md vì hai tên đó đã bị 360+ chỗ code cũ dùng với ngữ nghĩa range
      // khác chuẩn Tailwind — đổi nghĩa sẽ vỡ layout admin/supplier hiện tại.
      tab: '768px',
      lap: '1024px',
      dsk: '1280px',
      wide: '1536px',
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
