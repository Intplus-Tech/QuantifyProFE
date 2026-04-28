import { ReactNode } from "react";
import Link from "next/link";

interface Stat {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  colorClass?: string;
  extra?: ReactNode;
  border?: boolean;
  href?: string;
}

interface StatsGridProps {
  stats: Stat[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const cardClass =
          "flex items-center justify-center h-fit rounded-2xl py-4 px-6 transition-all hover:opacity-90" +
          (idx === 0
            ? " bg-gradient-to-br from-primary/80 via-primary/50 to-primary text-white"
            : " bg-card") +
          (stat.border ? " border border-primary/10" : "");

        const content = (
          <div className="flex items-center gap-4 w-full py-4">
            {stat.icon && (
              <div
                className={
                  "p-4 rounded-full size-fit " +
                  (stat.colorClass || "bg-secondary")
                }
              >
                {stat.icon}
              </div>
            )}
            <div>
              <p className={stat.colorClass || (idx === 0 ? "text-white/80" : "text-muted-foreground")}>{stat.label}</p>
              <div className={`text-4xl font-bold ${idx === 0 ? "text-white" : "text-foreground"}`}>
                {stat.value}
              </div>
              {stat.extra}
            </div>
          </div>
        );

        return stat.href ? (
          <Link
            key={idx}
            href={stat.href}
            className={cardClass}
            style={{ height: "120px" }}
          >
            {content}
          </Link>
        ) : (
          <div key={idx} className={cardClass} style={{ height: "120px" }}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

