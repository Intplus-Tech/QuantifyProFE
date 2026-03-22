"use client";
import { RootState } from "@/store";
import { useGetProfileQuery } from "@/store/api/userApi";
import { setAuth } from "@/store/slices/authSlice";
import { LoginResponse } from "@/types/auth";
import { Loader, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { data, status } = useSession();
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  console.log(data, "userData");
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isError,
  } = useGetProfileQuery(undefined, {
    skip: status !== "authenticated",
  });

  useEffect(() => {
    if (status === "authenticated") {
      const Data = data as unknown as {
        accessToken: string;
        refreshToken: string;
        user: LoginResponse["data"]["user"];
      };
      dispatch(
        setAuth({
          accessToken: Data.accessToken,
          currentUser: Data.user,
          user: null,
          company: null,
        }),
      );
    }
  }, [status, data, dispatch]);

  useEffect(() => {
    if ((data as any)?.user?.role === "company") {
      router.push("/enterprise/dashboard");
    }
  }, [data]);

  useEffect(() => {
    if (status === "unauthenticated" && !currentUser) {
      router.push("/auth/login");
    }
  }, [status, currentUser, router]);

  useEffect(() => {
    if (isError) {
      router.push("/auth/login");
    }
  }, [isError]);

  if (status === "loading" || isProfileLoading || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 size={60} className="animate-spin text-amber-500" />
      </div>
    );
  }

  return <>{children}</>;
}
