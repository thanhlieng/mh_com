/* eslint-disable @typescript-eslint/no-explicit-any */
import useTranslation from 'next-translate/useTranslation';
import React from 'react';

import TextLink from '@/components/links/TextLink';

interface ItemMenuProps {
  value: any;
  handleAction?: () => void;
  styleLabel?: string;
}
const ItemMenu = ({ value, handleAction, styleLabel }: ItemMenuProps) => {
  const { t: tBooking } = useTranslation('booking');

  return (
    <div onClick={handleAction && handleAction}>
      <TextLink
        href={value.href}
        label={tBooking(value.title)}
        styleLabel={styleLabel}
      />
    </div>
  );
};
export default ItemMenu;
