"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_config = require("dotenv/config");
var import_node_server = require("@hono/node-server");
var import_hono7 = require("hono");

// src/controllers/users/routes.ts
var import_hono = require("hono");

// src/constants/roles.ts
var VALID_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "EDITOR",
  "VIEWER"
];

// src/constants/status.ts
var VALID_STATUSES = [
  "PENDING",
  "ACTIVE",
  "REJECTED"
];

// src/config/env.ts
var import_zod = require("zod");

// src/constants/env.ts
var NODE_ENV = {
  Local: "local",
  Dev: "development",
  Prod: "production"
};

// src/config/env.ts
var envSchema = import_zod.z.object({
  DATABASE_URL: import_zod.z.string(),
  NODE_ENV: import_zod.z.nativeEnum(NODE_ENV).default(NODE_ENV.Local),
  APP_PORT: import_zod.z.coerce.number().default(3e3),
  JWT_SECRET: import_zod.z.string(),
  SERVICE_ACCOUNT_JSON: import_zod.z.string()
});
var envConfig = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  APP_PORT: process.env.APP_PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  SERVICE_ACCOUNT_JSON: process.env.SERVICE_ACCOUNT_JSON
});

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = global.prisma || new import_client.PrismaClient();
if (process.env.NODE_ENV !== envConfig.NODE_ENV) {
  global.prisma = prisma;
}
var prisma_default = prisma;

// src/data/user.ts
var import_client2 = require("@prisma/client");
var userSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
  role: true,
  createdAt: true,
  isDepartmentHead: true,
  pushToken: true,
  status: true
  // password: true,
};
var userRepository = {
  async findByEmail(email) {
    return prisma_default.user.findUnique({
      where: { email }
    });
  },
  async findByUsername(username) {
    return prisma_default.user.findUnique({
      where: { username }
    });
  },
  async findById(id) {
    return prisma_default.user.findUnique({
      where: { id },
      select: userSelect
    });
  },
  async findActiveUsersWithPushTokens() {
    return prisma_default.user.findMany({
      where: {
        status: import_client2.USER_STATUS.ACTIVE,
        pushToken: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        pushToken: true,
        role: true
      }
    });
  },
  async create(hashedPassword, name, isDepartmentHead, role, username, email) {
    return prisma_default.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isDepartmentHead,
        role,
        username
      },
      select: userSelect
    });
  },
  async findAll() {
    return prisma_default.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        ...userSelect,
        departmentHead: true,
        sessions: {
          select: {
            id: true,
            createdAt: true,
            token: true
          }
        }
      }
    });
  },
  async findByRole(role) {
    return prisma_default.user.findMany({
      where: { role },
      select: userSelect
    });
  },
  async updateProfile(id, profileData) {
    return prisma_default.user.update({
      where: { id },
      data: profileData,
      select: userSelect
    });
  },
  async updateRole(id, role) {
    return prisma_default.user.update({
      where: { id },
      data: { role },
      select: userSelect
    });
  },
  async updateStatus(id, status) {
    return prisma_default.user.update({
      where: { id },
      data: { status },
      select: userSelect
    });
  },
  async updatePassword(userId, hashedPassword) {
    return await prisma_default.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true
      }
    });
  },
  async updatePushToken(username, pushToken) {
    return prisma_default.user.update({
      where: { username },
      data: { pushToken },
      select: userSelect
    });
  },
  async delete(id) {
    return prisma_default.user.delete({
      where: { id }
    });
  },
  async updateDepartmentHeadStatus(userId, isDepartmentHead) {
    return prisma_default.user.update({
      where: { id: userId },
      data: { isDepartmentHead }
    });
  },
  async getDepartmentHeads() {
    return prisma_default.user.findMany({
      where: { isDepartmentHead: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentHead: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }
};

// src/utils/error.ts
var import_http_status_codes = require("http-status-codes");
var BadRequestError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequestError";
    this.message = message;
  }
};
var UnauthorizedError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "UnauthorizedError";
    this.message = message;
  }
};
var ForbiddenError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ForbiddenError";
    this.message = message;
  }
};
var NotFoundError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.message = message;
  }
};
var ConflictError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
    this.message = message;
  }
};
function makeError(error) {
  const defaultError = {
    name: error.name,
    message: error.message
  };
  if (error.message.includes("Malformed JSON")) {
    return {
      statusCode: import_http_status_codes.StatusCodes.BAD_REQUEST,
      error: { name: "BadRequestError", message: error.message }
    };
  }
  if (error instanceof BadRequestError) {
    return {
      statusCode: import_http_status_codes.StatusCodes.BAD_REQUEST,
      error: defaultError
    };
  }
  if (error instanceof UnauthorizedError) {
    return {
      statusCode: import_http_status_codes.StatusCodes.UNAUTHORIZED,
      error: defaultError
    };
  }
  if (error instanceof ForbiddenError) {
    return {
      statusCode: import_http_status_codes.StatusCodes.FORBIDDEN,
      error: defaultError
    };
  }
  if (error instanceof NotFoundError) {
    return {
      statusCode: import_http_status_codes.StatusCodes.NOT_FOUND,
      error: defaultError
    };
  }
  if (error instanceof ConflictError) {
    return {
      statusCode: import_http_status_codes.StatusCodes.CONFLICT,
      error: defaultError
    };
  }
  return {
    statusCode: import_http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR,
    error: defaultError
  };
}

// src/services/user.ts
var import_client4 = require("@prisma/client");

// src/services/auth.ts
var import_jwt = require("hono/jwt");
var import_bcryptjs = __toESM(require("bcryptjs"));

// src/data/session.ts
var sessionRepository = {
  async create(userId, token, expiresAt) {
    return prisma_default.session.create({
      data: { userId, token, expiresAt }
    });
  },
  async findByToken(token) {
    return prisma_default.session.findUnique({
      where: { token },
      include: { user: true }
    });
  },
  async deleteByToken(token) {
    try {
      return await prisma_default.session.delete({ where: { token } });
    } catch {
      return null;
    }
  },
  async deleteByUserId(userId) {
    return prisma_default.session.deleteMany({
      where: { userId }
    });
  }
};

