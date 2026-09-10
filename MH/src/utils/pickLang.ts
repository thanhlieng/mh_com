import { Bilingual } from '@/content/types';

/**
 * Lấy đúng field theo ngôn ngữ hiện tại từ một object song ngữ `{ vi, en }`.
 * Dùng cùng với `useTranslation('common').lang` (next-translate) đã có sẵn
 * trong toàn bộ codebase — xem `src/utils/common-function.ts` cho tiền lệ
 * tương tự (`mappingHomepageDetail`).
 */
export function pickLang(field: Bilingual, lang: string): string {
  return lang === 'en' ? field.en : field.vi;
}
