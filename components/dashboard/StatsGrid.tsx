import { ReactNode } from "react";

interface Stat {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  colorClass?: string;
  extra?: ReactNode;
  border?: boolean;
}

interface StatsGridProps {
  stats: Stat[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => {
        const cardClass =
          "flex items-center justify-center h-fit rounded-2xl py-4 px-6" +
          (idx === 0
            ? " bg-gradient-to-br from-primary/80 via-primary/50 to-primary"
            : " bg-card") +
          (stat.border ? " border border-primary/10" : "");
        return (
          <div key={idx} className={cardClass} style={{ height: "120px" }}>
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
                <p className={stat.colorClass || ""}>{stat.label}</p>
                <p className="text-4xl font-bold text-foreground">
                  {stat.value}
                </p>
                {stat.extra}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
