/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dropdown, Menu } from 'antd';
import Hamburger from 'hamburger-react';
import { useState } from 'react';

import ItemMenu from './ItemMenu';

const DropdownMenu = ({ dataMenu }: { dataMenu: Array<any> }) => {
  const [isOpen, setOpen] = useState(false);

  const menu = (
    <Menu className='mt-3 rounded-[20px] px-[20px] py-[36px] shadow-card-item'>
      {dataMenu?.map((v) => (
        <Menu.Item key={v.href}>
          <ItemMenu
            key={v.href}
            value={v}
            handleAction={() => setOpen(false)}
          />
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']} placement='bottomRight'>
      <span onClick={(e) => e.preventDefault()}>
        <Hamburger toggled={isOpen} toggle={setOpen} />
      </span>
    </Dropdown>
  );
};

export default DropdownMenu;
