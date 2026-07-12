import { createBrowserRouter, redirect } from 'react-router';
import { Root } from './components/Root';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { MenuView } from './components/MenuView';
import { NewOrder } from './components/NewOrder';
import { OrdersList } from './components/OrdersList';
import { ManageUsers } from './components/ManageUsers';
import { ManageProducts } from './components/ManageProducts';
import { Inventory } from './components/Inventory';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, loader: () => redirect('/dashboard') },
      { path: 'dashboard', Component: Dashboard },
      { path: 'menu', Component: MenuView },
      { path: 'orders/new', Component: NewOrder },
      { path: 'orders', Component: OrdersList },
      { path: 'admin/users',     Component: ManageUsers    },
      { path: 'admin/products',  Component: ManageProducts },
      { path: 'admin/inventory', Component: Inventory      },
    ],
  },
]);
