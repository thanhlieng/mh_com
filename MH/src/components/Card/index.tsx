/* eslint-disable @typescript-eslint/no-explicit-any */
interface CardInfoProps {
  title: any;
  label: any;
}

const CardInfo = ({ title, label }: CardInfoProps) => {
  return (
    <div className='text-center'>
      <p className='m-0 p-0 text-[70px] font-bold  leading-[85px] text-[#FFFFFF] xs:text-[60px] xs:leading-[73px]'>
        {title}
      </p>
      <p className='m-0 p-0 text-[20px] leading-[24px] text-[#FFFFFF] xs:text-[14px] xs:leading-[17px]'>
        {label}
      </p>
    </div>
  );
};

export default CardInfo;
