import { Users, UserCog, Activity } from "lucide-react";
import StockChart from "@/components/dashboard/StockChart";
import UsersChart from "@/components/dashboard/UsersChart";
import { ChartAreaInteractive } from "@/components/dashboard/chart-bar-interactive";
import { ChartRadialMini, ChartRadialText } from "@/components/dashboard/chart-radial-text";
import { useAuth } from "@/store/authStore";

import { useProductsQuery } from "@/hooks/products/useProductsQuery.hook";
import { useLocalUsers } from "@/store/useLocalUsers";

export default function Dashboard() {
  const { data } = useProductsQuery(1, 10);
  const { users: localUsers } = useLocalUsers();
    const { user } = useAuth();
  const productsCount = data?.total || 0;
  const localUsersCount = localUsers.length;
  const totalItems = productsCount + localUsersCount;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{totalItems}</p>
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">+12% from last month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
          

              <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Products</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{productsCount}</p>
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">+8% from last month</p>
            </div>
           
            <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900">
              <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Local Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{localUsersCount}</p>
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">+5% from last month</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900">
              <UserCog className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StockChart />
        <UsersChart />
        <ChartRadialText totalItems={totalItems} productsCount={productsCount} usersCount={localUsersCount} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartAreaInteractive productsData={data?.data || []} usersData={localUsers} />
      </div>
    </div>
  );
}