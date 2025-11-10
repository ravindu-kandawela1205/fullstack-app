import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { useProductsQuery } from '@/hooks/products/useProductsQuery.hook';

export default function UsersChart() {
  const { data } = useProductsQuery(1, 50);

  // Group products by category and calculate average stock
  const categoryData = data?.data?.reduce((acc: any, product) => {
    const category = product.Category || 'Unknown';
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0 };
    }
    acc[category].total += product.Stock || 0;
    acc[category].count += 1;
    return acc;
  }, {}) || {};

  const chartData = Object.entries(categoryData).map(([category, data]: [string, any]) => ({
    category: category.substring(0, 10),
    stock: Math.round(data.total / data.count),
    fullName: category
  })).slice(0, 6);

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Product Categories Stock</h3>
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
            <Radar
              name="Average Stock"
              dataKey="stock"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}