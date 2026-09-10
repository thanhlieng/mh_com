
/**
 * Hoạ tiết tuyến đường trang trí cho Hero — không phải bản đồ dữ liệu thật
 * dựa trên dữ liệu tuyến nào cả — thuần trang trí. Đường vẽ dần
 * bằng stroke-dashoffset, chấm mốc nhấp nháy lệch pha.
 */
export function RouteArt({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 600 500' fill='none' className={className} aria-hidden>
      <g stroke='white' strokeOpacity='0.18' strokeWidth='1.5'>
        <path
          d='M40 420 C 140 380, 160 300, 260 280 S 420 180, 480 90'
          strokeDasharray='700'
          style={{ strokeDashoffset: 700 }}
          className='animate-draw-line'
        />
        <path
          d='M60 200 C 160 220, 240 260, 320 260 S 460 220, 560 260'
          strokeDasharray='620'
          strokeOpacity='0.12'
          style={{ strokeDashoffset: 620, animationDelay: '0.4s' }}
          className='animate-draw-line'
        />
      </g>
      {[
        { cx: 40, cy: 420 },
        { cx: 260, cy: 280 },
        { cx: 480, cy: 90 },
        { cx: 320, cy: 260 },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.cx} cy={p.cy} r='4' fill='#F2A413' />
          <circle
            cx={p.cx}
            cy={p.cy}
            r='4'
            fill='#F2A413'
            className='animate-pulse-dot'
            style={{ animationDelay: `${i * 0.5}s`, transformOrigin: `${p.cx}px ${p.cy}px` }}
          />
        </g>
      ))}
    </svg>
  );
}
