import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { env } from "../../../../lib/env";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!env.authUsername || !env.authPassword) {
        return null;
      }

      const username = typeof credentials?.username === "string" ? credentials.username : "";
      const password = typeof credentials?.password === "string" ? credentials.password : "";

      if (username === env.authUsername && password === env.authPassword) {
        return {
          id: username,
          name: username,
        };
      }

      return null;
    },
  }),
];

if (env.googleClientId && env.googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  secret: env.authSecret,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export const runtime = "nodejs";
