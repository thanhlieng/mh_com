import useTranslation from 'next-translate/useTranslation';
import { useQuery } from 'react-query';

import { EHomePage } from '@/components/FormPolicy/type';
import TextLink from '@/components/links/TextLink';

import { QUERY_POST } from '@/contants/query-key/post.query';
import { getOptionsHomepage } from '@/services/post.service';
import { mappingHomepageDetail } from '@/utils/common-function';

const PolicyACF = () => {
  const { lang } = useTranslation('common');
  const { data, isLoading } = useQuery(
    [QUERY_POST.GET_OPTIONS_HOMEPAGE, { type: EHomePage.TOP }],
    () => getOptionsHomepage(EHomePage.TOP)
  );
  return (
    <div className='flex flex-row items-center gap-[30px] xs:flex-col xs:gap-[20px]'>
      {!isLoading &&
        data?.map((item, i) => {
          const mappingItem = mappingHomepageDetail(item, lang);
          return (
            <TextLink
              key={i}
              href={mappingItem.href}
              label={mappingItem.title}
              styleLabel='font-bold text-[14px]'
            />
          );
        })}
    </div>
  );
};

export default PolicyACF;
