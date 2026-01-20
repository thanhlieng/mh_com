import CloseIcon from '../Icon/CloseIcon';

const HeaderModal = ({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) => {
  return (
    <div className='flex flex-row items-center justify-between p-4 '>
      <p className='m-0 p-0 text-left text-[18px] font-bold leading-[22px]'>
        {title}
      </p>
      <div onClick={onClose} className='cursor-pointer'>
        <CloseIcon />
      </div>
    </div>
  );
};

export default HeaderModal;
