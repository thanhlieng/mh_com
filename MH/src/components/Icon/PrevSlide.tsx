export default function PrevSlider({ ...props }) {
  return (
    <svg
      width='25'
      height='25'
      viewBox='0 0 25 25'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <rect width='25' height='25' rx='12.5' fill='white' />
      <g clipPath='url(#clip0_522_5945)'>
        <path
          d='M16.4902 12.5C16.4902 12.7509 16.3944 13.0018 16.2032 13.1931L10.1834 19.2128C9.80048 19.5957 9.17962 19.5957 8.79685 19.2128C8.41407 18.83 8.41407 18.2093 8.79685 17.8263L14.1235 12.5L8.79703 7.17371C8.41426 6.79078 8.41426 6.17011 8.79703 5.78737C9.17981 5.40425 9.80066 5.40425 10.1836 5.78737L16.2033 11.807C16.3946 11.9983 16.4902 12.2492 16.4902 12.5Z'
          fill='#4A4A4A'
        />
      </g>
      <defs>
        <clipPath id='clip0_522_5945'>
          <rect
            width='14'
            height='14'
            fill='white'
            transform='translate(5.5 19.5) rotate(-90)'
          />
        </clipPath>
      </defs>
    </svg>
  );
}
