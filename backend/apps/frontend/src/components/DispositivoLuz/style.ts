import styled from 'styled-components';

export const DispositivosContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 15px;
  @media screen and (max-width: 480px){
    display: block;
  }
`;

export const LugarContainer = styled.div`
  width: 100%;
  padding: 1rem;
`;

export const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;

  span {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  .icon {
    width: 24px;
    height: 24px;
  }
`;

export const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background-color: #ffffff;
    font-size: 0.875rem;
    color: #1a1a1a;
    outline: none;
    transition: border-color 0.2s ease;

    &:focus {
      border-color: #2577e2;
    }
  }

  div {
    display: flex;
    gap: 0.75rem;
  }
`;

export const LightButton = styled.button<{ active?: boolean; className?: string }>`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.on {
    background-color: ${({ active }) => (active ? "#4CAF50" : "#e0e0e0")};
    color: ${({ active }) => (active ? "#ffffff" : "#666666")};

    &:hover {
      background-color: ${({ active }) => (active ? "#43A047" : "#d5d5d5")};
    }
  }

  &.off {
    background-color: ${({ active }) => (!active ? "#f44336" : "#e0e0e0")};
    color: ${({ active }) => (!active ? "#ffffff" : "#666666")};

    &:hover {
      background-color: ${({ active }) => (!active ? "#e53935" : "#d5d5d5")};
    }
  }
`;

