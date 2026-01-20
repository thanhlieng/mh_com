export type PolicyHeader = {
  nameVi: string;
  nameEn: string;
  link?: string;
  typeLink: EHomePage;
  categoryId?: string;
  postId?: string;
  type: ETypeLinkHomepage;
  active: boolean;
};
export enum EHomePage {
  TOP = 'TOP',
  HEADER = 'HEADER',
  BODY = 'BODY',
  FOOTER = 'FOOTER',
  SERVICE = 'SERVICE',
}

export enum ETypeLinkHomepage {
  LINK = 'LINK',
  CATEGORY = 'CATEGORY',
  POST = 'POST',
}
