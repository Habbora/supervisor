import { useDashboard } from "@/contexts/dashboardContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardCard } from "./DashboardCard";
import { TabsContainer, Tabs, TabButton, ChartContainer } from "./styles";

export function Temperature() {
  const { state } = useDashboard();

  return (
    <>
      <TabsContainer>
        <Tabs>
          <TabButton>Temperaturas</TabButton>
        </Tabs>
      </TabsContainer>

      {state.temperatureSensors.map((sensor) => (
        <DashboardCard key={sensor.id} title={sensor.name}>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...sensor.readings].reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="chillerEntrada"
                  name="Entrada Chiller"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="chillerSaida"
                  name="Saída Chiller"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="aquecedor"
                  name="Aquecedor"
                  stroke="#ff7300"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </DashboardCard>
      ))}
    </>
  );
} 