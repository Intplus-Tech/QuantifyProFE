/*eslint-disable @typescript-eslint/no-explicit-any */
import { LoginResponse } from "@/types/auth";
import { ApiEndpoints } from "@/utils/endpoints";

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  secret: "KR3lfpze4CblCUEOqOVf4eG1vtRmyx12dskLCP3RaMj",
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        console.log(ApiEndpoints.baseUrl, "base url");
        const res = await fetch(`${ApiEndpoints.baseUrl}auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        const data = await res.json();
        console.log(data, "data", "resp", res);

        if (res.ok) {
          return data;
        } else throw Error(data.message ?? "Something went wrong");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const User = user as any as LoginResponse;
        token = {
          accessToken: User.data.tokens.accessToken,
          user: User.data.user,
        };
      }

      return token;
    },
    async session({ session, token }: any) {
      session = { ...session, ...token, user: token.user };
      return session;
    },
  },
});

export { handler as GET, handler as POST };
