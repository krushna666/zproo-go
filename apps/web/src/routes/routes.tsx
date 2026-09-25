import type { RouteObject } from 'react-router';
import { PageLoader } from '@/components/feedback/PageLoader';
import { RouteError } from '@/components/feedback/RouteError';
import { PublicLayout } from '@/layouts/PublicLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AUTH_ROUTES, PUBLIC_ROUTES } from './routeMap';

/** Route-level code splitting: each page (and the whole admin area) loads on demand. */
const page = (loader: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await loader()).default,
});

const plannedPage = page(() => import('@/pages/PlannedPage'));

/** Shown while the first route's code loads (continues the index.html boot splash). */
const splash = <PageLoader fullscreen />;

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: splash,
    children: [
      { index: true, lazy: page(() => import('@/pages/HomePage')) },
      ...PUBLIC_ROUTES.map((meta) => ({ path: meta.path, handle: meta, lazy: plannedPage })),
      // Eager: also used by the error boundary, so it is already in the main bundle.
      { path: '*', Component: NotFoundPage },
    ],
  },
  {
    lazy: async () => ({ Component: (await import('@/layouts/AuthLayout')).AuthLayout }),
    errorElement: <RouteError />,
    hydrateFallbackElement: splash,
    children: AUTH_ROUTES.map((meta) => ({ path: meta.path, handle: meta, lazy: plannedPage })),
  },
  {
    path: '/admin',
    lazy: async () => ({ Component: (await import('@/layouts/AdminLayout')).AdminLayout }),
    errorElement: <RouteError />,
    hydrateFallbackElement: splash,
    children: [
      {
        index: true,
        handle: {
          path: '/admin',
          title: 'Admin dashboard',
          description: 'Users, bookings, revenue, refunds and active drivers at a glance.',
          phase: 18,
        },
        lazy: plannedPage,
      },
      { path: ':section', lazy: page(() => import('@/pages/admin/AdminSectionPage')) },
    ],
  },
];
