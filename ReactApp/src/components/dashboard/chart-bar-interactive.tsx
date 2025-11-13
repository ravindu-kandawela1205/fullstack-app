"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive area chart"

const chartConfig = {
  visitors: {
    label: "Data",
  },
  desktop: {
    label: "Total Stock",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Product Count",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ productsData = [], usersData = [] }: { productsData?: any[], usersData?: any[] }) {
  const [timeRange, setTimeRange] = React.useState("90d")

  // Group products by category and show stock
  const categoryData: { [key: string]: { totalStock: number, count: number } } = {};
  productsData.forEach((product) => {
    const category = product.Category || 'Unknown';
    if (!categoryData[category]) {
      categoryData[category] = { totalStock: 0, count: 0 };
    }
    categoryData[category].totalStock += product.Stock || 0;
    categoryData[category].count += 1;
  });
  
  const chartData = Object.entries(categoryData).map(([category, data]) => ({
    date: category.substring(0, 15),
    desktop: data.totalStock,
    mobile: data.count,
  }));
  
  // Fallback if no data
  if (chartData.length === 0) {
    chartData.push({ date: "No Data", desktop: 0, mobile: 0 });
  }

  const filteredData = chartData.filter((item) => {
    // Since we're using real data, just return all items
    return true;
  })

  return (
    <Card className="pt-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-gray-900 dark:text-gray-100">Product Categories Stock</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Showing stock levels by product category
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}