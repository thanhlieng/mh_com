import Link from 'next/link';

import TitleDecoration from '@/components/TitleDecoration';

import { IListLink } from '@/contants/types';
interface FooterAssitanceProps {
  title: string;
  listLink: Array<IListLink>;
}
const FooterAssitance = ({ title, listLink }: FooterAssitanceProps) => {
  return (
    <div>
      <TitleDecoration title={title} />
      <div className='mb-[28px] mt-[10px] flex flex-col gap-[10px]'>
        {listLink.map((v, key) => (
          <Link href={v.href} key={key}>
            <p className='m-0 cursor-pointer p-0'>{v.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FooterAssitance;
