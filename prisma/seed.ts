// import { ROLE } from "@/generated/prisma";
// import prisma from "@/lib/prisma";

// async function main() {
//   try {
//     console.log("Creating user...");
//     // const hashedPassword = await hashPassword("test123");
//     const user = await prisma.user.create({
//       data: {
//         email: `test-${Date.now()}@example.com`,
//         name: "Test User",
//         password: hashedPassword,
//         role: ROLE.ADMIN,
//       },
//     });
//     console.log("✅ User created:", user);
//   } catch (error) {
//     console.error("❌ Error:", error);
//     throw error;
//   }
// }

// main();
