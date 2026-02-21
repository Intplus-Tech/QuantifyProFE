"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EnterprisePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/enterprise/dashboard");
  }, [router]);

  return null;
}