// src/services/auth.ts
var import_client3 = require("@prisma/client");
var authService = {
  generateToken(payload) {
    return (0, import_jwt.sign)(payload, envConfig.JWT_SECRET, "HS256");
  },
  async verifyToken(token) {
    try {
      const payload = await (0, import_jwt.verify)(token, envConfig.JWT_SECRET, "HS256");
      return {
        userId: payload.userId,
        username: payload.username,
        role: payload.role
      };
    } catch {
      return null;
    }
  },
  async hashPassword(password) {
    return import_bcryptjs.default.hash(password, 10);
  },
  async comparePassword(password, hash) {
    return import_bcryptjs.default.compare(password, hash);
  },
  async register(password, name, username, isDepartmentHead, role, email) {
    if (email) {
      const existingUser2 = await userRepository.findByEmail(email);
      if (existingUser2) {
        throw new ConflictError("Email already in use");
      }
    }
    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      throw new ConflictError("Username already in use");
    }
    if (password.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters");
    }
    const hashedPassword = await this.hashPassword(password);
    return userRepository.create(
      hashedPassword,
      name,
      isDepartmentHead,
      role,
      username,
      email
    );
  },
  async login(username, password, pushToken) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }
    if (user.status === import_client3.USER_STATUS.PENDING) {
      throw new UnauthorizedError("Account is pending approval");
    }
    if (user.status === import_client3.USER_STATUS.REJECTED) {
      throw new UnauthorizedError("Account is rejected");
    }
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }
    if (pushToken) {
      await userRepository.updatePushToken(username, pushToken);
    }
    return user;
  },
  async createSession(userId, username, role) {
    await sessionRepository.deleteByUserId(userId);
    const token = await this.generateToken({ userId, username, role });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    await sessionRepository.create(userId, token, expiresAt);
    return token;
  },
  async destroySession(token) {
    return sessionRepository.deleteByToken(token);
  }
};

// src/services/user.ts
var userService = {
  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  },
  async getAllUsers() {
    return userRepository.findAll();
  },
  async getUsersByRole(role) {
    if (!VALID_ROLES.includes(role)) {
      throw new BadRequestError("Invalid role");
    }
    return userRepository.findByRole(role);
  },
  async updateProfile(userId, profileData) {
    return userRepository.updateProfile(userId, profileData);
  },
  async updatePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const isValidPassword = await authService.comparePassword(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      throw new BadRequestError("Current password is incorrect");
    }
    if (newPassword.length < 6) {
      throw new BadRequestError("New password must be at least 6 characters");
    }
    const isSamePassword = await authService.comparePassword(
      newPassword,
      user.password
    );
    if (isSamePassword) {
      throw new BadRequestError(
        "New password must be different from current password"
      );
    }
    const hashedPassword = await authService.hashPassword(newPassword);
    await userRepository.updatePassword(userId, hashedPassword);
  },
  async updateUserRole(userId, role) {
    if (!VALID_ROLES.includes(role)) {
      throw new BadRequestError("Invalid role");
    }
    const user = await this.getUserById(userId);
    return userRepository.updateRole(userId, role);
  },
  async updateUserStatus(userId, status) {
    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestError("Invalid status");
    }
    const user = await this.getUserById(userId);
    return userRepository.updateStatus(userId, status);
  },
  async updateDepartmentHeadStatus(userId, isDepartmentHead) {
    const user = await this.getUserById(userId);
    return userRepository.updateDepartmentHeadStatus(userId, isDepartmentHead);
  },
  async deleteUser(id) {
    await this.getUserById(id);
    return userRepository.delete(id);
  },
  async getAllDepartmentHeads() {
    const users = await userRepository.getDepartmentHeads();
    const mappedUsers = users.map((user) => ({
      label: user.name,
      value: user.id
    }));
    return mappedUsers;
  }
};

// src/controllers/users/index.ts
var import_http_status_codes2 = require("http-status-codes");
var userHandler = {
  async getAll(c) {
    const users = await userService.getAllUsers();
    return c.json(
      {
        success: true,
        data: { users }
      },
      import_http_status_codes2.StatusCodes.OK
    );
  },
  async getAllHeads(c) {
    const users = await userService.getAllDepartmentHeads();
    return c.json(
      {
        success: true,
        data: users
      },
      import_http_status_codes2.StatusCodes.OK
    );
  },
  async getById(c) {
    const id = c.req.param("id");
    const user = await userService.getUserById(id);
    return c.json(
      {
        success: true,
        data: { user }
      },
      import_http_status_codes2.StatusCodes.OK
    );
  },
  async getByRole(c) {
    const role = c.req.param("role");
    const users = await userService.getUsersByRole(role);
    return c.json(
      {
        success: true,
        data: { users }
      },
      import_http_status_codes2.StatusCodes.OK
    );
  },
  async updateProfile(c) {
    const id = c.req.param("id");
    const body = await c.req.json();
    const user = await userService.updateProfile(id, body);
    return c.json(
      {
        success: true,
        message: "Profile updated successfully",
        data: { user }
      },
      import_http_status_codes2.StatusCodes.OK
    );
  },
  async updateRole(c) {
    const id = c.req.param("id");
    const { role } = await c.req.json();
    const user = await userService.updateUserRole(id, role);
    return c.json(
      {
        success: true,
        message: "Role updated successfully",
        data: { user }
      },
      import_http_status_codes2.StatusCodes.OK
    );
  },
  async updateStatus(c) {
    const id = c.req.param("id");
    const { status } = await c.req.json();
    const user = await userService.updateUserStatus(id, status);
    return c.json(
      {
        success: true,
        message: "Status updated successfully",
        data: { user }
      },
      import_http_status_codes2.StatusCodes.OK
    );
  },
  async updateDepartmentHeadStatus(c) {
    const id = c.req.param("id");
    const { isDepartmentHead } = await c.req.json();
    const user = await userService.updateDepartmentHeadStatus(
      id,
      isDepartmentHead
    );
    return c.json(
      {
        success: true,
        message: "Department head status updated successfully",
        data: { user }
      },
      import_http_status_codes2.StatusCodes.OK
    );
  },
  async updatePassword(c) {
    const { currentPassword, newPassword } = await c.req.json();
    const user = c.get("user");
    await userService.updatePassword(user.id, currentPassword, newPassword);
    return c.json(
      {
        success: true,
        message: "Password updated successfully"
      },
      import_http_status_codes2.StatusCodes.OK
    );
  },
  async delete(c) {
    const id = c.req.param("id");
    await userService.deleteUser(id);
    return c.json(
      {
        success: true,
        message: "User deleted successfully"
      },
      import_http_status_codes2.StatusCodes.OK
    );
  }
};

// src/middlewares/auth.ts
var import_cookie = require("hono/cookie");

// src/constants/cookies.ts
var COOKIE_NAMES = {
  accessToken: "accessToken"
};
var COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax",
  maxAge: 7 * 24 * 60 * 60,
  path: "/"
};
var JWT_SECRET = envConfig.JWT_SECRET;

