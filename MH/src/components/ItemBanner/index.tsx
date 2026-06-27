import Image from 'next/image';

interface ItemBannerProps {
  icon?: string;
  title: string;
  details: string | (() => React.JSX.Element);
}

const ItemBanner = ({ icon, title, details }: ItemBannerProps) => {
  return (
    <div className='te flex flex-col items-center justify-center xs:mt-[20px] xs:border-b-[1px] xs:border-[#D3D3D3]'>
      {icon && (
        <div>
          <Image src={icon || ''} width={58} height={58} alt='icon' />
        </div>
      )}
      <p className='mb-[14px] mt-[30px] text-[24px] font-bold  leading-[17px] text-[#1F1F1F]'>
        {title}
      </p>
      {typeof details === 'function' ? (
        details()
      ) : (
        <p className='mb-[20px] text-center text-[14px] leading-5 '>
          {details}
        </p>
      )}
    </div>
  );
};

export default ItemBanner;
