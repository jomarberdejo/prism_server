import usersRoutes from './users/routes'
import authRoutes from './auth/routes'
import ppaRoutes from './ppa/routes'
import sectorRoutes from './sector/routes'
import implementingUnitRoutes from './implementingUnit/routes'

export const routes = [usersRoutes, authRoutes, ppaRoutes, sectorRoutes, implementingUnitRoutes] as const;

export type AppRoutes = (typeof routes)[number]