// src/middlewares/auth.ts
var authMiddleware = async (c, next) => {
  const token = (0, import_cookie.getCookie)(c, COOKIE_NAMES.accessToken);
  if (!token) {
    throw new UnauthorizedError("No token provided");
  }
  const session = await sessionRepository.findByToken(token);
  if (!session || /* @__PURE__ */ new Date() > session.expiresAt) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const payload = await authService.verifyToken(token);
  if (!payload) {
    throw new UnauthorizedError("Invalid token");
  }
  const user = {
    id: payload.userId,
    username: payload.username,
    role: payload.role
  };
  c.set("user", user);
  await next();
};

// src/controllers/users/routes.ts
var router = new import_hono.Hono();
router.get("/users", userHandler.getAll);
router.get("/users/heads", userHandler.getAllHeads);
router.patch("/users/change-password", authMiddleware, userHandler.updatePassword);
router.patch("/users/:id", userHandler.updateProfile);
router.patch("/users/:id/role", userHandler.updateRole);
router.patch("/users/:id/status", userHandler.updateStatus);
router.patch("/users/:id/department-head", userHandler.updateDepartmentHeadStatus);
router.delete("/users/:id", userHandler.delete);
var routes_default = router;

// src/controllers/auth/routes.ts
var import_hono2 = require("hono");

// src/controllers/auth/index.ts
var import_cookie2 = require("hono/cookie");
var import_http_status_codes3 = require("http-status-codes");
var authHandler = {
  async register(c) {
    const { email, password, name, username, isDepartmentHead, role } = await c.req.json();
    if (!password || !name || !username) {
      throw new BadRequestError("Missing required fields");
    }
    const user = await authService.register(password, name, username, isDepartmentHead, role, email);
    return c.json(
      {
        success: true,
        message: "User registered successfully",
        data: { user }
      },
      import_http_status_codes3.StatusCodes.CREATED
    );
  },
  async login(c) {
    const { username, password, pushToken } = await c.req.json();
    if (!username || !password) {
      throw new BadRequestError("Username and password required");
    }
    const user = await authService.login(username, password, pushToken);
    const token = await authService.createSession(
      user.id,
      user.username,
      user.role
    );
    (0, import_cookie2.setCookie)(c, COOKIE_NAMES.accessToken, token, COOKIE_CONFIG);
    return c.json(
      {
        success: true,
        message: "Logged in successfully",
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
            isDepartmentHead: user.isDepartmentHead
          },
          token
        }
      },
      import_http_status_codes3.StatusCodes.OK
    );
  },
  async logout(c) {
    const token = (0, import_cookie2.getCookie)(c, COOKIE_NAMES.accessToken);
    if (token) {
      await authService.destroySession(token);
    }
    (0, import_cookie2.deleteCookie)(c, COOKIE_NAMES.accessToken, COOKIE_CONFIG);
    return c.json(
      {
        success: true,
        message: "Logged out successfully"
      },
      import_http_status_codes3.StatusCodes.OK
    );
  },
  async getCurrentUser(c) {
    const user = c.get("user");
    return c.json(
      {
        success: true,
        data: { user }
      },
      import_http_status_codes3.StatusCodes.OK
    );
  }
};

// src/controllers/auth/routes.ts
var router2 = new import_hono2.Hono();
router2.post("/auth/register", authHandler.register);
router2.post("/auth/login", authHandler.login);
router2.post("/auth/logout", authHandler.logout);
var routes_default2 = router2;

// src/controllers/ppa/routes.ts
var import_hono3 = require("hono");

// src/controllers/ppa/index.ts
var import_http_status_codes4 = require("http-status-codes");

// src/data/ppa.ts
var import_client5 = require("@prisma/client");
var ppaSelect = {
  id: true,
  task: true,
  description: true,
  address: true,
  venue: true,
  expectedOutput: true,
  startDate: true,
  dueDate: true,
  sector: true,
  implementingUnit: true,
  sectorId: true,
  hourBeforeNotifiedAt: true,
  dayBeforeNotifiedAt: true,
  archivedAt: true,
  userId: true,
  status: true,
  remarks: true,
  actualOutput: true,
  delayedReason: true,
  budgetAllocation: true,
  approvedBudget: true,
  attendees: {
    select: {
      id: true,
      name: true
    }
  },
  user: {
    select: {
      pushToken: true
    }
  }
};
var ppaRepository = {
  async findById(id) {
    return prisma_default.pPA.findUnique({
      where: { id },
      select: ppaSelect
    });
  },
  async findAll() {
    return prisma_default.pPA.findMany({
      select: ppaSelect,
      orderBy: { startDate: "asc" },
      where: {
        archivedAt: null
      }
    });
  },
  async findAllArchived() {
    return prisma_default.pPA.findMany({
      select: ppaSelect,
      orderBy: { startDate: "asc" },
      where: {
        archivedAt: {
          not: null
        }
      }
    });
  },
  async findAllWithoutDayBeforeNotification() {
    const tomorrow = /* @__PURE__ */ new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
    return prisma_default.pPA.findMany({
      where: {
        dayBeforeNotifiedAt: null,
        archivedAt: null,
        startDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow
        }
      },
      select: ppaSelect,
      orderBy: { startDate: "asc" }
    });
  },
  async findTodayPPAsWithoutHourNotification() {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return prisma_default.pPA.findMany({
      where: {
        hourBeforeNotifiedAt: null,
        archivedAt: null,
        startDate: {
          gte: today,
          lt: tomorrow
        }
      },
      select: ppaSelect,
      orderBy: { startDate: "asc" }
    });
  },
  async findBySector(sectorId) {
    return prisma_default.pPA.findMany({
      where: { sectorId },
      select: ppaSelect
    });
  },
  async findByImplementingUnit(implementingUnitId) {
    return prisma_default.pPA.findMany({
      where: { implementingUnitId },
      select: ppaSelect
    });
  },
  async create(data) {
    const ppa = await prisma_default.pPA.create({
      data: {
        task: data.task,
        description: data.description,
        address: data.address,
        venue: data.venue,
        expectedOutput: data.expectedOutput,
        startDate: data.startDate,
        dueDate: data.dueDate,
        sectorId: data.sectorId,
        budgetAllocation: data.budgetAllocation,
        approvedBudget: data.approvedBudget,
        implementingUnitId: data.implementingUnitId,
        userId: data.userId,
        attendees: data.attendees && data.attendees.length > 0 ? {
          connect: data.attendees.map((id) => ({ id }))
        } : void 0
      },
      include: {
        attendees: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        sector: true,
        implementingUnit: true
      }
    });
    return ppa;
  },
  async update(ppaId, data, userId) {
    const ppa = await prisma_default.pPA.findFirst({
      where: {
        id: ppaId,
        userId
      },
      select: {
        id: true
      }
    });
    if (!ppa) {
      throw new ForbiddenError(
        "You are not authorized to perform this action."
      );
    }
    return prisma_default.pPA.update({
      where: {
        id: ppaId
      },
      data,
      select: ppaSelect
    });
  },
  async delete(userId, ppaId) {
    const ppa = await prisma_default.pPA.findFirst({
      where: {
        id: ppaId,
        userId
      },
      select: { id: true }
    });
    if (!ppa) {
      throw new ForbiddenError(
        "You are not authorized to perform this action."
      );
    }
    return prisma_default.pPA.update({
      where: { id: ppaId },
      data: { archivedAt: /* @__PURE__ */ new Date() },
      select: ppaSelect
    });
  },
  async findOverlappingPPAs(startDate, dueDate, excludePPAId, venue) {
    const start = new Date(startDate);
    const end = new Date(dueDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const whereClause = {
      AND: [
        { startDate: { lte: end } },
        { dueDate: { gte: start } },
        { dueDate: { gt: today } },
        {
          venue
        }
      ]
    };
    if (excludePPAId) {
      whereClause.id = { not: excludePPAId };
    }
    return prisma_default.pPA.findMany({
      where: whereClause,
      include: {
        sector: { select: { id: true, name: true } },
        implementingUnit: { select: { id: true, name: true } }
      },
      orderBy: { startDate: "asc" }
    });
  }
};

