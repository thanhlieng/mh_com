import clsx from 'clsx';

interface ToogleButtonProps {
  checkedTitle: string;
  unCheckTitle: string;
  checked: boolean;
  handleClick: () => void;
}
const ToogleButton = ({
  checkedTitle,
  unCheckTitle,
  checked,
  handleClick,
}: ToogleButtonProps) => {
  const active = (value: boolean) => {
    if (value) {
      return 'bg-[#fff] rounded-[33px] shadow-toogle';
    }
  };
  return (
    <div
      className='inline-flex cursor-pointer gap-x-[2px] rounded-[33px] bg-[#F2F2F2] p-[6px] text-center text-[14px] leading-[17px] text-[#1F1F1F]'
      onClick={handleClick}
    >
      <div
        className={clsx(
          'min-w-[200px] p-[14px] xs:min-w-[150px]',
          active(checked)
        )}
      >
        <p className='m-0 p-0'>{checkedTitle}</p>
      </div>
      <div
        className={clsx(
          'min-w-[200px] p-[14px] xs:min-w-[150px]',
          active(!checked)
        )}
      >
        <p className='m-0 p-0'>{unCheckTitle}</p>
      </div>
    </div>
  );
};

export default ToogleButton;
