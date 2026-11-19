import { createRouter, createRootRoute, createRoute, RouterProvider, Navigate } from '@tanstack/react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import PastQuestions from './pages/PastQuestions';
import LecturerDashboard from './pages/LecturerDashboard';
import CourseGuide from './pages/CourseGuide';
import { useAuthStore } from './store/authStore';

const rootRoute = createRootRoute();

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: AppLayout,
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      throw new Error('Unauthorized');
    }
  },
  errorComponent: () => <Navigate to="/login" />,
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/',
  component: Dashboard,
});

const pastQuestionsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/past-questions',
  component: PastQuestions,
});

const courseGuideRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/courses',
  component: CourseGuide,
});

const lecturerRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/lecturer',
  component: LecturerDashboard,
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user?.role !== 'lecturer' && user?.role !== 'admin') {
      throw new Error('Forbidden');
    }
  },
  errorComponent: () => <Navigate to="/" />,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    pastQuestionsRoute,
    courseGuideRoute,
    lecturerRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}