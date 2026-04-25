"use client";

interface LibraryLocationTabsProps {
  locations: string[];
  activeLocation: string;
  onLocationChange: (location: string) => void;
}

export function LibraryLocationTabs({
  locations,
  activeLocation,
  onLocationChange,
}: LibraryLocationTabsProps) {
  return (
    <div className="flex w-full bg-white rounded-lg p-1 shadow-sm border border-border/50">
      {locations.map((loc) => (
        <button
          key={loc}
          onClick={() => onLocationChange(loc)}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
            activeLocation === loc
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
