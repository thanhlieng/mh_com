interface SectionGlowProps {
  /** Vị trí 2 quầng sáng — mặc định chéo trái-trên/phải-dưới. */
  variant?: 'diagonal' | 'top';
}

/**
 * Quầng gradient mờ trang trí cho các section nền trắng/paper — phá vỡ cảm
 * giác "trắng phẳng đơn điệu". Đặt làm phần tử đầu tiên trong section có
 * `relative overflow-hidden`; nội dung thật đặt `relative z-10` phía sau.
 * Màu lấy đúng từ 2 màu thương hiệu để nhất quán, không thêm màu mới.
 */
export function SectionGlow({ variant = 'diagonal' }: SectionGlowProps) {
  if (variant === 'top') {
    return (
      <div aria-hidden className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden'>
        <div className='absolute left-1/2 top-[-220px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-blue-400/10 blur-3xl' />
      </div>
    );
  }

  return (
    <div aria-hidden className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'>
      <div className='absolute -left-24 -top-24 h-[360px] w-[360px] rounded-full bg-brand-green-400/10 blur-3xl' />
      <div className='absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-brand-blue-400/10 blur-3xl' />
    </div>
  );
}
