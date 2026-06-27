/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Divider, Spin } from 'antd';
import moment from 'moment';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import { useQuery } from 'react-query';

import CardMedia from '@/components/Card/CardMedia';

import { QUERY_POST } from '@/contants/query-key/post.query';
import { IDetailPostDisplay } from '@/contants/types';
import { getDetailsPost, getSimilarPosts } from '@/services/post.service';
import { mappingPostData } from '@/utils/common-function';

const DetailPost = () => {
  const router = useRouter();
  const { lang } = useTranslation('common');

  const isVi = lang === 'vi';

  const { slug } = router.query;

  const { data: detailsPost, isLoading } = useQuery(
    [QUERY_POST.GET_DETAILS_POST, slug],
    () => getDetailsPost(slug?.toString() as string)
  );

  const { data: postsSimilar } = useQuery(
    [QUERY_POST.GET_POSTS_SIMILAR, slug],
    () => getSimilarPosts(slug?.toString() as string, 5)
  );

  const mappingPostsSimilarDisplay: IDetailPostDisplay[] = postsSimilar?.length
    ? postsSimilar.map((post) => mappingPostData(post, lang))
    : [];

  const dataIcon = [
    { url: '/images/fb-icon.svg' },
    { url: '/images/gmail-icon.svg' },
    { url: '/images/tiwtter-icon.svg' },
    { url: '/images/printertes-icon.svg' },
  ];

  return (
    <div className='px-[38px] py-[40px] xs:px-[15px] '>
      <Spin spinning={isLoading}>
        <div className='grid grid-cols-4 gap-[40px] xs:grid-cols-1'>
          <div className='col-span-3'>
            <p className='m-0 p-0 text-[24px] font-semibold uppercase leading-[29px] text-[#1F1F1F]'>
              {isVi ? detailsPost?.titleVi : detailsPost?.titleEn}
            </p>
            <p className='mt-[10px] text-[12px] font-light leading-[15px] text-[#6F6D6D]'>
              {moment(detailsPost?.updatedAt).format('DD/MM/YYYY hh:mm:ss')}
            </p>

            <div className='flex flex-row gap-4'>
              <img
                src={detailsPost?.thumbnail}
                alt='thumnails'
                className='  mr-[15px] h-auto w-full max-w-[500px] rounded-[10px] object-fill xs:max-h-[250px]'
              />
              <p className='float-left'>
                {isVi ? detailsPost?.descriptionVi : detailsPost?.descriptionEn}
              </p>
            </div>
            <br />
            <div
              className='dangerousHTml'
              dangerouslySetInnerHTML={{
                __html: (isVi
                  ? detailsPost?.contentVi
                  : detailsPost?.contentEn) as string,
              }}
            />

            <Divider />

            <div className='flex flex-row items-center gap-[14px] xs:hidden'>
              <p className='m-0 p-0'>Chia sẻ bài viết</p>
              {dataIcon.map(({ url }, i) => (
                <img src={url} key={i} alt='ico' />
              ))}
            </div>
          </div>
          <div className='flex flex-col gap-[24px]'>
            <div>
              <p className='text-[18px] font-medium leading-[22px]'>
                Tin tức liên quan
              </p>
              <Divider />
              <div className='flex flex-col gap-[24px]'>
                {mappingPostsSimilarDisplay.map((v, i) => (
                  <CardMedia
                    key={i}
                    title={v.title}
                    description={v.description}
                    src={v.thumbnail}
                    url={v.path}
                    content={v.content}
                  />
                ))}
              </div>
            </div>

            {/* <div>
              <p className='text-[18px] font-medium leading-[22px]'>
                Video của công ty
              </p>
              <Divider />
              <div className='flex flex-col gap-[24px]'>
                {mappingPostsSimilarDisplay.map((v, i) => (
                  <CardMedia
                    key={i}
                    title={v.title}
                    description={v.description}
                    src={v.thumbnail}
                    url={v.path}
                    content={v.content}
                  />
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default DetailPost;
