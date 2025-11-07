import { ROUTES } from './routes.constant';

export const NAV_ITEMS = [
  {
    label: 'Users List',
    path: ROUTES.USERS_LIST,
  },
  {
    label: 'Local Users',
    path: ROUTES.LOCAL_USERS,
  },
] as const;
