interface TitleDecorationProps {
  title: string;
}

const TitleDecoration = ({ title }: TitleDecorationProps) => {
  return (
    <p className='mb-[10px] uppercase leading-[17px] underline underline-offset-[10px]'>
      <span className='inline-block	border-b-[1px] border-[#fff] pb-2'>
        {title}
      </span>
    </p>
  );
};

export default TitleDecoration;
