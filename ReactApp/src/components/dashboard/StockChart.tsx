import * as React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { useProductsQuery } from '@/hooks/products/useProductsQuery.hook';

export default function StockChart() {
  const { data } = useProductsQuery(1, 50);
  const [activeChart, setActiveChart] = React.useState("stock")
  
  const chartData = data?.data?.slice(0, 10).map((product, index) => ({
    month: product.Name?.substring(0, 12) || `Product ${index + 1}`,
    name: product.Name || 'Unknown',
    stock: product.Stock || 0,
    category: product.Category
  })) || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Product Stock Levels</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveChart("stock")}
              className={`px-3 py-1 text-sm rounded ${
                activeChart === "stock" ? "bg-blue-100 text-blue-700" : "text-gray-600"
              }`}
            >
              Stock View
            </button>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-gray-600">
                          Stock: <span className="font-medium text-blue-600">{payload[0].value}</span>
                        </p>
                        <p className="text-xs text-gray-500">Category: {data.category}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="stock"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}