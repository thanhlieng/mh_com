/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CloseOutlined,
  LeftOutlined,
  LogoutOutlined,
  RightOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Button,
  Drawer,
  Form,
  Menu,
  MenuProps,
  Modal,
  notification,
  Popover,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import Hamburger from 'hamburger-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import ItemMenu from '@/container/banner/components/ItemMenu';

import { ADMINISTATOR, ADMINISTATOR_LOGIN } from '@/contants/endpoint';
import { USER } from '@/contants/Storage';
import { routes } from '@/routes/routes';
import { changePassword } from '@/services/booking.services';
import { clearActiveTarget } from '@/store/slices/activeTargetSlice';
import { useAppDispatch } from '@/store/hook';
import storage from '@/utils/storage';

import HeaderMenu from './header-menu';
import HeaderModal from '../common/HeaderModal';
import VInput from '../common/VInput';

type MenuItem = Required<MenuProps>['items'][number];

function getMenuItems(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const MenuContainer = () => {
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  const [isOpenPassword, setIsOpenPasswrod] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { removeAll } = storage();
  const dispatch = useAppDispatch();
  const user = localStorage.getItem(USER);

  const [form] = useForm();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const queryClient = useQueryClient();

  const handleRedirect: MenuProps['onClick'] = (e) => {
    router.push(`${ADMINISTATOR}${e.key.startsWith('/') ? '' : '/'}${e.key}`);
  };

  const getUserName = () => {
    const user = localStorage.getItem(USER);
    try {
      const { username } = JSON.parse(user || '');
      console.log(username);
      return username;
    } catch (error) {
      console.log(error);
    }
  };

  const { mutate } = useMutation(changePassword, {
    onSuccess: () => {
      queryClient.invalidateQueries(['Change-password']);
      notification.success({
        message: 'Thay đổi mật khẩu thành công',
        placement: 'top',
      });
      router.push(ADMINISTATOR_LOGIN);
    },
    onError: (e: any) => {
      notification.error({
        message: `${
          e.response.data
            ? e.response.data.message
            : 'Thay đổi mật khẩu thất bại'
        }`,
        placement: 'top',
      });
    },
  });

  const items: MenuItem[] = routes.map((v) => {
    if (user) {
      const { permissions } = JSON.parse(user);

      const per = v.details.some((x) => {
        return permissions.includes(x);
      });
      if (per) {
        const abc = getMenuItems(
          v.title,
          v.path,
          v.icons,
          v.children?.filter((x: any) =>
            x.details.some((y: any) => permissions.includes(y))
          )
        );
        return abc;
      }
    }
    return null;
  });

  // const items = [
  //   { label: 'item 1', key: 'item-1' }, // remember to pass the key prop
  //   { label: 'item 2', key: 'item-2' }, // which is required
  //   {
  //     label: 'sub menu',
  //     key: 'submenu',
  //     children: [{ label: 'item 3', key: 'submenu-item-1' }],
  //   },
  // ];
  const routerMobile = routes.map((v) => {
    if (user) {
      const { permissions } = JSON.parse(user);
      const per = v.details.every((x) => permissions.includes(x));
      if (per) {
        const { title, path, icons } = v;
        return { title, path, icons };
      }
    }
    return undefined;
  });

  const handleLogout = async () => {
    dispatch(clearActiveTarget());
    removeAll();
    await router.push('/administrator/login');
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

  const defaultSelectKey = [router.asPath];
  const DEFAULT_CLASS = ' flex w-[64px] h-[64px] flex-row items-center mx-auto';
  const COLLAPSE_CLASS = 'flex h-[40px]  items-end justify-center';

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

  const handleOpenChangePassword = () => {
    setIsOpenPasswrod(true);
  };
  const onClose = () => {
    setIsOpenPasswrod(false);
  };

  const handleChangePassword = async () => {
    const res = await form.validateFields();
    mutate({ ...res });
  };

  return (
    <>
      <div className='flex flex-col bg-white pt-9  xs:hidden'>
        <Popover
          className='cursor-pointer'
          placement='right'
          content={
            <div className='flex flex-col gap-4'>
              <Button
                onClick={handleOpenChangePassword}
                className='border-transparent text-left'
                icon={<UserOutlined className='-translate-y-0.5' />}
              >
                Đổi mật khẩu
              </Button>
              <Button
                onClick={handleOpenLogout}
                className='border-transparent text-left'
                icon={<LogoutOutlined className='-translate-y-0.5' />}
              >
                Đăng xuất
              </Button>
            </div>
          }
          title={`Xin chào ${getUserName()}`}
        >
          <div className={!collapsed ? DEFAULT_CLASS : COLLAPSE_CLASS}>
            <Image
              src='/images/avata.png'
              width={64}
              height={64}
              alt='avata'
              className='m-auto'
            />
          </div>
        </Popover>
        <div className='flex-1'>
          <Menu
            onClick={handleRedirect}
            defaultSelectedKeys={defaultSelectKey}
            mode='inline'
            defaultOpenKeys={defaultSelectKey}
            inlineCollapsed={collapsed}
            className='border-none'
            items={items}
          />
        </div>
        <div className='w-full border-t-[1px] border-gray-400 py-1'>
          <HeaderMenu collapsed={collapsed} onHandleClick={toggleCollapsed}>
            {collapsed ? <RightOutlined /> : <LeftOutlined />}
          </HeaderMenu>
        </div>
      </div>

      {/* mobile */}
      <div className=' hidden bg-[#1464a9] xs:block'>
        <div className='flex justify-between p-4'>
          <Image
            src='/images/logo-header.png'
            width={120}
            height={40}
            alt='logo-header'
            onClick={() => router.push('/')}
            className='cursor-pointer'
          />
          <Hamburger toggled={isOpen} toggle={setOpen} />
        </div>
        <Drawer
          title={rendeDrawerHeader()}
          placement='left'
          destroyOnClose={true}
          visible={isOpen}
          closeIcon={<span></span>}
          onClose={() => setOpen(false)}
        >
          <div className='flex flex-col items-center gap-5'>
            {routerMobile
              .filter((x) => x !== undefined)
              .map((v) => {
                const data = {
                  href: `/administrator/${v?.path}`,
                  title: v?.title,
                };
                return (
                  <div key={v?.path}>
                    <ItemMenu
                      key={v?.path}
                      value={data}
                      handleAction={() => setOpen(false)}
                    />
                  </div>
                );
              })}
          </div>

          <div className='mt-[50px] flex flex-row items-center justify-center gap-[14px]'>
            <Button
              onClick={handleOpenLogout}
              className='border-transparent text-left'
              icon={<LogoutOutlined className='-translate-y-0.5' />}
            >
              Đăng xuất
            </Button>
          </div>
        </Drawer>
      </div>

      <Modal
        footer={null}
        open={isOpenPassword}
        title={<HeaderModal title='Đổi mật khẩu' onClose={onClose} />}
        destroyOnClose
        closeIcon={false}
        closable={false}
        onCancel={onClose}
        className='top-[20px] w-[calc(40vw)] overflow-auto xs:top-0 xs:m-0 xs:h-screen xs:w-screen xs:p-0 sm:top-0 sm:w-screen'
      >
        <Form form={form}>
          <Form.Item name='register'>
            <Form.Item
              name='oldPassword'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mật khẩu cũ',
                },
              ]}
            >
              <VInput
                label='Mật khẩu hiện tại'
                type='password'
                isHorizal
                className='rounded-[12px] px-[20px] py-[10px]'
              />
            </Form.Item>
            <Form.Item
              name='newPassword'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mật khẩu mới',
                },
                {
                  min: 6,
                  message: 'Mật khẩu mới cần có độ dài lớn hơn 6 ký tự',
                },
              ]}
            >
              <VInput
                label='Mật khẩu mới'
                type='password'
                isHorizal
                className='rounded-[12px] px-[20px] py-[10px]'
              />
            </Form.Item>
            <Form.Item
              name='confirmPassword'
              rules={[
                {
                  required: true,
                  message: 'Vui lòng xác nhận mật khẩu mới ',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('Xác nhận mật khẩu không chính xác')
                    );
                  },
                }),
              ]}
            >
              <VInput
                label='Xác nhận mật khẩu mới'
                type='password'
                isHorizal
                className='rounded-[12px] px-[20px] py-[10px]'
              />
            </Form.Item>
            <div className='flex flex-row justify-between'>
              <button
                onClick={handleChangePassword}
                className='cs rounded-[12px] bg-yellow-secondary px-[20px] py-[10px] text-[#fff]'
              >
                <p className='m-0 p-0 text-[14px] leading-[17px]'>Xác nhận</p>
              </button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MenuContainer;
