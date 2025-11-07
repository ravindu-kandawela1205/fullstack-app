import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
};

export default function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trendUp ? "text-green-600" : "text-red-600"}`}>
              {trend}
            </p>
          )}
        </div>
        <div className="bg-blue-100 p-3 rounded-lg">
          <Icon className="h-8 w-8 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
