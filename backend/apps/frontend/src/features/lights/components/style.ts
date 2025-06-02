import styled from 'styled-components';
import { theme } from "@/app/style";
import { LightButtonProps, StyledProps } from '../types';

export const Title = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ isDark }) => 
    isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};

  span {
    font-size: 1rem;
    font-weight: 500;
    color: ${({ isDark }) => theme[isDark ? "dark" : "light"].text};
    letter-spacing: 0.2px;
  }

  .icon {
    color: ${({ isDark }) => theme[isDark ? "dark" : "light"].textSecondary};
    opacity: 0.8;
    transition: opacity 0.2s ease;
  }

  &:hover .icon {
    opacity: 1;
  }
`;

export const LightButton = styled.button<LightButtonProps>`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;

  background-color: ${({ active, isDark }) =>
    active
      ? theme[isDark ? "dark" : "light"].success
      : 'transparent'};
  color: ${({ active, isDark }) =>
    active
      ? "#ffffff"
      : theme[isDark ? "dark" : "light"].text};
  border: 1px solid ${({ active, isDark }) =>
    active
      ? 'transparent'
      : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};

  &:hover {
    background-color: ${({ active, isDark }) =>
      active
        ? theme[isDark ? "dark" : "light"].successHover
        : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`; 