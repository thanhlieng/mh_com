import clsx from 'clsx';
import useTranslation from 'next-translate/useTranslation';
import { useQuery } from 'react-query';

import { QUERY_POST } from '@/contants/query-key/post.query';
import { IListLink } from '@/contants/types';
import { getOptionsHomepage } from '@/services/post.service';
import {
  mappingHomepageDetail,
  mappingPostData,
} from '@/utils/common-function';

import CopyRight from './components/CopyRight';
import FooterAssitance from './components/FooterAssitance';
import FooterInfo from './components/FooterInfo';
import Social from './components/Social';
import { EHomePage } from '../FormPolicy/type';

const FooterACF = () => {
  const { lang } = useTranslation('common');
  const { data } = useQuery(
    [QUERY_POST.GET_OPTIONS_HOMEPAGE, { type: EHomePage.FOOTER }],
    () => getOptionsHomepage(EHomePage.FOOTER)
  );

  const grid = 'grid grid-cols-3 sm:grid-cols-2 xs:grid-cols-1';
  const bg = 'text-color-footer';
  const padding =
    'gap-x-4 xs:gap-[30px] xs:gap-x-[15px] py-14 xs:px-1 xs:py-10 sm:px-9 sm:py-14 xs:px-[30px] px-[38px]';
  return (
    <div className='bg-[url(/images/footer-bg.jpg)] bg-cover bg-center bg-no-repeat'>
      <div className={clsx(grid, bg, padding)}>
        <FooterInfo />
        <div className='grid gap-x-4 xs:grid-cols-1 xs:gap-[30px]  sm:grid-cols-2 md:grid-cols-2'>
          {/* <FooterAssitance
            title='liên hệ và hỗ trợ'
            listLink={dataSupportFake}
          />
          <FooterAssitance
            title='Thông báo pháp lý'
            listLink={dataLicenseFake}
          /> */}
          {data?.length || 0 > 0
            ? data?.map((v, i) => {
                if (i + 1 === data?.length) {
                  return;
                }
                const dataMapping = mappingHomepageDetail(v, lang);
                return (
                  <FooterAssitance
                    key={v.id}
                    title={dataMapping.title}
                    listLink={
                      v?.category?.posts?.map((post): IListLink => {
                        const postMapping = mappingPostData(post, lang);
                        return {
                          title: postMapping.title,
                          href: postMapping.path,
                        };
                      }) || []
                    }
                  />
                );
              })
            : ''}
        </div>
        <div className='grid grid-cols-1 gap-x-4 gap-y-[48px] sm:col-span-2 sm:col-start-2 sm:grid-cols-2'>
          {(function () {
            if (!data?.length) {
              return;
            }
            const lastFooter = data[data.length - 1];
            const dataMapping = mappingHomepageDetail(lastFooter, lang);
            return (
              <FooterAssitance
                title={dataMapping.title}
                listLink={
                  lastFooter?.category?.posts?.map((post): IListLink => {
                    const postMapping = mappingPostData(post, lang);
                    return {
                      title: postMapping.title,
                      href: postMapping.path,
                    };
                  }) || []
                }
              />
            );
          })()}
          {/* <RegisterForSale /> */}
        </div>
      </div>

      <Social />

      <CopyRight />
    </div>
  );
};

export default FooterACF;
