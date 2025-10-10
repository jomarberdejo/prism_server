import usersRoutes from './users/routes'

export const routes = [usersRoutes] as const;

export type AppRoutes = (typeof routes)[number]

