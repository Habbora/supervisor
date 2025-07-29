'use client';

import { useEffect, useState } from "react";
import { useWebSocket } from "@/ws/useWebSocket";
import LevelSensor from "@/components/hidraulico/LevelSensor";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import PumpControl from "@/components/hidraulico/PumpControl";

// Registrar os componentes do Chart.js para gráfico de linha
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Função para formatar o tempo de forma mais legível
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // Mantemos o controle da altura
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Níveis de Água - Histórico Temporal',
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          return `${context.dataset.label}: ${context.parsed.y}%`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: 'Nível (%)'
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      }
    },
    x: {
      title: {
        display: true,
        text: 'Horário'
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      }
    }
  }
};

export default function HidraulicoPage() {
  const { ws, sendMessage } = useWebSocket();
  const [chartData, setChartData] = useState<any>(undefined);
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.payload.devices)
          setDevices(data.payload.devices);

        if (data.payload.history)
          setChartData(createData(data.payload.history));
      };
    }
  }, [ws, sendMessage]);

  function createData(data: any) {
    return {
      labels: data[0]?.history.map((item: any) => formatTime(item.timestamp)),
      datasets: [
        {
          label: 'Reservatório Inferior',
          data: data[0]?.history.map((item: any) => item.value),
          fill: true,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.2,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'Reservatório Superior',
          data: data[1]?.history.map((item: any) => item.value),
          fill: true,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.2,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold p-4">Reservatório de Água</h1>
      <div className="p-4">
        {/* Card do Gráfico de Linha de Nível de Água */}
        <div className="p-4 bg-white rounded-lg shadow-md mb-4">
          <div style={{ height: '300px' }}> {/* Altura fixa e menor */}
            {chartData && <Line data={chartData} options={chartOptions} />}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <LevelSensor
            sensor={{
              id: "1",
              name: "Reservatório Inferior",
              value: devices.find((device: any) => device.id === "0")?.value,
              isAlert: false
            }}
          />
          <LevelSensor
            sensor={{
              id: "2",
              name: "Reservatório Superior",
              value: devices.find((device: any) => device.id === "1")?.value,
              isAlert: false
            }}
          />
          <PumpControl
            pump={{
              id: "3",
              name: "Bomba 1",
              value: devices.find((device: any) => device.id === "2")?.value,
              isAlert: false
            }}
          />
          <PumpControl
            pump={{
              id: "4",
              name: "Bomba 2",
              value: devices.find((device: any) => device.id === "3")?.value,
              isAlert: false
            }}
          />
        </div>
      </div>

      <h1 className="text-2xl font-bold p-4">Água Pluviais</h1>
      <div className="p-4">
        <div className="flex flex-wrap gap-4">
          <LevelSensor
            sensor={{
              id: "5",
              name: "Água Pluviais",
              value: devices.find((device: any) => device.id === "4")?.value,
              isAlert: false
            }}
          />
          <PumpControl
            pump={{
              id: "6",
              name: "Bomba 1",
              value: devices.find((device: any) => device.id === "5")?.value,
              isAlert: false
            }}
          />
          <PumpControl
            pump={{
              id: "7",
              name: "Bomba 2",
              value: devices.find((device: any) => device.id === "6")?.value,
              isAlert: false
            }}
          />
        </div>
      </div>

      <h1 className="text-2xl font-bold p-4">Água Esgoto</h1>
      <div className="p-4">
        <div className="flex flex-wrap gap-4">
          <LevelSensor
            sensor={{
              id: "8",
              name: "Água Esgoto",
              value: devices.find((device: any) => device.id === "7")?.value,
              isAlert: false
            }}
          />
          <PumpControl
            pump={{
              id: "9",
              name: "Bomba 1",
              value: devices.find((device: any) => device.id === "8")?.value,
              isAlert: false
            }}
          />
          <PumpControl
            pump={{
              id: "10",
              name: "Bomba 2",
              value: devices.find((device: any) => device.id === "9")?.value,
              isAlert: false
            }}
          />
          <PumpControl
            pump={{
              id: "11",
              name: "Bomba 2",
              value: devices.find((device: any) => device.id === "10")?.value,
              isAlert: false
            }}
          />
        </div>
      </div>
    </>
  );
} 