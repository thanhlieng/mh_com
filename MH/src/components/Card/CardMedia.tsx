/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';

interface ICardMedia {
  src: string;
  url: string;
  title: string;
  description: string;
  content: string;
}

const CardMedia = ({ src, url, title, description }: ICardMedia) => {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(url)}
      className='flex cursor-pointer flex-row gap-[14px]'
    >
      <img
        src={src}
        alt='thumb'
        className=' w-[120px] rounded-[14px] object-contain'
      />
      <div>
        <p className='m-0 p-0 text-[16px] font-medium leading-[19px] text-[#1F1F1F]'>
          {title}
        </p>
        <div
          className='lineClamp4 mt-2 text-[14px] leading-[17px] text-[#575353]'
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </div>
  );
};
export default CardMedia;
