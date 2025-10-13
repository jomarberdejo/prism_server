import usersRoutes from './users/routes'
import authRoutes from './auth/routes'

export const routes = [usersRoutes, authRoutes] as const;

export type AppRoutes = (typeof routes)[number]

