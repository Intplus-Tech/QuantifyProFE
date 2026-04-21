"use client";
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
