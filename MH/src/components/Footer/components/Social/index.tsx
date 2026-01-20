import Image from 'next/image';

import { dataSocial } from '@/contants/types/common-data.contants';

const Social = () => {
  return (
    <div className='flex items-end justify-center gap-5 p-[30px]'>
      {dataSocial.map(({ src, id }) => (
        <Image width={20} height={20} alt='icon' src={src} key={id} />
      ))}
    </div>
  );
};

export default Social;
