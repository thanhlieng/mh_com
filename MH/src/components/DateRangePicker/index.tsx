import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { type DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  label?: string;
  className?: string;
  /** Cho phép xóa khoảng thời gian (hiện nút "Xóa"). Mặc định true. */
  allowClear?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  label,
  className,
  allowClear = true,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const displayText = React.useMemo(() => {
    if (!value?.from) return 'Chọn khoảng thời gian';
    if (!value.to) return format(value.from, 'dd/MM/yyyy', { locale: vi });
    return `${format(value.from, 'dd/MM/yyyy', { locale: vi })} – ${format(value.to, 'dd/MM/yyyy', { locale: vi })}`;
  }, [value]);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'h-8 justify-start gap-2 text-left text-xs font-normal',
              !value?.from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='h-3.5 w-3.5 shrink-0' />
            <span className='truncate'>{displayText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='range'
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
          />
          {allowClear && value?.from && (
            <div className='border-t border-border p-2 text-right'>
              <Button
                variant='ghost'
                size='sm'
                className='text-xs text-muted-foreground'
                onClick={() => {
                  onChange?.(undefined);
                  setOpen(false);
                }}
              >
                Xóa
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
