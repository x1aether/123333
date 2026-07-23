import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail, hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { readCollection, writeCollection, generateId } from "@/lib/db";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user exists
          const existingUser = await getUserByEmail(user.email);
          if (!existingUser) {
            // Auto-create user from Google OAuth
            const users = await readCollection<any>("users");
            const newUser = {
              id: generateId("usr"),
              name: user.name || user.email.split("@")[0],
              email: user.email,
              phone: "",
              role: "customer",
              avatar: user.image || "",
              passwordHash: hashPassword(Math.random().toString(36).slice(-16)),
              isActive: true,
              addresses: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            users.push(newUser);
            await writeCollection("users", users);

            // Create our own session
            const sessionId = await createSession(newUser.id, "customer");
            await setSessionCookie(sessionId);
          } else {
            // Create our own session for existing user
            if (existingUser.isActive) {
              const sessionId = await createSession(existingUser.id, existingUser.role);
              await setSessionCookie(sessionId);
            }
          }
        } catch (error) {
          console.error("Google OAuth sign-in error:", error);
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
