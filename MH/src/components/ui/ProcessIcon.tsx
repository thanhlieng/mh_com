import {
  BadgeCheck,
  Calculator,
  ClipboardList,
  Container,
  FileSignature,
  FileText,
  LucideIcon,
  PackageCheck,
  ScanLine,
  Ship,
  Truck,
  Warehouse,
} from 'lucide-react';

import { ProcessIconName } from '@/content/types';

const ICONS: Record<ProcessIconName, LucideIcon> = {
  'clipboard-list': ClipboardList,
  calculator: Calculator,
  'package-check': PackageCheck,
  truck: Truck,
  ship: Ship,
  container: Container,
  'file-text': FileText,
  'file-signature': FileSignature,
  'scan-line': ScanLine,
  warehouse: Warehouse,
  'badge-check': BadgeCheck,
};

export function ProcessIcon({
  icon,
  className,
}: {
  icon: ProcessIconName;
  className?: string;
}) {
  const Icon = ICONS[icon];
  return <Icon className={className} aria-hidden />;
}