// src/services/notificationService.ts
var import_firebase_admin = __toESM(require("firebase-admin"));
var import_node_cron = __toESM(require("node-cron"));

// src/utils/dates.ts
var import_moment_timezone = __toESM(require("moment-timezone"));
var DEFAULT_TIMEZONE = "Asia/Manila";
var DateTimeUtil = class {
  timezone;
  constructor(timezone = DEFAULT_TIMEZONE) {
    this.timezone = timezone;
  }
  /**
   * Parse a date stored in local Manila time
   */
  parse(date) {
    return import_moment_timezone.default.tz(date, this.timezone);
  }
  /**
   * Format date as "Month Day, Year" (e.g., "December 26, 2025")
   */
  formatDate(date) {
    return this.parse(date).format("MMMM D, YYYY");
  }
  formatTime(date) {
    return this.parse(date).format("h:mm A");
  }
  /**
   * Format date with time as "Month Day, Year at HH:MM AM/PM"
   */
  formatDateTime(date) {
    return this.parse(date).format("MMMM D, YYYY [at] h:mm A");
  }
  /**
   * Format date as short format "MMM D, YYYY" (e.g., "Dec 26, 2025")
   */
  formatDateShort(date) {
    return this.parse(date).format("MMM D, YYYY");
  }
  /**
   * Get relative time (e.g., "2 days ago", "in 3 hours")
   */
  fromNow(date) {
    return this.parse(date).fromNow();
  }
  /**
   * Get current date/time in Manila timezone
   */
  now() {
    return import_moment_timezone.default.tz(this.timezone);
  }
  /**
   * Custom format with any moment format string
   */
  format(date, formatString) {
    return this.parse(date).format(formatString);
  }
};
var dateTime = new DateTimeUtil();

