/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

declare module 'react-slick' {
  export interface Settings {
    dots?: boolean;
    infinite?: boolean;
    speed?: number;
    slidesToShow?: number;
    slidesToScroll?: number;
    autoplay?: boolean;
    autoplaySpeed?: number;
    arrows?: boolean;
    pauseOnHover?: boolean;
    responsive?: Array<{
      breakpoint: number;
      settings: Partial<Settings> | 'unslick';
    }>;
    [key: string]: any;
  }

  class Slider extends React.Component<Settings & { children?: React.ReactNode }> {
    slickNext(): void;
    slickPrev(): void;
    slickGoTo(slideNumber: number): void;
    slickPause(): void;
    slickPlay(): void;
  }

  export default Slider;
}
