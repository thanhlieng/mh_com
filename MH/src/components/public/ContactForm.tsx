import useTranslation from 'next-translate/useTranslation';
import { FormEvent, useState } from 'react';

import { CtaButton } from '@/components/ui/CtaButton';

import { contactContent } from '@/content/contact.content';
import { pickLang } from '@/utils/pickLang';

const COPY = {
  company: { vi: 'Tên doanh nghiệp', en: 'Company name' },
  person: { vi: 'Người liên hệ', en: 'Contact person' },
  email: { vi: 'Email', en: 'Email' },
  phone: { vi: 'Số điện thoại', en: 'Phone number' },
  message: { vi: 'Nội dung cần tư vấn', en: 'What do you need help with?' },
  submit: { vi: 'Gửi yêu cầu', en: 'Send request' },
  required: { vi: 'bắt buộc', en: 'required' },
  subject: { vi: 'Yêu cầu tư vấn từ website', en: 'Advisory request from the website' },
  note: {
    vi: 'Nút gửi sẽ mở ứng dụng email của bạn với nội dung đã điền sẵn.',
    en: 'Submitting opens your email app with the message pre-filled.',
  },
};

const field =
  'w-full rounded border border-surface-line bg-white px-4 py-3 font-display text-sm text-navy-600 placeholder:text-ink-soft/50 transition-colors focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-200';

/**
 * Biểu mẫu liên hệ theo spec `Demo_noi_dung_website_MHGS_261015.pdf` mục 5 —
 * đúng 5 trường: tên doanh nghiệp, người liên hệ, email, số điện thoại,
 * nội dung cần tư vấn.
 *
 * ⚠️ Backend CHƯA có endpoint nhận liên hệ. Để không dựng một form bấm xong
 * không gửi đi đâu, nút gửi soạn sẵn email tới địa chỉ trong
 * `contact.content.ts` qua `mailto:` — người dùng chỉ việc bấm Gửi trong ứng
 * dụng mail. Khi có `POST /api/public/quote-requests`, thay thân hàm
 * `handleSubmit` bằng lời gọi API, phần giao diện giữ nguyên.
 */
export function ContactForm() {
  const { lang } = useTranslation('common');
  const [form, setForm] = useState({
    company: '',
    person: '',
    email: '',
    phone: '',
    message: '',
  });

  const emailChannel = contactContent.channels.find((c) => c.kind === 'email');

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!emailChannel) return;

    const l = (b: { vi: string; en: string }) => pickLang(b, lang);
    const body = [
      `${l(COPY.company)}: ${form.company}`,
      `${l(COPY.person)}: ${form.person}`,
      `${l(COPY.email)}: ${form.email}`,
      `${l(COPY.phone)}: ${form.phone}`,
      '',
      `${l(COPY.message)}:`,
      form.message,
    ].join('\n');

    window.location.href = `mailto:${emailChannel.value}?subject=${encodeURIComponent(
      l(COPY.subject)
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
      <div className='grid grid-cols-1 gap-5 tab:grid-cols-2'>
        <div>
          <label htmlFor='company' className='mb-2 block font-display text-sm font-medium text-navy-600'>
            {pickLang(COPY.company, lang)}
          </label>
          <input id='company' value={form.company} onChange={set('company')} className={field} required />
        </div>

        <div>
          <label htmlFor='person' className='mb-2 block font-display text-sm font-medium text-navy-600'>
            {pickLang(COPY.person, lang)}
          </label>
          <input id='person' value={form.person} onChange={set('person')} className={field} required />
        </div>

        <div>
          <label htmlFor='email' className='mb-2 block font-display text-sm font-medium text-navy-600'>
            {pickLang(COPY.email, lang)}
          </label>
          <input
            id='email'
            type='email'
            value={form.email}
            onChange={set('email')}
            className={field}
            required
          />
        </div>

        <div>
          <label htmlFor='phone' className='mb-2 block font-display text-sm font-medium text-navy-600'>
            {pickLang(COPY.phone, lang)}
          </label>
          <input
            id='phone'
            type='tel'
            value={form.phone}
            onChange={set('phone')}
            className={field}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor='message' className='mb-2 block font-display text-sm font-medium text-navy-600'>
          {pickLang(COPY.message, lang)}
        </label>
        <textarea
          id='message'
          rows={5}
          value={form.message}
          onChange={set('message')}
          className={`${field} resize-y`}
          required
        />
      </div>

      <div className='flex flex-wrap items-center gap-4'>
        <CtaButton type='submit' variant='solid' size='lg'>
          {pickLang(COPY.submit, lang)}
        </CtaButton>
        <span className='text-xs text-ink-soft'>{pickLang(COPY.note, lang)}</span>
      </div>
    </form>
  );
}