// src/services/notificationService.ts
var serviceAccount = JSON.parse(
  Buffer.from(envConfig.SERVICE_ACCOUNT_JSON, "base64").toString()
);
if (!import_firebase_admin.default.apps.length) {
  try {
    import_firebase_admin.default.initializeApp({
      credential: import_firebase_admin.default.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error(error);
  }
}
var sentReminders = /* @__PURE__ */ new Set();
function detectPlatform(pushToken) {
  if (!pushToken) return null;
  if (/^[0-9a-f]{64}$/i.test(pushToken)) return "apns";
  return "fcm";
}
async function sendFCMNotification({
  fcmToken,
  title,
  body,
  data = {}
}) {
  const message = {
    token: fcmToken,
    notification: { title, body },
    data,
    android: {
      priority: "high",
      notification: {
        channelId: "default",
        sound: "default",
        priority: "high"
      }
    }
  };
  try {
    await import_firebase_admin.default.messaging().send(message);
    return true;
  } catch {
    return false;
  }
}
async function sendAPNsNotification({
  apnsToken,
  title,
  body,
  data = {}
}) {
  const message = {
    token: apnsToken,
    notification: { title, body },
    data,
    apns: {
      payload: {
        aps: { alert: { title, body }, sound: "default", badge: 1 }
      }
    }
  };
  try {
    await import_firebase_admin.default.messaging().send(message);
    return true;
  } catch {
    return false;
  }
}
async function sendPushNotification({
  ppaId,
  pushToken,
  title,
  body,
  notificationType
}) {
  if (!pushToken) return false;
  const platform = detectPlatform(pushToken);
  if (!platform) return false;
  const data = { ppaId };
  if (notificationType) data.notificationType = notificationType;
  let success = false;
  try {
    if (platform === "fcm") {
      success = await sendFCMNotification({
        fcmToken: pushToken,
        title,
        body,
        data
      });
    } else {
      success = await sendAPNsNotification({
        apnsToken: pushToken,
        title,
        body,
        data
      });
    }
    return success;
  } catch {
    return false;
  }
}
async function checkDayBeforeReminders() {
  const activeUsers = await userRepository.findActiveUsersWithPushTokens();
  if (!activeUsers || activeUsers.length === 0) return;
  const ppas = await ppaRepository.findAllWithoutDayBeforeNotification();
  if (!ppas || ppas.length === 0) return;
  const now = dateTime.now();
  for (const ppa of ppas) {
    if (!ppa.startDate) continue;
    const startDateTime = dateTime.parse(ppa.startDate);
    const tomorrow = now.clone().add(1, "day");
    const isTomorrow = startDateTime.isSame(tomorrow, "day");
    if (!isTomorrow) continue;
    let successCount = 0;
    for (const user of activeUsers) {
      if (!user.pushToken) continue;
      const reminderKey = `${ppa.id}-${user.id}-day-before`;
      if (sentReminders.has(reminderKey)) continue;
      const success = await sendPushNotification({
        ppaId: ppa.id,
        pushToken: user.pushToken,
        title: `\u{1F4C5} Reminder: ${ppa.task} starts tomorrow!`,
        body: `It begins at ${dateTime.formatTime(ppa.startDate)} and ends on ${dateTime.formatDateShort(ppa.dueDate)} at ${dateTime.formatTime(ppa.dueDate)}. Don't forget to prepare!`,
        notificationType: "day_before"
      });
      if (success) sentReminders.add(reminderKey);
      successCount++;
      await new Promise((r) => setTimeout(r, 100));
    }
    if (successCount > 0)
      await ppaRepository.update(ppa.id, { dayBeforeNotifiedAt: /* @__PURE__ */ new Date() });
  }
}
async function checkHourBeforeReminders() {
  const activeUsers = await userRepository.findActiveUsersWithPushTokens();
  if (!activeUsers || activeUsers.length === 0) return;
  const ppas = await ppaRepository.findTodayPPAsWithoutHourNotification();
  if (!ppas || ppas.length === 0) return;
  const now = dateTime.now();
  for (const ppa of ppas) {
    if (!ppa.startDate) continue;
    const startDateTime = dateTime.parse(ppa.startDate);
    const isToday = startDateTime.isSame(now, "day");
    if (!isToday) continue;
    const minutesUntilStart = startDateTime.diff(now, "minutes");
    if (minutesUntilStart < 110 || minutesUntilStart > 130) continue;
    let successCount = 0;
    for (const user of activeUsers) {
      if (!user.pushToken) continue;
      const reminderKey = `${ppa.id}-${user.id}-hour-before`;
      if (sentReminders.has(reminderKey)) continue;
      const success = await sendPushNotification({
        ppaId: ppa.id,
        pushToken: user.pushToken,
        title: `\u23F0 Starting Soon: ${ppa.task}`,
        body: `Your event starts in about 2 hours at ${dateTime.formatTime(ppa.startDate)}. Location: ${ppa.venue || ppa.address}`,
        notificationType: "hour_before"
      });
      if (success) sentReminders.add(reminderKey);
      successCount++;
      await new Promise((r) => setTimeout(r, 100));
    }
    if (successCount > 0)
      await ppaRepository.update(ppa.id, { hourBeforeNotifiedAt: /* @__PURE__ */ new Date() });
  }
}
async function remindReschedulePPA({
  ppaId,
  pushToken,
  title,
  body
}) {
  if (!pushToken) return false;
  const platform = detectPlatform(pushToken);
  if (!platform) return false;
  const data = { ppaId };
  let success = false;
  try {
    if (platform === "fcm") {
      success = await sendFCMNotification({
        fcmToken: pushToken,
        title,
        body,
        data
      });
    } else {
      success = await sendAPNsNotification({
        apnsToken: pushToken,
        title,
        body,
        data
      });
    }
    return success;
  } catch {
    return false;
  }
}
function startCronScheduler() {
  import_node_cron.default.schedule(
    "* * * * *",
    async () => {
      await checkHourBeforeReminders();
    },
    {
      timezone: "Asia/Manila"
    }
  );
  import_node_cron.default.schedule(
    "55 15 * * *",
    async () => {
      await checkDayBeforeReminders();
    },
    {
      timezone: "Asia/Manila"
    }
  );
}

// src/services/venue.ts
var venueService = {
  async checkLocationAvailability(startDate, dueDate, excludePPAId, venue) {
    const ppas = await ppaRepository.findOverlappingPPAs(
      startDate,
      dueDate,
      excludePPAId,
      venue
    );
    const conflictingPPAs = ppas.map((ppa) => ({
      id: ppa.id,
      task: ppa.task,
      description: ppa.description,
      startDate: ppa.startDate,
      dueDate: ppa.dueDate,
      venue: ppa.venue,
      sector: ppa.sector,
      implementingUnit: ppa.implementingUnit
    }));
    console.log("Conflicting PPAs:", conflictingPPAs);
    return {
      available: conflictingPPAs.length === 0,
      conflictingPPAs
    };
  }
};

// src/services/ppa.ts
var ppaService = {
  async getPPAById(id) {
    const ppa = await ppaRepository.findById(id);
    if (!ppa) throw new NotFoundError("PPA not found");
    return ppa;
  },
  async getAllPPAs() {
    const ppas = await ppaRepository.findAll();
    const mappedPPA = ppas.map((ppa) => ({
      ...ppa,
      attendees: ppa.attendees.map((attendee) => ({
        label: attendee.name,
        value: attendee.id
      }))
    }));
    return mappedPPA;
  },
  async getAllArchived() {
    return ppaRepository.findAllArchived();
  },
  async getPPAsBySector(sectorId) {
    return ppaRepository.findBySector(sectorId);
  },
  async getPPAsByImplementingUnit(implementingUnitId) {
    return ppaRepository.findByImplementingUnit(implementingUnitId);
  },
  async createPPA(data) {
    if (!data.task || !data.sectorId || !data.implementingUnitId) {
      throw new BadRequestError("Missing required fields");
    }
    const availability = await venueService.checkLocationAvailability(
      data.startDate,
      data.dueDate,
      void 0,
      data.venue
    );
    if (!availability.available) {
      throw new ForbiddenError(
        `Venue is not available: ${data.venue} is already occupied for the selected dates.`
      );
    }
    return ppaRepository.create(data);
  },
  async updatePPA(ppaId, data, userId) {
    const existing = await this.getPPAById(ppaId);
    const availability = await venueService.checkLocationAvailability(
      data.startDate,
      data.dueDate,
      ppaId,
      data.venue
    );
    if (!availability.available) {
      throw new ForbiddenError(
        `Venue is not available: ${data.venue} is already occupied for the selected dates.`
      );
    }
    const updatedPPA = await ppaRepository.update(ppaId, data, userId);
    const existingStartDate = dateTime.parse(existing.startDate);
    const newStartDate = data.startDate ? dateTime.parse(data.startDate) : null;
    const existingDueDate = dateTime.parse(existing.dueDate);
    const newDueDate = data.dueDate ? dateTime.parse(data.dueDate) : null;
    const startDateChanged = newStartDate && !existingStartDate.isSame(newStartDate);
    const dueDateChanged = newDueDate && !existingDueDate.isSame(newDueDate);
    if (startDateChanged || dueDateChanged) {
      let scheduleMessage = "The PPA has been rescheduled.";
      if (startDateChanged && dueDateChanged) {
        scheduleMessage = `New schedule: ${dateTime.formatDateTime(data.startDate)} to ${dateTime.formatDateTime(data.dueDate)}`;
      } else if (startDateChanged) {
        scheduleMessage = `New start time: ${dateTime.formatDateTime(data.startDate)}`;
      } else if (dueDateChanged) {
        scheduleMessage = `New end time: ${dateTime.formatDateTime(data.dueDate)}`;
      }
      const title = "\u{1F4C5} PPA Rescheduled";
      const body = `Reminder: "${updatedPPA.task}" has been rescheduled. ${scheduleMessage}`;
      await remindReschedulePPA({
        ppaId,
        pushToken: updatedPPA?.user?.pushToken,
        title,
        body
      });
      console.log(`\u2705 Reschedule notification sent for PPA: ${updatedPPA.task}`);
    }
    return updatedPPA;
  },
  async deletePPA(userId, ppaId) {
    await this.getPPAById(ppaId);
    return ppaRepository.delete(userId, ppaId);
  }
};

// src/controllers/ppa/index.ts
var ppaHandler = {
  async getAll(c) {
    const ppas = await ppaService.getAllPPAs();
    return c.json(
      {
        success: true,
        data: { ppas }
      },
      import_http_status_codes4.StatusCodes.OK
    );
  },
  async getAllArchivedPPA(c) {
    const ppas = await ppaService.getAllArchived();
    return c.json(
      {
        success: true,
        data: { ppas }
      },
      import_http_status_codes4.StatusCodes.OK
    );
  },
  async getById(c) {
    const id = c.req.param("id");
    if (!id) throw new BadRequestError("Missing PPA ID");
    const ppa = await ppaService.getPPAById(id);
    return c.json(
      {
        success: true,
        data: { ppa }
      },
      import_http_status_codes4.StatusCodes.OK
    );
  },
  async getBySector(c) {
    const sectorId = c.req.param("sectorId");
    if (!sectorId) throw new BadRequestError("Missing Sector ID");
    const ppas = await ppaService.getPPAsBySector(sectorId);
    return c.json(
      {
        success: true,
        data: { ppas }
      },
      import_http_status_codes4.StatusCodes.OK
    );
  },
  async getByImplementingUnit(c) {
    const implementingUnitId = c.req.param("implementingUnitId");
    if (!implementingUnitId)
      throw new BadRequestError("Missing Implementing Unit ID");
    const ppas = await ppaService.getPPAsByImplementingUnit(implementingUnitId);
    return c.json(
      {
        success: true,
        data: { ppas }
      },
      import_http_status_codes4.StatusCodes.OK
    );
  },
  async checkAvailability(c) {
    const body = await c.req.json();
    if (!body.startDate || !body.dueDate) {
      throw new BadRequestError("Start date and due date are required");
    }
    const { startDate, dueDate, excludePPAId } = body;
    const result = await venueService.checkLocationAvailability(
      new Date(startDate),
      new Date(dueDate),
      excludePPAId,
      body.venue
    );
    return c.json(
      {
        success: true,
        data: {
          available: result.available,
          conflictingPPAs: result.conflictingPPAs,
          message: result.conflictingPPAs.length === 0 ? "No PPAs scheduled in this date range" : `${result.conflictingPPAs.length} PPA(s) scheduled in this date range`
        }
      },
      import_http_status_codes4.StatusCodes.OK
    );
  },
  async create(c) {
    const user = c.get("user");
    const body = await c.req.json();
    const requiredFields = [
      "task",
      "description",
      "address",
      "startDate",
      "dueDate",
      "sectorId",
      "implementingUnitId"
    ];
    for (const field of requiredFields) {
      if (!body[field]) throw new BadRequestError(`Missing field: ${field}`);
    }
    const newPPA = await ppaService.createPPA({
      task: body.task,
      description: body.description,
      address: body.address,
      venue: body.venue,
      expectedOutput: body.expectedOutput,
      startDate: new Date(body.startDate),
      dueDate: new Date(body.dueDate),
      sectorId: body.sectorId,
      budgetAllocation: body.budgetAllocation,
      approvedBudget: body.approvedBudget,
      implementingUnitId: body.implementingUnitId,
      userId: user.id,
      attendees: body.attendees
    });
    return c.json(
      {
        success: true,
        message: "PPA created successfully",
        data: { ppa: newPPA }
      },
      import_http_status_codes4.StatusCodes.CREATED
    );
  },
  async update(c) {
    const user = c.get("user");
    const id = c.req.param("id");
    const body = await c.req.json();
    if (!id) throw new BadRequestError("Missing PPA ID");
    const updateData = {
      task: body.task,
      description: body.description,
      address: body.address,
      venue: body.venue,
      expectedOutput: body.expectedOutput,
      sectorId: body.sectorId,
      budgetAllocation: body.budgetAllocation,
      approvedBudget: body.approvedBudget,
      implementingUnitId: body.implementingUnitId,
      status: body.status,
      remarks: body.remarks,
      actualOutput: body.actualOutput,
      delayedReason: body.delayedReason
    };
    if (body.startDate) {
      if (body.startTime) {
        const startDateTime = new Date(body.startDate);
        const startTime = new Date(body.startTime);
        startDateTime.setHours(startTime.getHours());
        startDateTime.setMinutes(startTime.getMinutes());
        startDateTime.setSeconds(0);
        startDateTime.setMilliseconds(0);
        updateData.startDate = startDateTime;
      } else {
        updateData.startDate = new Date(body.startDate);
      }
    }
    if (body.dueDate) {
      if (body.dueTime) {
        const dueDateTime = new Date(body.dueDate);
        const dueTime = new Date(body.dueTime);
        dueDateTime.setHours(dueTime.getHours());
        dueDateTime.setMinutes(dueTime.getMinutes());
        dueDateTime.setSeconds(0);
        dueDateTime.setMilliseconds(0);
        updateData.dueDate = dueDateTime;
      } else {
        updateData.dueDate = new Date(body.dueDate);
      }
    }
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === void 0) {
        delete updateData[key];
      }
    });
    const updated = await ppaService.updatePPA(id, updateData, user.id);
    return c.json(
      {
        success: true,
        message: "PPA updated successfully",
        data: updated
      },
      import_http_status_codes4.StatusCodes.OK
    );
  },
  async delete(c) {
    const user = c.get("user");
    const id = c.req.param("id");
    if (!id) throw new BadRequestError("Missing PPA ID");
    await ppaService.deletePPA(user.id, id);
    return c.json(
      {
        success: true,
        message: "PPA deleted successfully"
      },
      import_http_status_codes4.StatusCodes.OK
    );
  }
};

