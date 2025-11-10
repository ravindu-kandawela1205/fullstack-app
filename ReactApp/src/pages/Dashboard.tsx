import { Users, UserCog, Activity, TrendingUp } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import StockChart from "@/components/dashboard/StockChart";
import UsersChart from "@/components/dashboard/UsersChart";
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-3xl font-bold mt-2">{totalItems}</p>
              <p className="text-sm mt-2 text-green-600">+12% from last month</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Products</p>
              <p className="text-3xl font-bold mt-2">{productsCount}</p>
              <p className="text-sm mt-2 text-green-600">+8% from last month</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Local Users</p>
              <p className="text-3xl font-bold mt-2">{localUsersCount}</p>
              <p className="text-sm mt-2 text-green-600">+5% from last month</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <UserCog className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockChart />
        <UsersChart />
      </div>
    </div>
  );
}
