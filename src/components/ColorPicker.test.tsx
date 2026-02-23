import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColorPicker } from './ColorPicker';

describe('ColorPicker', () => {
  it('should render color options', () => {
    const onColorSelect = vi.fn();
    render(<ColorPicker currentColor="#3b82f6" onColorSelect={onColorSelect} />);

    const colorButtons = screen.getAllByRole('button');
    expect(colorButtons.length).toBeGreaterThan(0);
  });

  it('should mark the current color as selected', () => {
    const onColorSelect = vi.fn();
    const currentColor = '#3b82f6';

    const { container } = render(
      <ColorPicker currentColor={currentColor} onColorSelect={onColorSelect} />
    );

    const selectedButton = container.querySelector('.color-option.selected');
    expect(selectedButton).toBeTruthy();
    expect(selectedButton?.className).toContain('selected');
  });

  it('should call onColorSelect when a color is clicked', async () => {
    const onColorSelect = vi.fn();
    const { container } = render(
      <ColorPicker currentColor="#3b82f6" onColorSelect={onColorSelect} />
    );

    const colorButtons = container.querySelectorAll('.color-option');
    const firstButton = colorButtons[0] as HTMLElement;
    firstButton.click();

    expect(onColorSelect).toHaveBeenCalledTimes(1);
  });
});