// src/controllers/ppa/routes.ts
var router3 = new import_hono3.Hono();
router3.post("/ppas", authMiddleware, ppaHandler.create);
router3.post("/ppas/check-availability", ppaHandler.checkAvailability);
router3.get("/ppas", ppaHandler.getAll);
router3.get("/ppas/archived", ppaHandler.getAllArchivedPPA);
router3.get("/ppas/:id", authMiddleware, ppaHandler.getById);
router3.patch("/ppas/:id", authMiddleware, ppaHandler.update);
router3.delete("/ppas/:id", authMiddleware, ppaHandler.delete);
var routes_default3 = router3;

// src/controllers/sector/routes.ts
var import_hono4 = require("hono");

// src/controllers/sector/index.ts
var import_http_status_codes5 = require("http-status-codes");

// src/data/implementingUnit.ts
var implementingUnitSelect = {
  id: true,
  name: true,
  userId: true,
  deptHead: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  _count: {
    select: {
      PPA: true
    }
  },
  PPA: {
    select: {
      id: true,
      task: true,
      description: true,
      address: true,
      startDate: true,
      dueDate: true
    }
  }
};
var implementingUnitRepository = {
  async findAll() {
    return prisma_default.implementingUnit.findMany({
      select: implementingUnitSelect,
      orderBy: { name: "asc" }
    });
  },
  async findById(id) {
    return prisma_default.implementingUnit.findUnique({
      where: { id },
      select: implementingUnitSelect
    });
  },
  async findByUserId(userId) {
    return prisma_default.implementingUnit.findUnique({
      where: { userId },
      select: implementingUnitSelect
    });
  },
  async findByName(name) {
    return prisma_default.implementingUnit.findFirst({
      where: { name }
    });
  },
  async create(name, userId) {
    return prisma_default.implementingUnit.create({
      data: { name, userId },
      select: implementingUnitSelect
    });
  },
  async update(id, name, userId) {
    return prisma_default.implementingUnit.update({
      where: { id },
      data: { name, userId },
      select: implementingUnitSelect
    });
  },
  async delete(id) {
    return prisma_default.implementingUnit.delete({
      where: { id }
    });
  },
  async updateDepartmentHead(id, userId) {
    return prisma_default.implementingUnit.update({
      where: { id },
      data: { userId },
      select: implementingUnitSelect
    });
  }
};

