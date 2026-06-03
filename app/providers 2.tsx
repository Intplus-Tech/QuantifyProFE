"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { SessionProvider } from "next-auth/react";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
