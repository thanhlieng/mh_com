/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextComponentType } from 'next';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import I18nProvider from 'next-translate/I18nProvider';
import useTranslation from 'next-translate/useTranslation';
import { QueryClient, QueryClientProvider } from 'react-query';
import '@fontsource/roboto';

import '@/styles/globals.css';
import 'antd/dist/antd.css';

// import 'react-quill/dist/quill.snow.css';
// import '~slick-carousel/slick/slick.css';
// import '~slick-carousel/slick/slick-theme.css';
// import HomeLayout from '@/layout/HomeLayout';
const HomeLayout = dynamic(() => import('@/layout/HomeLayout'), { ssr: false });

interface CustomAppProps extends AppProps {
  Component: NextComponentType & {
    Layout?: any;
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function MyApp({ Component, pageProps }: CustomAppProps) {
  const Layout = Component.Layout || HomeLayout;

  const { lang } = useTranslation('common');

  return (
    <>
      <Head>
        <title>MH Great Sun</title>
        <meta name='description' />
        <meta
          name='viewport'
          content='minimum-scale=1, initial-scale=1, width=device-width'
        />
        <link href='https://fonts.cdnfonts.com/css/inter' rel='stylesheet' />
        <link
          href='https://fonts.googleapis.com/css?family=Roboto:400,100,100italic,300,300italic,400italic,500,500italic,700,700italic,900italic,900'
          rel='stylesheet'
          type='text/css'
        />
        <link
          rel='stylesheet'
          href='https://unpkg.com/react-quill@1.3.3/dist/quill.snow.css'
        />
      </Head>
      <QueryClientProvider client={queryClient}>
        {/* <Provider store={store}> */}
        <Layout>
          <I18nProvider lang={lang}>
            <Component {...pageProps} />
          </I18nProvider>
        </Layout>
        {/* </Provider> */}
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
