import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarClass(avatar: string): string {
  const avatarColors = {
    default: "bg-gradient-to-br from-slate-500 to-slate-600",
    red: "bg-gradient-to-br from-red-500 to-red-600",
    orange: "bg-gradient-to-br from-orange-500 to-orange-600", 
    amber: "bg-gradient-to-br from-amber-500 to-amber-600",
    yellow: "bg-gradient-to-br from-yellow-500 to-yellow-600",
    lime: "bg-gradient-to-br from-lime-500 to-lime-600",
    green: "bg-gradient-to-br from-green-500 to-green-600",
    emerald: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    teal: "bg-gradient-to-br from-teal-500 to-teal-600",
    cyan: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    sky: "bg-gradient-to-br from-sky-500 to-sky-600",
    blue: "bg-gradient-to-br from-blue-500 to-blue-600",
    indigo: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    violet: "bg-gradient-to-br from-violet-500 to-violet-600",
    purple: "bg-gradient-to-br from-purple-500 to-purple-600",
    fuchsia: "bg-gradient-to-br from-fuchsia-500 to-fuchsia-600",
    pink: "bg-gradient-to-br from-pink-500 to-pink-600",
    rose: "bg-gradient-to-br from-rose-500 to-rose-600",
    // Legacy mappings
    primary: "bg-gradient-to-br from-blue-500 to-blue-600",
    secondary: "bg-gradient-to-br from-purple-500 to-purple-600",
    accent: "bg-gradient-to-br from-emerald-500 to-emerald-600",
  };
  
  return avatarColors[avatar as keyof typeof avatarColors] || avatarColors.default;
}

export function getAvatarOptions(): Array<{ value: string; label: string; class: string }> {
  return [
    { value: "red", label: "Red", class: "bg-gradient-to-br from-red-500 to-red-600" },
    { value: "orange", label: "Orange", class: "bg-gradient-to-br from-orange-500 to-orange-600" },
    { value: "amber", label: "Amber", class: "bg-gradient-to-br from-amber-500 to-amber-600" },
    { value: "yellow", label: "Yellow", class: "bg-gradient-to-br from-yellow-500 to-yellow-600" },
    { value: "lime", label: "Lime", class: "bg-gradient-to-br from-lime-500 to-lime-600" },
    { value: "green", label: "Green", class: "bg-gradient-to-br from-green-500 to-green-600" },
    { value: "emerald", label: "Emerald", class: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
    { value: "teal", label: "Teal", class: "bg-gradient-to-br from-teal-500 to-teal-600" },
    { value: "cyan", label: "Cyan", class: "bg-gradient-to-br from-cyan-500 to-cyan-600" },
    { value: "sky", label: "Sky", class: "bg-gradient-to-br from-sky-500 to-sky-600" },
    { value: "blue", label: "Blue", class: "bg-gradient-to-br from-blue-500 to-blue-600" },
    { value: "indigo", label: "Indigo", class: "bg-gradient-to-br from-indigo-500 to-indigo-600" },
    { value: "violet", label: "Violet", class: "bg-gradient-to-br from-violet-500 to-violet-600" },
    { value: "purple", label: "Purple", class: "bg-gradient-to-br from-purple-500 to-purple-600" },
    { value: "fuchsia", label: "Fuchsia", class: "bg-gradient-to-br from-fuchsia-500 to-fuchsia-600" },
    { value: "pink", label: "Pink", class: "bg-gradient-to-br from-pink-500 to-pink-600" },
    { value: "rose", label: "Rose", class: "bg-gradient-to-br from-rose-500 to-rose-600" },
  ];
}

export function getInitial(nickname: string): string {
  return nickname.charAt(0).toUpperCase();
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function getCompletionPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getStreakDisplay(streak: number): string {
  if (streak === 0) return "No streak";
  if (streak === 1) return "1 day";
  return `${streak} days`;
}
