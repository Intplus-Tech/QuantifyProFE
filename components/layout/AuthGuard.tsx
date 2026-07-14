"use client";

// ============================================================================
// AUTH BYPASS — DEV / OFFLINE MODE
// ============================================================================
// Set this flag to `true` to skip all authentication checks and load
// any page (e.g. the workspace) without a backend connection.
//
// TO RE-ENABLE AUTH:
//   1. Change the line below to:  const BYPASS_AUTH = false;
//   2. npm run build  — confirm no TypeScript errors
//   3. Remove this comment block if you like, or leave it for future reference
//
// Nothing else needs to change — all the original auth logic below is preserved
// in commented-out form and will be fully active once BYPASS_AUTH is false.
// ============================================================================
const BYPASS_AUTH = false;

import { RootState } from "@/store";
import { useGetProfileQuery } from "@/store/api/userApi";
import { logout, setAuth } from "@/store/slices/authSlice";
import {
  getToken,
  getTokenExpiryTime,
  removeToken,
} from "@/utils/tokenManager";
import { Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // ── BYPASS: skip all auth when BYPASS_AUTH is true ─────────────────────────
  if (BYPASS_AUTH) {
    return <>{children}</>;
  }
  // ── END BYPASS ─────────────────────────────────────────────────────────────

  /* eslint-disable react-hooks/rules-of-hooks */
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const { currentUser, user } = useSelector((state: RootState) => state.auth);

  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getToken();
    setHasToken(!!token);
  }, []);

  useEffect(() => {
    if (!hasToken) return;

    const interval = setInterval(() => {
      const expiry = getTokenExpiryTime();
      if (expiry && Date.now() > expiry) {
        removeToken();
        setHasToken(false);
        dispatch(logout());
        toast.info("Your session has expired. Please log in again.");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [hasToken, dispatch]);

  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isError,
  } = useGetProfileQuery(undefined, {
    skip: !hasToken,
  });

  // Sync profile response back to currentUser so app state remains unified
  useEffect(() => {
    if (profileResponse?.data && !currentUser) {
      const token = getToken();
      if (token) {
        dispatch(
          setAuth({
            accessToken: token,
            currentUser: profileResponse.data,
            user: profileResponse.data,
            company: null,
          }),
        );
      }
    }
  }, [profileResponse, currentUser, dispatch]);

  useEffect(() => {
    if (hasToken === false) {
      if (!pathname.startsWith("/auth")) {
        router.push("/auth/login");
      }
    }
  }, [hasToken, pathname, router]);

  useEffect(() => {
    if (isError) {
      removeToken();
      dispatch(logout());
      if (!pathname.startsWith("/auth")) {
        router.push("/auth/login");
      }
    }
  }, [isError, dispatch, pathname, router]);

  if (pathname.startsWith("/auth")) {
    return <>{children}</>;
  }

  const activeUser = currentUser || profileResponse?.data;

  if (hasToken === null || isProfileLoading || !activeUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 size={60} className="animate-spin text-amber-500" />
      </div>
    );
  }

  return <>{children}</>;
}
