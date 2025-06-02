// components/SimpleBarChart.tsx
"use client";

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js"

// Registrar os componentes do Chart.js
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function SimpleBarChart() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Vendas',
        data: [12, 19, 3, 5, 2],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div className="w-full max-w-2xl p-4">
      <Bar data={data} options={options} />
    </div>
  );
}
