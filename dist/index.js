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

// src/constants/env.ts
var NODE_ENV = {
  Local: "local",
  Dev: "development",
  Prod: "production"
};

// src/env.ts
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.nativeEnum(NODE_ENV).default(NODE_ENV.Local),
  APP_PORT: import_zod.z.coerce.number().default(3e3),
  DATABASE_URL: import_zod.z.string().optional(),
  JWT_SECRET: import_zod.z.string().optional()
});
var envConfig = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  APP_PORT: process.env.APP_PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET
});

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = global.prisma || new import_client.PrismaClient();
if (process.env.NODE_ENV !== envConfig.NODE_ENV) {
  global.prisma = prisma;
}
var prisma_default = prisma;

// src/data/user.ts
var userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  isDepartmentHead: true,
  pushToken: true
};
var userRepository = {
  async findByEmail(email) {
    return prisma_default.user.findUnique({
      where: { email }
    });
  },
  async findById(id) {
    return prisma_default.user.findUnique({
      where: { id },
      select: userSelect
    });
  },
  async create(email, hashedPassword, name, isDepartmentHead, role) {
    return prisma_default.user.create({
      data: { email, password: hashedPassword, name, isDepartmentHead, role },
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
  async updateRole(id, role) {
    return prisma_default.user.update({
      where: { id },
      data: { role },
      select: userSelect
    });
  },
  async updatePushToken(email, pushToken) {
    return prisma_default.user.update({
      where: { email },
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
            name: true,
            sector: {
              select: {
                id: true,
                name: true
              }
            }
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
  async updateUserRole(userId, role) {
    if (!VALID_ROLES.includes(role)) {
      throw new BadRequestError("Invalid role");
    }
    const user = await this.getUserById(userId);
    return userRepository.updateRole(userId, role);
  },
  async deleteUser(id) {
    await this.getUserById(id);
    return userRepository.delete(id);
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

// src/controllers/users/routes.ts
var router = new import_hono.Hono();
router.get("/users", userHandler.getAll);
router.put("/users/:id", userHandler.updateRole);
var routes_default = router;

// src/controllers/auth/routes.ts
var import_hono2 = require("hono");

// src/controllers/auth/index.ts
var import_cookie = require("hono/cookie");
var import_http_status_codes3 = require("http-status-codes");

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
var authService = {
  generateToken(payload) {
    return (0, import_jwt.sign)(payload, envConfig.JWT_SECRET, "HS256");
  },
  async verifyToken(token) {
    try {
      const payload = await (0, import_jwt.verify)(token, envConfig.JWT_SECRET, "HS256");
      return {
        userId: payload.userId,
        email: payload.email,
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
  async register(email, password, name, isDepartmentHead, role) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("Email already in use");
    }
    if (password.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters");
    }
    const hashedPassword = await this.hashPassword(password);
    return userRepository.create(email, hashedPassword, name, isDepartmentHead, role);
  },
  async login(email, password, pushToken) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }
    await userRepository.updatePushToken(email, pushToken);
    return user;
  },
  async createSession(userId, email, role) {
    await sessionRepository.deleteByUserId(userId);
    const token = await this.generateToken({ userId, email, role });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    await sessionRepository.create(userId, token, expiresAt);
    return token;
  },
  async destroySession(token) {
    return sessionRepository.deleteByToken(token);
  }
};

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

// src/controllers/auth/index.ts
var authHandler = {
  async register(c) {
    const { email, password, name, isDepartmentHead, role } = await c.req.json();
    if (!email || !password || !name) {
      throw new BadRequestError("Missing required fields");
    }
    const user = await authService.register(
      email,
      password,
      name,
      isDepartmentHead,
      role
    );
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
    const { email, password, pushToken } = await c.req.json();
    if (!email || !password) {
      throw new BadRequestError("Email and password required");
    }
    const user = await authService.login(email, password, pushToken);
    const token = await authService.createSession(
      user.id,
      user.email,
      user.role
    );
    (0, import_cookie.setCookie)(c, COOKIE_NAMES.accessToken, token, COOKIE_CONFIG);
    return c.json(
      {
        success: true,
        message: "Logged in successfully",
        data: {
          user: {
            id: user.id,
            email: user.email,
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
    const token = (0, import_cookie.getCookie)(c, COOKIE_NAMES.accessToken);
    if (token) {
      await authService.destroySession(token);
    }
    (0, import_cookie.deleteCookie)(c, COOKIE_NAMES.accessToken, COOKIE_CONFIG);
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
var ppaSelect = {
  id: true,
  task: true,
  description: true,
  address: true,
  location: true,
  venue: true,
  expectedOutput: true,
  startDate: true,
  dueDate: true,
  startTime: true,
  dueTime: true,
  sector: true,
  implementingUnit: true,
  sectorId: true,
  lastNotifiedAt: true
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
      orderBy: { startDate: "asc" }
    });
  },
  async findAllWithNoNotified() {
    return prisma_default.pPA.findMany({
      where: {
        lastNotifiedAt: null
      },
      select: ppaSelect,
      orderBy: { startDate: "desc" }
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
    return prisma_default.pPA.create({
      data,
      select: ppaSelect
    });
  },
  async update(id, data) {
    return prisma_default.pPA.update({
      where: { id },
      data,
      select: ppaSelect
    });
  },
  async delete(id) {
    return prisma_default.pPA.delete({
      where: { id }
    });
  },
  // async findUpcomingPPAs() {
  //   const now = new Date();
  //   const tomorrow = new Date(now);
  //   tomorrow.setDate(now.getDate() + 1);
  //   return prisma.pPA.findMany({
  //     where: {
  //       startDate: {
  //         gte: now,
  //         lte: tomorrow,
  //       },
  //     },
  //     select: ppaSelect,
  //   });
  // },
  // async findConflictingLocations(
  //   startDate: Date,
  //   dueDate: Date,
  //   excludePPAId?: string
  // ) {
  //   return prisma.pPA.findMany({
  //     where: {
  //       AND: [
  //         {
  //           startDate: { lte: dueDate },
  //           dueDate: { gte: startDate },
  //         },
  //         ...(excludePPAId ? [{ id: { not: excludePPAId } }] : []),
  //       ],
  //     },
  //     select: {
  //       id: true,
  //       task: true,
  //       startDate: true,
  //       dueDate: true,
  //       location: true,
  //       venue: true,
  //     },
  //   });
  // },
  async findOverlappingPPAs(startDate, dueDate, excludePPAId) {
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
        { dueDate: { gt: today } }
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
var import_node_cron = __toESM(require("node-cron"));
var import_expo_server_sdk = require("expo-server-sdk");
var import_date_fns = require("date-fns");

// src/utils/dates.ts
var formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};
var formatTime = (timeString) => {
  return new Date(timeString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

// src/services/notificationService.ts
var expo = new import_expo_server_sdk.Expo();
var sentReminders = /* @__PURE__ */ new Set();
async function sendPushNotification({
  id,
  pushToken,
  title,
  body
}) {
  if (!import_expo_server_sdk.Expo.isExpoPushToken(pushToken)) {
    console.warn(`\u274C Invalid Expo push token: ${pushToken}`);
    return false;
  }
  try {
    const tickets = await expo.sendPushNotificationsAsync([
      {
        to: pushToken,
        sound: "default",
        title,
        body,
        priority: "high",
        channelId: "default"
      }
    ]);
    console.log("\u2705 Notification sent:", tickets);
    await ppaRepository.update(id, {
      lastNotifiedAt: /* @__PURE__ */ new Date()
    });
    return true;
  } catch (error) {
    console.error("\u274C Error sending push notification:", error);
    return false;
  }
}
async function checkUpcomingPPAs() {
  const ppas = await ppaRepository.findAllWithNoNotified();
  for (const ppa of ppas) {
    if (!ppa.startDate) continue;
    const startDate = new Date(ppa.startDate);
    if (!(0, import_date_fns.isTomorrow)(startDate)) continue;
    const reminderKey = `${ppa.id}-tomorrow`;
    if (sentReminders.has(reminderKey)) continue;
    const success = await sendPushNotification({
      id: ppa.id,
      pushToken: "ExponentPushToken[wNGmf-KRx9kYapx0ufw7Su]",
      title: `\u{1F4C5} Reminder: ${ppa.task} starts tomorrow!`,
      body: `It begins at ${formatTime(ppa.startDate)} and ends on ${formatDate(ppa.dueDate)} at ${formatTime(ppa.dueTime)}. Don't forget to prepare!`
    });
    if (success) {
      sentReminders.add(reminderKey);
      console.log(`\u2705 Sent reminder for PPA: ${ppa.task}`);
    }
  }
}
async function remindReschedulePPA({
  id,
  title,
  body
}) {
  const data = {
    id,
    pushToken: "ExponentPushToken[wNGmf-KRx9kYapx0ufw7Su]",
    title: `${title}`,
    body: `${body}`
  };
  const success = await sendPushNotification(data);
  console.log("RESCHEDULE NOTIFICATION SENT:", success);
}
function startCronScheduler() {
  import_node_cron.default.schedule("* * * * *", async () => {
    console.log("\u23F0 Checking for PPAs starting tomorrow...");
    await checkUpcomingPPAs();
  });
  console.log("\u2705 Cron scheduler started (runs every 1 minute)");
}

// src/services/ppa.ts
var ppaService = {
  async getPPAById(id) {
    const ppa = await ppaRepository.findById(id);
    if (!ppa) throw new NotFoundError("PPA not found");
    return ppa;
  },
  async getAllPPAs() {
    return ppaRepository.findAll();
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
    return ppaRepository.create(data);
  },
  async updatePPA(id, data) {
    console.log("ID", id);
    const existing = await this.getPPAById(id);
    const updatedPPA = await ppaRepository.update(id, data);
    const title = "PPA Reschuled Notification";
    const body = `Reminder: The PPA "${updatedPPA.task}" has been rescheduled. Please check the new schedule. Thank you!`;
    await remindReschedulePPA({
      id,
      title,
      body
    });
    return updatedPPA;
  },
  async deletePPA(id) {
    await this.getPPAById(id);
    return ppaRepository.delete(id);
  }
};

// src/services/venue.ts
var venueService = {
  async checkLocationAvailability(startDate, dueDate, excludePPAId) {
    const ppas = await ppaRepository.findOverlappingPPAs(
      startDate,
      dueDate,
      excludePPAId
    );
    const conflictingPPAs = ppas.map((ppa) => ({
      id: ppa.id,
      task: ppa.task,
      description: ppa.description,
      startDate: ppa.startDate,
      dueDate: ppa.dueDate,
      startTime: ppa.startTime,
      dueTime: ppa.dueTime,
      location: ppa.location,
      venue: ppa.venue,
      sector: ppa.sector,
      implementingUnit: ppa.implementingUnit
    }));
    return {
      available: conflictingPPAs.length === 0,
      conflictingPPAs
    };
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
      excludePPAId
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
    const body = await c.req.json();
    const requiredFields = [
      "task",
      "description",
      "address",
      "startDate",
      "dueDate",
      "startTime",
      "dueTime",
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
      location: body.location,
      venue: body.venue,
      expectedOutput: body.expectedOutput,
      startDate: new Date(body.startDate),
      dueDate: new Date(body.dueDate),
      startTime: new Date(body.startTime),
      dueTime: new Date(body.dueTime),
      sectorId: body.sectorId,
      implementingUnitId: body.implementingUnitId
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
    const id = c.req.param("id");
    const data = await c.req.json();
    if (!id) throw new BadRequestError("Missing PPA ID");
    const updated = await ppaService.updatePPA(id, data);
    return c.json(
      {
        success: true,
        message: "PPA rescheduled successfully",
        data: updated
      },
      import_http_status_codes4.StatusCodes.OK
    );
  },
  async delete(c) {
    const user = c.get("user");
    const id = c.req.param("id");
    if (!id) throw new BadRequestError("Missing PPA ID");
    await ppaService.deletePPA(id);
    return c.json(
      {
        success: true,
        message: "PPA deleted successfully"
      },
      import_http_status_codes4.StatusCodes.OK
    );
  }
};

// src/middlewares/auth.ts
var import_cookie2 = require("hono/cookie");
var authMiddleware = async (c, next) => {
  const token = (0, import_cookie2.getCookie)(c, COOKIE_NAMES.accessToken);
  if (!token) {
    throw new UnauthorizedError("No token provided");
  }
  const session = await sessionRepository.findByToken(token);
  console.log(session);
  if (!session || /* @__PURE__ */ new Date() > session.expiresAt) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const payload = await authService.verifyToken(token);
  if (!payload) {
    throw new UnauthorizedError("Invalid token");
  }
  const user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role
  };
  c.set("user", user);
  await next();
};

// src/controllers/ppa/routes.ts
var router3 = new import_hono3.Hono();
router3.post("/ppas", authMiddleware, ppaHandler.create);
router3.post("/ppas/check-availability", ppaHandler.checkAvailability);
router3.get("/ppas", authMiddleware, ppaHandler.getAll);
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
  sectorId: true,
  deptHead: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  sector: {
    select: {
      id: true,
      name: true,
      description: true
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
      dueDate: true,
      startTime: true,
      dueTime: true
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
  async findBySectorId(sectorId) {
    return prisma_default.implementingUnit.findMany({
      where: { sectorId },
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
  async create(name, userId, sectorId) {
    return prisma_default.implementingUnit.create({
      data: { name, userId, sectorId },
      select: implementingUnitSelect
    });
  },
  async update(id, name, userId, sectorId) {
    console.log("PRISMA UPDATE: ", id);
    return prisma_default.implementingUnit.update({
      where: { id },
      data: { name, userId, sectorId },
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
      ImplementingUnit: true,
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
        ImplementingUnit: {
          select: {
            id: true,
            name: true,
            deptHead: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
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
            ImplementingUnit: true,
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
    if (!name || !description) {
      throw new BadRequestError("Name and description are required");
    }
    const existingSector = await sectorRepository.findByName(name);
    if (existingSector) {
      throw new ConflictError("Sector with this name already exists");
    }
    return sectorRepository.create(name, description);
  },
  async updateSector(id, name, description) {
    if (!name || !description) {
      throw new BadRequestError("Name and description are required");
    }
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
    const implementingUnits = await implementingUnitRepository.findBySectorId(id);
    if (implementingUnits.length > 0) {
      throw new BadRequestError(
        "Cannot delete sector with existing implementing units"
      );
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
    if (!name || !description) {
      throw new BadRequestError("Name and description are required");
    }
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
    if (!name || !description) {
      throw new BadRequestError("Name and description are required");
    }
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
  async getImplementingUnitsBySectorId(sectorId) {
    const sector = await sectorRepository.findById(sectorId);
    if (!sector) {
      throw new NotFoundError("Sector not found");
    }
    return implementingUnitRepository.findBySectorId(sectorId);
  },
  async getImplementingUnitByUserId(userId) {
    const unit = await implementingUnitRepository.findByUserId(userId);
    if (!unit) {
      throw new NotFoundError("No implementing unit assigned to this user");
    }
    return unit;
  },
  async createImplementingUnit(name, userId, sectorId) {
    if (!name || !userId || !sectorId) {
      throw new BadRequestError("Name, userId, and sectorId are required");
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
    const sector = await sectorRepository.findById(sectorId);
    if (!sector) {
      throw new NotFoundError("Sector not found");
    }
    await userRepository.updateDepartmentHeadStatus(userId, true);
    return implementingUnitRepository.create(name, userId, sectorId);
  },
  async updateImplementingUnit(id, name, userId, sectorId) {
    if (!name || !userId || !sectorId) {
      throw new BadRequestError("Name, userId, and sectorId are required");
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
    console.log("USER ID", userId);
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
    const sector = await sectorRepository.findById(sectorId);
    if (!sector) {
      throw new NotFoundError("Sector not found");
    }
    return implementingUnitRepository.update(id, name, userId, sectorId);
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
  async getBySectorId(c) {
    const sectorId = c.req.param("sectorId");
    const units = await implementingUnitService.getImplementingUnitsBySectorId(sectorId);
    return c.json(
      {
        success: true,
        data: { implementingUnits: units }
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
    const { name, userId, sectorId } = await c.req.json();
    if (!name || !userId || !sectorId) {
      throw new BadRequestError("Name, userId, and sectorId are required");
    }
    const unit = await implementingUnitService.createImplementingUnit(
      name,
      userId,
      sectorId
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
    const { name, userId, sectorId } = await c.req.json();
    if (!name || !userId || !sectorId) {
      throw new BadRequestError("Name, userId, and sectorId are required");
    }
    const unit = await implementingUnitService.updateImplementingUnit(
      id,
      name,
      userId,
      sectorId
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
router5.get(
  "/implementing-units/sector/:sectorId",
  authMiddleware,
  implementingUnitHandler.getBySectorId
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
var app = new import_hono7.Hono();
app.onError(errorHandlerMiddleware);
app.use((0, import_logger.logger)());
routes.forEach((route) => {
  app.route("/", route);
});
(0, import_node_server.serve)(
  {
    fetch: app.fetch,
    port: envConfig.APP_PORT
  },
  (info) => {
    console.log(`\u2705 Server is running on http://localhost:${info.port}`);
    startCronScheduler();
  }
);
//# sourceMappingURL=index.js.map