import { motion, useReducedMotion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Độ trễ trước khi bắt đầu, tính bằng giây — dùng để so le nhiều Reveal cạnh nhau. */
  delay?: number;
  as?: 'div' | 'li';
}

const variants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Bọc fade + rise nhẹ khi cuộn vào khung nhìn, dùng khắp trang public
 * redesign thay vì lặp lại `whileInView` ở từng nơi. Tôn trọng
 * `prefers-reduced-motion` — khi bật, nội dung hiện ngay không animate.
 *
 * `viewport={{ once: true }}` đảm bảo section chỉ animate lần đầu, và nội
 * dung vẫn ở trạng thái "visible" khi trang vừa tải xong phần trong khung
 * nhìn đầu tiên (không parked ở opacity:0 chờ observer).
 */
export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = as === 'li' ? motion.li : motion.div;

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-80px' }}
      variants={variants}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </MotionTag>
  );
}

/** Bọc so le nhiều Reveal con — dùng cho lưới thẻ dịch vụ, danh sách bước. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const revealItemVariants: Variants = variants;
