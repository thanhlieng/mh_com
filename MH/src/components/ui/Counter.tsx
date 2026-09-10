import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface CounterProps {
  /** Giá trị đích. Chuỗi để chấp nhận cả số nguyên lẫn số có phần thập phân đã format sẵn. */
  value: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

/**
 * Đếm số lên khi vào khung nhìn — dùng cho StatBand ở trang chủ. Chỉ đếm
 * phần số nguyên đầu chuỗi (vd "252+" → đếm 0→252 rồi thêm "+"); giữ nguyên
 * chuỗi gốc nếu không parse được số (vd "100%" vẫn hoạt động, "2 nước" thì
 * hiện tĩnh).
 */
export function Counter({ value, suffix = '', className, duration = 1.6 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState('0');

  const numericMatch = value.match(/^-?\d+([.,]\d+)?/);
  const numericPart = numericMatch ? numericMatch[0].replace(',', '.') : null;
  const restPart = numericMatch ? value.slice(numericMatch[0].length) : '';
  const target = numericPart ? parseFloat(numericPart) : null;

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion || target === null) {
      setDisplay(value);
      return;
    }

    let raf: number;
    const start = performance.now();
    const decimals = numericPart?.includes('.') ? numericPart.split('.')[1].length : 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      setDisplay(current.toFixed(decimals) + restPart);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduceMotion]);

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {display}
      {suffix}
    </motion.span>
  );
}
