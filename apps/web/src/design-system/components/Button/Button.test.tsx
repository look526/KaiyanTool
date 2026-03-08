import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

// 模拟 tailwind-merge 和 clsx
jest.mock('tailwind-merge', () => {
  return {
    twMerge: (classes: string) => classes,
  };
});

jest.mock('clsx', () => {
  return {
    default: (...classes: any[]) => classes.filter(Boolean).join(' '),
  };
});

describe('Button Component', () => {
  test('renders with default props', () => {
    render(<Button>Test Button</Button>);
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Test Button');
  });

  test('renders with different variants', () => {
    const variants = ['primary', 'secondary', 'accent', 'outline', 'ghost', 'link'];
    
    variants.forEach((variant) => {
      render(<Button variant={variant as any}>Test {variant}</Button>);
      const button = screen.getByRole('button', { name: new RegExp(`test ${variant}`, 'i') });
      expect(button).toBeInTheDocument();
    });
  });

  test('renders with different sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'];
    
    sizes.forEach((size) => {
      render(<Button size={size as any}>Test {size}</Button>);
      const button = screen.getByRole('button', { name: new RegExp(`test ${size}`, 'i') });
      expect(button).toBeInTheDocument();
    });
  });

  test('renders with loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button', { name: /loading/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  test('renders with fullWidth prop', () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByRole('button', { name: /full width/i });
    expect(button).toBeInTheDocument();
  });

  test('renders with rounded prop', () => {
    render(<Button rounded>Rounded</Button>);
    const button = screen.getByRole('button', { name: /rounded/i });
    expect(button).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  test('is disabled when loading prop is true', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button', { name: /loading/i });
    expect(button).toBeDisabled();
  });

  test('accepts custom className', () => {
    const customClass = 'custom-class';
    render(<Button className={customClass}>Custom Class</Button>);
    const button = screen.getByRole('button', { name: /custom class/i });
    expect(button).toHaveClass(customClass);
  });
});