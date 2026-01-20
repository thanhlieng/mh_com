/* eslint-disable @typescript-eslint/no-explicit-any */
import NextSlide from '../Icon/NextSlide';
import PrevSlider from '../Icon/PrevSlide';

const ItemControlTableRender = (_: any, type: string, originalElement: any) => {
  if (type === 'prev') {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <NextSlide />
      </div>
    );
  }
  if (type === 'next') {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <PrevSlider />
      </div>
    );
  }
  return originalElement;
};

export default ItemControlTableRender;
