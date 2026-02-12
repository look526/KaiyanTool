// 测试文件暂时禁用 - 需要安装 @testing-library/react 和 vitest
// import { render, screen, fireEvent } from '@testing-library/react';
// import { describe, it, expect, vi } from 'vitest';
// import { Button } from '../components/ui/button';

// describe('Button', () => {
//   it('renders correctly', () => {
//     render(<Button>Click me</Button>);
//     expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
//   });

//   it('handles click events', () => {
//     const handleClick = vi.fn();
//     render(<Button onClick={handleClick}>Click me</Button>);
//     fireEvent.click(screen.getByRole('button'));
//     expect(handleClick).toHaveBeenCalledTimes(1);
//   });

//   it('applies variant classes', () => {
//     render(<Button variant="destructive">Delete</Button>);
//     const button = screen.getByRole('button');
//     expect(button).toHaveClass('bg-red-500');
//   });

//   it('applies size classes', () => {
//     render(<Button size="lg">Large</Button>);
//     const button = screen.getByRole('button');
//     expect(button).toHaveClass('h-11');
//   });

//   it('disables button when disabled prop is set', () => {
//     render(<Button disabled>Disabled</Button>);
//     expect(screen.getByRole('button')).toBeDisabled();
//   });
// });
