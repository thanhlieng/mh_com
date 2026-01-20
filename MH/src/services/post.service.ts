/* eslint-disable @typescript-eslint/no-explicit-any */
import { EHomePage } from '@/components/FormPolicy/type';

import { QueryParams } from '@/contants/common.constants';
import { IDetailCategory, IDetailsPost, IHomepage } from '@/contants/types';
import HttpRequest from '@/utils/Http-request';

export interface IResponseGetListCategory {
  data: IDetailCategory[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
  };
}

export interface IResponseGetListPost {
  data: IDetailsPost[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPage: number;
  };
}

/// CATEGORY ///
export const getListCategory = async (params: QueryParams) => {
  const categories: IResponseGetListCategory = await HttpRequest.get(
    `posts/category`,
    {
      params: params,
    }
  );
  return categories;
};

export const getCategoryDetails = async (id?: string) => {
  const idSplit = id?.split('.');
  if (!idSplit?.length) {
    return undefined;
  }
  const categories: IDetailCategory = await HttpRequest.get(
    `posts/category/${idSplit[idSplit.length - 1]}`
  );
  return categories;
};

export const deleteCategoryDetails = async (id?: string) => {
  const categories: IResponseGetListCategory = await HttpRequest.delete(
    `posts/category/${id}`
  );
  return categories;
};

export const resetPass = async ({
  id,
  password,
}: {
  id: string;
  password: string;
}) => {
  const categories: IResponseGetListCategory = await HttpRequest.put(
    `admin/users/reset-password`,
    {
      password,
      userId: id,
    }
  );
  return categories;
};

export const updateCategoryDetails = async ({
  id,
  params,
}: {
  id?: string;
  params: any;
}) => {
  if (id) {
    const categories: IResponseGetListCategory = await HttpRequest.patch(
      `posts/category/${id}`,
      {
        ...params,
      }
    );
    return categories;
  }
};
export const createCategoryPostService = async (data: any) => {
  return HttpRequest.post(`posts/create-category-post`, {
    ...data,
  });
};

/// POST ///

export const createPostService = async (data: any) => {
  return HttpRequest.post(`/posts`, {
    ...data,
  });
};

export const getSimilarPosts = async (id: string, limit: number) => {
  const idSplit = id?.split('.');
  if (!idSplit?.length) {
    return undefined;
  }
  const postsSimilar: IDetailsPost[] = await HttpRequest.get(
    `/posts/similar-posts/${idSplit[idSplit.length - 1]}`,
    {
      params: {
        limit: limit,
      },
    }
  );

  return postsSimilar;
};

export const getDetailsPost = async (id: string) => {
  const idSplit = id?.split('.');
  if (!idSplit?.length) {
    return undefined;
  }

  if (id) {
    const dataPost: IDetailsPost = await HttpRequest.get(
      `/posts/${idSplit[idSplit.length - 1]}`
    );
    return dataPost;
  }
};

export const getListPost = async (params: QueryParams) => {
  const posts: IResponseGetListPost = await HttpRequest.get(`/posts`, {
    params: params,
  });

  return posts;
};

export const getDetailsListPost = async (id?: string) => {
  if (id) {
    const posts: IResponseGetListPost = await HttpRequest.get(`/posts/${id}`);

    return posts;
  }
};

export const deleteListPost = async (id: string) => {
  const posts: IResponseGetListPost = await HttpRequest.delete(`/posts/${id}`);

  return posts;
};

export const updateListPost = async ({
  id,
  params,
}: {
  id: string;
  params: any;
}) => {
  const posts: IResponseGetListPost = await HttpRequest.patch(`/posts/${id}`, {
    ...params,
  });

  return posts;
};

/// Homepage ///
export const createItemHomepageService = async (data: any) => {
  return HttpRequest.post(`/homepage`, {
    ...data,
  });
};

export const getPolicy = async (params: QueryParams) => {
  const categories: IResponseGetListCategory = await HttpRequest.get(
    `/homepage/admin`,
    {
      params,
    }
  );

  return categories;
};

export const getOptionsHomepage = async (type: EHomePage) => {
  const result: Array<IHomepage> = await HttpRequest.get('/homepage', {
    params: {
      type: type,
    },
  });

  return result || [];
};

export const detailsPolicy = async (id?: string) => {
  if (id) {
    const categories: IHomepage = await HttpRequest.get(`homepage/${id}`);
    return categories;
  }
};

export const deletePolicy = async (id?: string) => {
  if (id) {
    const categories = await HttpRequest.delete(`homepage/${id}`);

    return categories;
  }
};

export const updatePolicy = async ({
  id,
  params,
}: {
  id?: string;
  params: IHomepage;
}) => {
  if (id) {
    const categories = await HttpRequest.patch(`homepage/${id}`, { ...params });

    return categories;
  }
};
