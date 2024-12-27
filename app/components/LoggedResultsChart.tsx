"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { subDays } from "date-fns";

/**
 * Each item in your chart data must have at least:
 * - date (string in YYYY-MM-DD format, or a Date object you can format)
 * - load (number representing training load)
 */
export interface ChartDataItem {
  date: string;
  load: number;
}

/**
 * The props your separate chart component accepts:
 */
interface LoggedResultsChartProps {
  /** The full array of (date, load) data points. */
  allData: ChartDataItem[];
  /** Currently selected time frame in days (e.g. "7", "30", "90", "365"). */
  timeFrame: string;
  /** Called when the user picks a new time frame. */
  onTimeFrameChange: (newFrame: string) => void;
}

/**
 * This component:
 * - Renders a set of buttons for picking the timeFrame
 * - Filters the data to only the chosen timeframe
 * - Renders a line chart
 */
export default function LoggedResultsChart({
  allData,
  timeFrame,
  onTimeFrameChange,
}: LoggedResultsChartProps) {
  // Filter data by the chosen timeframe
  const cutoff = subDays(new Date(), parseInt(timeFrame, 10));
  const filteredData = allData.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= cutoff;
  });

  return (
    <div className="p-4 bg-gray-800 rounded-md mb-6">
      {/* Buttons for timeframe selection */}
      <div className="flex space-x-2 mb-4">
        {["7", "30", "90", "365"].map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeFrameChange(tf)}
            className={`px-3 py-1 rounded ${
              timeFrame === tf
                ? "bg-pink-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-pink-500 hover:text-white"
            }`}
          >
            {tf === "7"
              ? "7 Days"
              : tf === "30"
              ? "30 Days"
              : tf === "90"
              ? "90 Days"
              : "1 Year"}
          </button>
        ))}
      </div>

      {/* The Recharts line chart */}
      <div style={{ width: "100%", height: 300 }} className="bg-gray-900 rounded p-2">
        <ResponsiveContainer>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
              labelStyle={{ color: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="load"
              stroke="#EC4899"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
