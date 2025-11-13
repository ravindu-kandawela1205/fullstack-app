"use client"

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts"

export function ChartRadialMini({ value, maxValue = 100 }: { 
  value: number, 
  maxValue?: number 
}) {
  const percentage = Math.min((value / maxValue) * 100, 100)
  const chartData = [
    { name: "value", value: percentage, fill: "#3b82f6" },
  ]

  return (
    <div className="h-20 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={chartData}
          startAngle={90}
          endAngle={-270}
          innerRadius={15}
          outerRadius={38}
        >
          <RadialBar dataKey="value" background cornerRadius={3} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-sm font-bold"
                    >
                      {value}
                    </text>
                  )
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ChartRadialText({ totalItems, productsCount, usersCount }: { 
  totalItems: number, 
  productsCount: number, 
  usersCount: number 
}) {
  const chartData = [
    { name: "total", value: totalItems, fill: "#3b82f6" },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Overview</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Current system totals</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={250}
            innerRadius={60}
            outerRadius={90}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="value" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalItems}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-sm"
                        >
                          Total Items
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{productsCount}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Products</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{usersCount}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Users</p>
        </div>
      </div>
    </div>
  )
}