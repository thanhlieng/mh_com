/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApartmentOutlined,
  CoffeeOutlined,
  ControlOutlined,
  DeploymentUnitOutlined,
  HistoryOutlined,
  InboxOutlined,
  OrderedListOutlined,
  ProfileOutlined,
  SendOutlined,
  ShoppingCartOutlined,
  SisternodeOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';

interface IRoutes {
  path: string;
  icons?: React.ReactNode;
  title: string;
  details: Array<string>;
  children?: any;
}

export const routes: IRoutes[] = [
  {
    title: 'Nhân viên',
    path: `/employee`,
    icons: <UserOutlined className='-translate-x-1 text-xl' />,
    details: ['get_list_staff'],
  },
  {
    title: 'Khách hàng',
    path: `/customer`,
    icons: <TeamOutlined className='-translate-x-1 text-xl' />,
    details: ['get_list_customer', 'get_all_list_customer'],
  },
  {
    title: 'Đơn hàng',
    path: `/order`,
    icons: <UnorderedListOutlined className='-translate-x-1 text-xl' />,
    details: [
      'get_list_booking',
      'get_list_booking_for_customer_management_staff',
    ],
  },

  {
    title: 'Check point',
    path: `/checkpoint`,
    icons: <DeploymentUnitOutlined className='-translate-x-1 text-xl' />,
    details: ['manage_tracking_checkpoint'],
  },
  {
    title: 'Pickup',
    path: `/pickup`,
    icons: <ShoppingCartOutlined className='-translate-x-1 text-xl' />,
    details: ['manage_pick_up'],
  },

  {
    title: 'Vận hành',
    path: `/operate`,
    icons: <SisternodeOutlined className='-translate-x-1 text-xl' />,
    details: ['manage_operate'],
  },
  {
    title: 'Báo cáo',
    path: `/pod-report`,
    icons: <DeploymentUnitOutlined className='-translate-x-1 text-xl' />,
    details: [
      'manage_operate',
      'statistical_by_staff',
      'statistical_by_customer',
      'statistical_revenue_by_customer',
      'statistical_by_service',
    ],
    children: [
      {
        label: 'Báo cáo POD',
        key: `/pod-report`,
        icons: <DeploymentUnitOutlined className='-translate-x-1 text-xl' />,
        details: ['manage_operate'],
      },
      {
        label: 'ĐH còn tồn trên 4 ngày',
        path: `/order-remaining`,
        icons: <InboxOutlined className='-translate-x-1 text-xl' />,
        details: ['manage_operate'],
        key: `/order-remaining`,
      },
      {
        label: 'Báo cáo chi tiết Doanh thu - Giá vốn',
        path: `/report`,
        icons: <OrderedListOutlined className='-translate-x-1 text-xl' />,
        details: ['statistical_by_staff'],
        key: `/report`,
      },
      {
        label: 'Report theo KH và KD',
        path: `/statistical-customer`,
        icons: <OrderedListOutlined className='-translate-x-1 text-xl' />,
        details: ['statistical_by_customer'],
        key: `/statistical-customer`,
      },
      {
        label: 'Report KH Không vào mạng và gửi giảm',
        path: `/statistical-revenue-customer`,
        icons: <OrderedListOutlined className='-translate-x-1 text-xl' />,
        details: ['statistical_revenue_by_customer'],
        key: `/statistical-revenue-customer`,
      },
      {
        label: 'Report theo Dịch vụ',
        path: `/statistical-service`,
        icons: <OrderedListOutlined className='-translate-x-1 text-xl' />,
        details: ['statistical_by_service'],
        key: `/statistical-service`,
      },
    ],
  },

  {
    title: 'Danh mục master',
    path: `/catergory-master`,
    icons: <ApartmentOutlined className='-translate-x-1 text-xl' />,
    details: ['manage_category'],
  },
  {
    title: 'Quản Lý trang chủ',
    path: `/home-manager`,
    icons: <ProfileOutlined className='-translate-x-1 text-xl' />,
    details: ['manage_homepage'],
  },
  {
    title: 'Vai trò',
    path: `/role-permission`,
    icons: <ControlOutlined className='-translate-x-1 text-xl' />,
    details: ['get_list_role'],
  },
  {
    title: 'Phân phối đơn hàng',
    path: `/assign-pick-up`,
    icons: <CoffeeOutlined className='-translate-x-1 text-xl' />,
    details: ['assignee_booking'],
  },
  {
    title: 'Đơn hàng chờ lấy hàng',
    path: `/order-pickup`,
    icons: <InboxOutlined className='-translate-x-1 text-xl' />,
    details: ['get_list_my_assignee_booking'],
  },
  {
    title: 'Bảng kê',
    path: `/list`,
    icons: <OrderedListOutlined className='-translate-x-1 text-xl' />,
    details: ['get_cargo_list'],
  },
  {
    title: 'Manifest',
    path: `/manifest`,
    icons: <SendOutlined className='-translate-x-1 text-xl' />,
    details: [
      'manage_manifest_yamato_southern_for_partner',
      'manage_manifest_yamato_north_for_partner',
      'manage_manifest_yamato_southern',
      'manage_manifest_yamato_north',
      'manage_manifest_k_cargo',
      'manage_manifest_k_cargo_partner',
    ],
  },
  {
    title: 'Truy vết',
    path: `/history`,
    icons: <HistoryOutlined className='-translate-x-1 text-xl' />,
    details: ['manage_history'],
  },
];

export const MANAGER_PAGES = '/manager';
export const MANAGER_BOOKINGS = '/manager/booking';

export const SUPPLIER_HOME = '/supplier';
export const SUPPLIER_COST_STATEMENT = '/supplier/cost-statement';
export const SUPPLIER_PAYMENT_MANAGEMENT = '/supplier/payment-management';
export const SUPPLIER_SHIPPING_RATE = '/supplier/shipping-rate';
