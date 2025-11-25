import { ROUTES } from './routes.constant';

export const NAV_ITEMS = [
  {
    label: 'Users List',
    path: ROUTES.product_list,
  },
  {
    label: 'Local Users',
    path: ROUTES.LOCAL_USERS,
  },
] as const;