// src/data/sector.ts
var sectorSelect = {
  id: true,
  name: true,
  description: true,
  _count: {
    select: {
      PPA: true
    }
  }
};
var sectorRepository = {
  async findAll() {
    return prisma_default.sector.findMany({
      select: sectorSelect,
      orderBy: { name: "asc" }
    });
  },
  async findById(id) {
    return prisma_default.sector.findUnique({
      where: { id },
      select: {
        ...sectorSelect,
        PPA: {
          select: {
            id: true,
            task: true,
            description: true,
            startDate: true,
            dueDate: true
          }
        }
      }
    });
  },
  async findByName(name) {
    return prisma_default.sector.findFirst({
      where: { name }
    });
  },
  async create(name, description) {
    return prisma_default.sector.create({
      data: { name, description },
      select: sectorSelect
    });
  },
  async update(id, name, description) {
    return prisma_default.sector.update({
      where: { id },
      data: { name, description },
      select: sectorSelect
    });
  },
  async delete(id) {
    return prisma_default.sector.delete({
      where: { id }
    });
  },
  async getSectorWithStats(id) {
    return prisma_default.sector.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            PPA: true
          }
        }
      }
    });
  }
};

// src/services/sector.ts
var sectorService = {
  async getAllSectors() {
    return sectorRepository.findAll();
  },
  async getSectorById(id) {
    const sector = await sectorRepository.findById(id);
    if (!sector) {
      throw new NotFoundError("Sector not found");
    }
    return sector;
  },
  async createSector(name, description) {
    const existingSector = await sectorRepository.findByName(name);
    if (existingSector) {
      throw new ConflictError("Sector with this name already exists");
    }
    return sectorRepository.create(name, description);
  },
  async updateSector(id, name, description) {
    const sector = await sectorRepository.findById(id);
    if (!sector) {
      throw new NotFoundError("Sector not found");
    }
    const existingSector = await sectorRepository.findByName(name);
    if (existingSector && existingSector.id !== id) {
      throw new ConflictError("Sector with this name already exists");
    }
    return sectorRepository.update(id, name, description);
  },
  async deleteSector(id) {
    const sector = await sectorRepository.findById(id);
    if (!sector) {
      throw new NotFoundError("Sector not found");
    }
    return sectorRepository.delete(id);
  },
  async getSectorStats(id) {
    const sector = await sectorRepository.getSectorWithStats(id);
    if (!sector) {
      throw new NotFoundError("Sector not found");
    }
    return sector;
  }
};

// src/controllers/sector/index.ts
var sectorHandler = {
  async getAll(c) {
    const sectors = await sectorService.getAllSectors();
    return c.json(
      {
        success: true,
        data: { sectors }
      },
      import_http_status_codes5.StatusCodes.OK
    );
  },
  async getById(c) {
    const id = c.req.param("id");
    const sector = await sectorService.getSectorById(id);
    return c.json(
      {
        success: true,
        data: { sector }
      },
      import_http_status_codes5.StatusCodes.OK
    );
  },
  async create(c) {
    const { name, description } = await c.req.json();
    const sector = await sectorService.createSector(name, description);
    return c.json(
      {
        success: true,
        message: "Sector created successfully",
        data: { sector }
      },
      import_http_status_codes5.StatusCodes.CREATED
    );
  },
  async update(c) {
    const id = c.req.param("id");
    const { name, description } = await c.req.json();
    const sector = await sectorService.updateSector(id, name, description);
    return c.json(
      {
        success: true,
        message: "Sector updated successfully",
        data: { sector }
      },
      import_http_status_codes5.StatusCodes.OK
    );
  },
  async delete(c) {
    const id = c.req.param("id");
    await sectorService.deleteSector(id);
    return c.json(
      {
        success: true,
        message: "Sector deleted successfully"
      },
      import_http_status_codes5.StatusCodes.OK
    );
  },
  async getStats(c) {
    const id = c.req.param("id");
    const stats = await sectorService.getSectorStats(id);
    return c.json(
      {
        success: true,
        data: { stats }
      },
      import_http_status_codes5.StatusCodes.OK
    );
  }
};

// src/controllers/sector/routes.ts
var router4 = new import_hono4.Hono();
router4.get("/sectors", authMiddleware, sectorHandler.getAll);
router4.post("/sectors", authMiddleware, sectorHandler.create);
router4.patch("/sectors/:id", authMiddleware, sectorHandler.update);
router4.delete("/sectors/:id", authMiddleware, sectorHandler.delete);
var routes_default4 = router4;

// src/controllers/implementingUnit/routes.ts
var import_hono5 = require("hono");

// src/controllers/implementingUnit/index.ts
var import_http_status_codes6 = require("http-status-codes");

