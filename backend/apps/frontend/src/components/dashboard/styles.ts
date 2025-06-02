import styled from "styled-components";

export const TabsContainer = styled.div`
  width: 100%;
  padding: 20px;
`;

export const Tabs = styled.div`
  display: flex;
  gap: 10px;
`;

export const TabButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }
`;

export const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  margin: 20px 0;
`; 