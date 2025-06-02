import { useDashboard } from "@/contexts/dashboardContext";
import { Home } from "./dashboard/Home";
import { Waters } from "./dashboard/DashboardWaters";
import { Lights } from "./dashboard/DashboardLights";
import { Temperature } from "./dashboard/DashboardTemperature";
import { Generators } from "./dashboard/DashboardGenerators";
import styled from "styled-components";

const Container = styled.main`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

export function MainContent() {
  const { state } = useDashboard();

  return (
    <Container>
      {state.activeScreen === "home" && <Home />}
      {state.activeScreen === "waters" && <Waters />}
      {state.activeScreen === "temperature" && <Temperature />}
      {state.activeScreen === "generators" && <Generators />}
      {state.activeScreen === "lights" && <Lights />}
    </Container>
  );
} 