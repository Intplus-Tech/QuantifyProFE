"use client";
import { RootState } from "@/store";
import { useGetProfileQuery } from "@/store/api/userApi";
import { setAuth } from "@/store/slices/authSlice";
import { LoginResponse } from "@/types/auth";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { data, status } = useSession();
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

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
          user: null, // Initial placeholder for the full user profile
        }),
      );
    }
  }, [status, data, dispatch]);

  useEffect(() => {
    if (data?.user?.role === "company") {
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
        <Loader className="animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
