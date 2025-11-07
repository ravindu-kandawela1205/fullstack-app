import { Users, UserCog, Activity, TrendingUp } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { useProductsQuery } from "@/hooks/products/useProductsQuery.hook";
import { useLocalUsers } from "@/store/useLocalUsers";

export default function Dashboard() {
  const { data } = useProductsQuery(1, 10);
  const { users: localUsers } = useLocalUsers();

  const productsCount = data?.total || 0;
  const localUsersCount = localUsers.length;
  const totalItems = productsCount + localUsersCount;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Items"
          value={totalItems}
          icon={Users}
          trend="+12% from last month"
          trendUp={true}
        />
        <StatCard
          title="Products"
          value={productsCount}
          icon={Activity}
          trend="+8% from last month"
          trendUp={true}
        />
        <StatCard
          title="Local Users"
          value={localUsersCount}
          icon={UserCog}
          trend="+5% from last month"
          trendUp={true}
        />
        <StatCard
          title="Active Sessions"
          value="24"
          icon={TrendingUp}
          trend="+3% from last month"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">New user registered</span>
              <span className="text-xs text-gray-400">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">User profile updated</span>
              <span className="text-xs text-gray-400">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">New local user added</span>
              <span className="text-xs text-gray-400">1 day ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Products</span>
                <span className="font-medium">{Math.round((productsCount / totalItems) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(productsCount / totalItems) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Local Users</span>
                <span className="font-medium">{Math.round((localUsersCount / totalItems) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(localUsersCount / totalItems) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
