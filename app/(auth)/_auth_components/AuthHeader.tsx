import { Button } from "@/components/ui/button";
import { ChevronDown, Search, SquareStack } from "lucide-react";
import Link from "next/link";
import React from "react";

const AuthHeader = () => {
  return (
    <div>
      <header className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2 text-foreground">
          <SquareStack className="size-4 text-primary" />
          <span className="text-xl font-semibold leading-none">Quantify</span>
          <span className="text-xl font-semibold leading-none text-primary">
            Pro
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex h-6 items-center gap-1 rounded-md border bg-muted px-2 text-xs text-muted-foreground">
            <Search className="size-3" />
            Search
          </button>
          <button className="inline-flex h-6 items-center gap-1 text-xs text-muted-foreground">
            English (United Kingdom)
            <ChevronDown className="size-3" />
          </button>
          <Button asChild size="sm" className="h-7 rounded-md px-3 text-xs">
            <Link href="/auth/register">Create Account</Link>
          </Button>
        </div>
      </header>
    </div>
  );
};

export default AuthHeader;
