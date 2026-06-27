/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import { CloseOutlined, WarningOutlined } from '@ant-design/icons';
import { Divider, Drawer, Modal } from 'antd';
import Hamburger from 'hamburger-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import { EHomePage } from '@/components/FormPolicy/type';

import { dataMenuManager } from '@/contants/mock-data/mock-data';
import { QUERY_POST } from '@/contants/query-key/post.query';
import { ACCSESS_TOKEN } from '@/contants/Storage';
import { IDataHomepage } from '@/contants/types';
import { MANAGER_PAGES } from '@/routes/routes';
import { getOptionsHomepage } from '@/services/post.service';
import { mappingOptionsHomepage } from '@/utils/common-function';
import storage from '@/utils/storage';

import DropdownMenu from './components/DropDownMenu';
import InfoUser from './components/InfoUser';
import ItemMenu from './components/ItemMenu';
import LangugeCompany from './components/languge-co';
import PolicyACF from './components/PolicyACF';

const BannerContainer = () => {
  const { t, lang } = useTranslation('common');
  const { removeAll } = storage();

  const router = useRouter();
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [isOpen, setOpen] = useState(false);
  const [isFixed, setIsFixed] = useState<boolean>(false);
  const [dataMenu, setDataMenu] = useState<IDataHomepage[]>([]);
  const { data } = useQuery(
    [QUERY_POST.GET_OPTIONS_HOMEPAGE, { type: EHomePage.HEADER }],
    () => getOptionsHomepage(EHomePage.HEADER)
  );
  useEffect(() => {
    setDataMenu(mappingOptionsHomepage(data as any[], lang));
  }, [data, lang]);

  useEffect(() => {
    const accessToken = storage().getItem(ACCSESS_TOKEN);
    const isManager = router.pathname.search(MANAGER_PAGES);
    if (accessToken && !isManager) {
      setIsLogin(true);
    }
  }, [router]);
  const handleLogout = async () => {
    removeAll();
    setIsLogin(false);
    await router.push('/');
  };
  const handleOpenLogout = () => {
    Modal.confirm({
      title: 'Thông báo',
      icon: <WarningOutlined className='text-red-700' />,
      content: 'Bạn có chắc chắn muốn đăng xuất tài khoản',
      okText: 'Đồng ý',
      cancelText: 'Không',
      onOk: handleLogout,
    });
  };
  const rendeDrawerHeader = () => {
    return (
      <div className='h-[40px] px-[15px] py-[20px]'>
        <div className=' flex flex-row justify-between'>
          <Image
            width={54}
            height={20}
            src='/images/mobile-logo.svg'
            alt='logo'
          />

          <CloseOutlined
            onClick={() => setOpen(false)}
            className='text-[20px]'
          />
        </div>
      </div>
    );
  };
  const handleScroll = (event: any) => {
    // setScrollTop(event.currentTarget.scrollTop);
    if (event.currentTarget.scrollY >= 30) {
      setIsFixed(true);
    } else {
      setIsFixed(false);
    }
    // setIsFixed(false);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className=' bg-header w-full'>
      <div
        className='flex h-[37px] w-full flex-row-reverse items-center gap-x-[30px]  px-[38px] xs:hidden '
        style={{
          display: isFixed ? 'none' : 'block',
        }}
      >
        <LangugeCompany />
        <PolicyACF />
      </div>
      <div
        className=' bg-header flex h-[60px] w-full items-center'
        style={{
          position: isFixed ? 'fixed' : 'static',
          top: 0,
          zIndex: isFixed ? 99999 : 0,
        }}
      >
        <div className='px-[38px]'>
          <Image
            src='/images/logo-header.png'
            width={460}
            height={60}
            alt='logo-header'
            onClick={() => router.push('/')}
            className='cursor-pointer'
          />
        </div>
        <div className='flex-1'>
          <div className='hidden flex-row justify-center gap-[30px] md:flex'>
            {isLogin
              ? dataMenuManager.map((v) => (
                  <div key={v.href} className='flex flex-col text-center'>
                    <ItemMenu
                      value={v}
                      handleAction={() => setOpen(false)}
                      styleLabel='font-bold text-[16px]'
                    />
                  </div>
                ))
              : dataMenu.map((v) => (
                  <div key={v.href} className='flex flex-col text-center'>
                    <ItemMenu
                      key={v.href}
                      value={v}
                      handleAction={() => setOpen(false)}
                      styleLabel='font-bold text-[16px]'
                    />
                  </div>
                ))}
          </div>
        </div>
        <div className='flex flex-row  justify-center px-[38px]'>
          <div className='flex flex-row items-center justify-center gap-[14px] xs:hidden'>
            {isLogin ? (
              <InfoUser handleLogout={handleOpenLogout} />
            ) : (
              <div>
                <button
                  className='h-[38px] w-[100px] rounded-[10px] bg-[#Fff]  font-medium text-[#1464a9]  outline-0'
                  onClick={() => router.push('/register')}
                >
                  {t('Register')}
                </button>
              </div>
            )}
            {!isLogin && (
              <button
                className='h-[38px] w-[100px] rounded-[10px] bg-[#1464a9] text-[14px] font-medium leading-[17px] text-[#fff] outline-0'
                onClick={() => router.push('/login-home')}
              >
                {t('Login')}
              </button>
            )}
          </div>
          <div className='sm:hidden md:hidden'>
            <Hamburger toggled={isOpen} toggle={setOpen} />
          </div>

          <div className='xs:hidden md:hidden'>
            <DropdownMenu dataMenu={dataMenu} />
          </div>
        </div>
      </div>

      <Drawer
        title={rendeDrawerHeader()}
        placement='left'
        destroyOnClose={true}
        open={isOpen}
        closeIcon={<span></span>}
        onClose={() => setOpen(false)}
      >
        <div className='flex flex-col items-center gap-5'>
          {isLogin
            ? dataMenuManager.map((v) => (
                <div key={v.href}>
                  <ItemMenu value={v} handleAction={() => setOpen(false)} />
                </div>
              ))
            : dataMenu.map((v) => (
                <div key={v.href}>
                  <ItemMenu
                    key={v.href}
                    value={v}
                    handleAction={() => setOpen(false)}
                  />
                </div>
              ))}
        </div>
        <Divider />

        <PolicyACF />

        <div className='mt-[20px] flex justify-center'>
          <LangugeCompany />
        </div>

        <div className='mt-[50px] flex flex-row items-center justify-center gap-[14px]'>
          {isLogin ? (
            <button
              className='h-[38px] w-[100px] rounded-[10px] bg-[#F2F2F2]  font-medium text-[#1F1F1F] outline-0'
              onClick={handleOpenLogout}
            >
              Đăng xuất
            </button>
          ) : (
            <div>
              <button
                className='h-[38px] w-[100px] rounded-[10px] bg-[#F2F2F2]  font-medium text-[#1F1F1F]  outline-0'
                onClick={() => {
                  setOpen(false);
                  router.push('/register');
                }}
              >
                {t('Register')}
              </button>
            </div>
          )}
          {!isLogin && (
            <button
              className='h-[38px] w-[100px] rounded-[10px] bg-[#1464a9] text-[14px] font-medium leading-[17px] text-[#fff] outline-0'
              onClick={() => {
                router.push('/login-home');
                setOpen(false);
              }}
            >
              {t('Login')}
            </button>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default BannerContainer;
