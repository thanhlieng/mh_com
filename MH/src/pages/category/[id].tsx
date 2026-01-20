/* eslint-disable unused-imports/no-unused-vars */
import Image from 'next/image';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useQuery } from 'react-query';

import CardArticleItems from '@/components/Card/CardItems';

import { QUERY_POST } from '@/contants/query-key/post.query';
import {
  IDetailCategory,
  IDetailCategoryDisplay,
  IDetailPostDisplay,
  IDetailsPost,
} from '@/contants/types';
import { getCategoryDetails } from '@/services/post.service';
import { mappingCategoryData, mappingPostData } from '@/utils/common-function';

const CategoryContainer = () => {
  const { lang } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  const { data: detailCategory, isLoading } = useQuery(
    [QUERY_POST.GET_DETAIL_CATEGORY, id],
    () => getCategoryDetails(id as string)
  );
  const postsCategory: IDetailsPost[] = detailCategory?.posts?.length
    ? detailCategory?.posts
    : [];
  const postsClass1: IDetailsPost[] = postsCategory.slice(0, 4);
  const postsClass2: IDetailsPost[] = postsCategory.slice(4);
  const mappingPostsClass1: IDetailPostDisplay[] = postsClass1.map((post) =>
    mappingPostData(post, lang)
  );
  const mappingPostsClass2: IDetailPostDisplay[] = postsClass2.map((post) =>
    mappingPostData(post, lang)
  );
  const mappingCategoryDetail: IDetailCategoryDisplay = mappingCategoryData(
    detailCategory as IDetailCategory,
    lang
  );

  return (
    <div className='mb-[86px] grid gap-[14px] p-[38px]'>
      <div className='my-[50px] flex items-center justify-center gap-[10px] '>
        <Image src='/images/box.svg' width={40} height={40} alt='' />
        <p className='m-0 p-0 text-[18px] font-medium uppercase leading-[22px]'>
          {mappingCategoryDetail.name}
        </p>
      </div>
      <div className='grid grid-cols-2 gap-[14px] xs:grid-cols-1'>
        {mappingPostsClass1.map(
          ({ thumbnail, title, description, path }, key) => (
            <CardArticleItems
              key={key}
              url={path}
              srcImage={thumbnail}
              title={title}
              description={description}
            />
          )
        )}
      </div>

      <div className='grid grid-cols-3 gap-[14px] xs:grid-cols-1 '>
        {mappingPostsClass2.map(
          ({ thumbnail, title, description, path }, key) => (
            <CardArticleItems
              key={key}
              url={path}
              srcImage={thumbnail}
              title={title}
              description={description}
            />
          )
        )}
      </div>
    </div>
  );
};

export default CategoryContainer;