// src/services/implementingUnit.ts
var implementingUnitService = {
  async getAllImplementingUnits() {
    return implementingUnitRepository.findAll();
  },
  async getImplementingUnitById(id) {
    const unit = await implementingUnitRepository.findById(id);
    if (!unit) {
      throw new NotFoundError("Implementing unit not found");
    }
    return unit;
  },
  async getImplementingUnitByUserId(userId) {
    const unit = await implementingUnitRepository.findByUserId(userId);
    if (!unit) {
      throw new NotFoundError("No implementing unit assigned to this user");
    }
    return unit;
  },
  async createImplementingUnit(name, userId) {
    if (!name || !userId) {
      throw new BadRequestError("Name, userId are required");
    }
    const existingUnit = await implementingUnitRepository.findByName(name);
    if (existingUnit) {
      throw new ConflictError(
        "Implementing unit with this name already exists"
      );
    }
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const existingDeptHead = await implementingUnitRepository.findByUserId(userId);
    if (existingDeptHead) {
      throw new ConflictError("User is already assigned as a department head");
    }
    await userRepository.updateDepartmentHeadStatus(userId, true);
    return implementingUnitRepository.create(name, userId);
  },
  async updateImplementingUnit(id, name, userId) {
    if (!name || !userId) {
      throw new BadRequestError("Name, userId are required");
    }
    const unit = await implementingUnitRepository.findById(id);
    if (!unit) {
      throw new NotFoundError("Implementing unit not found");
    }
    const existingUnit = await implementingUnitRepository.findByName(name);
    if (existingUnit && existingUnit.id !== id) {
      throw new ConflictError(
        "Implementing unit with this name already exists"
      );
    }
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    if (unit.userId !== userId) {
      const existingDeptHead = await implementingUnitRepository.findByUserId(userId);
      if (existingDeptHead && existingDeptHead.id !== id) {
        throw new ConflictError(
          "User is already assigned as a department head"
        );
      }
      await userRepository.updateDepartmentHeadStatus(unit.userId, false);
      await userRepository.updateDepartmentHeadStatus(userId, true);
    }
    return implementingUnitRepository.update(id, name, userId);
  },
  async deleteImplementingUnit(id) {
    const unit = await implementingUnitRepository.findById(id);
    if (!unit) {
      throw new NotFoundError("Implementing unit not found");
    }
    if (unit._count.PPA > 0) {
      throw new BadRequestError(
        "Cannot delete implementing unit with existing PPAs"
      );
    }
    await userRepository.updateDepartmentHeadStatus(unit.userId, false);
    return implementingUnitRepository.delete(id);
  },
  async changeDepartmentHead(id, newUserId) {
    const unit = await implementingUnitRepository.findById(id);
    if (!unit) {
      throw new NotFoundError("Implementing unit not found");
    }
    const newUser = await userRepository.findById(newUserId);
    if (!newUser) {
      throw new NotFoundError("User not found");
    }
    const existingDeptHead = await implementingUnitRepository.findByUserId(newUserId);
    if (existingDeptHead && existingDeptHead.id !== id) {
      throw new ConflictError("User is already assigned as a department head");
    }
    await userRepository.updateDepartmentHeadStatus(unit.userId, false);
    await userRepository.updateDepartmentHeadStatus(newUserId, true);
    return implementingUnitRepository.updateDepartmentHead(id, newUserId);
  }
};

// src/controllers/implementingUnit/index.ts
var implementingUnitHandler = {
  async getAll(c) {
    const units = await implementingUnitService.getAllImplementingUnits();
    return c.json(
      {
        success: true,
        data: { implementingUnits: units }
      },
      import_http_status_codes6.StatusCodes.OK
    );
  },
  async getById(c) {
    const id = c.req.param("id");
    const unit = await implementingUnitService.getImplementingUnitById(id);
    return c.json(
      {
        success: true,
        data: { implementingUnit: unit }
      },
      import_http_status_codes6.StatusCodes.OK
    );
  },
  async getByUserId(c) {
    const userId = c.req.param("userId");
    const unit = await implementingUnitService.getImplementingUnitByUserId(userId);
    return c.json(
      {
        success: true,
        data: { implementingUnit: unit }
      },
      import_http_status_codes6.StatusCodes.OK
    );
  },
  async create(c) {
    const { name, userId } = await c.req.json();
    if (!name || !userId) {
      throw new BadRequestError("Name, userId are required");
    }
    const unit = await implementingUnitService.createImplementingUnit(
      name,
      userId
    );
    return c.json(
      {
        success: true,
        message: "Implementing unit created successfully",
        data: { implementingUnit: unit }
      },
      import_http_status_codes6.StatusCodes.CREATED
    );
  },
  async update(c) {
    const id = c.req.param("id");
    const { name, userId } = await c.req.json();
    if (!name || !userId) {
      throw new BadRequestError("Name, userId are required");
    }
    const unit = await implementingUnitService.updateImplementingUnit(
      id,
      name,
      userId
    );
    return c.json(
      {
        success: true,
        message: "Implementing unit updated successfully",
        data: { implementingUnit: unit }
      },
      import_http_status_codes6.StatusCodes.OK
    );
  },
  async delete(c) {
    const id = c.req.param("id");
    await implementingUnitService.deleteImplementingUnit(id);
    return c.json(
      {
        success: true,
        message: "Implementing unit deleted successfully"
      },
      import_http_status_codes6.StatusCodes.OK
    );
  },
  async changeDepartmentHead(c) {
    const id = c.req.param("id");
    const { userId } = await c.req.json();
    if (!userId) {
      throw new BadRequestError("userId is required");
    }
    const unit = await implementingUnitService.changeDepartmentHead(id, userId);
    return c.json(
      {
        success: true,
        message: "Department head changed successfully",
        data: { implementingUnit: unit }
      },
      import_http_status_codes6.StatusCodes.OK
    );
  }
};

// src/controllers/implementingUnit/routes.ts
var router5 = new import_hono5.Hono();
router5.post(
  "/implementing-units",
  authMiddleware,
  implementingUnitHandler.create
);
router5.get(
  "/implementing-units",
  authMiddleware,
  implementingUnitHandler.getAll
);
router5.delete(
  "/implementing-units/:id",
  authMiddleware,
  implementingUnitHandler.delete
);
router5.patch(
  "/implementing-units/:id",
  authMiddleware,
  implementingUnitHandler.update
);
var routes_default5 = router5;

// src/controllers/routes.ts
var routes = [
  routes_default,
  routes_default2,
  routes_default3,
  routes_default4,
  routes_default5
];

// src/middlewares/error-handler.ts
var import_hono6 = require("hono");
async function errorHandlerMiddleware(err, c) {
  const { error, statusCode } = makeError(err);
  console.error(statusCode, error);
  return c.json(error, {
    status: statusCode
  });
}

// src/index.ts
var import_logger = require("hono/logger");
var import_cors = require("hono/cors");
var app = new import_hono7.Hono();
app.onError(errorHandlerMiddleware);
app.use((0, import_logger.logger)());
app.use((0, import_cors.cors)());
routes.forEach((route) => {
  app.route("/api", route);
});
(0, import_node_server.serve)(
  {
    fetch: app.fetch,
    port: envConfig.APP_PORT,
    hostname: "0.0.0.0"
  },
  (info) => {
    console.log(`\u2705 Server is running on http://localhost:${info.port}`);
    startCronScheduler();
  }
);
//# sourceMappingURL=index.js.map