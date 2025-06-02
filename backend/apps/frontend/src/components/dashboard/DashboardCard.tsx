import styled from "styled-components";

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.borderHover};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  h2 {
    margin: 0 0 16px 0;
    color: ${({ theme }) => theme.text};
    font-size: 1.1rem;
    font-weight: 500;
    letter-spacing: -0.01em;
  }
`;

type DashboardCardProps = {
  title: string;
  children: React.ReactNode;
};

export function DashboardCard({ title, children }: DashboardCardProps) {
  return (
    <Card>
      <h2>{title}</h2>
      {children}
    </Card>
  );
} 