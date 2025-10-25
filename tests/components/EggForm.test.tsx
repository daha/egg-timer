import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EggForm } from '../../src/components/EggForm';
import { Egg } from '../../src/types';

describe('EggForm', () => {
  it('renders all form fields', () => {
    const mockOnAddEgg = vi.fn();
    render(<EggForm onAddEgg={mockOnAddEgg} disabled={false} />);

    expect(screen.getByLabelText(/weight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/doneness/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add egg/i })
    ).toBeInTheDocument();
  });

  it('has default values: 50g, medium, refrigerated', () => {
    const mockOnAddEgg = vi.fn();
    render(<EggForm onAddEgg={mockOnAddEgg} disabled={false} />);

    const weightInput = screen.getByLabelText(/weight/i) as HTMLInputElement;
    const donenessSelect = screen.getByLabelText(
      /doneness/i
    ) as HTMLSelectElement;
    const temperatureSelect = screen.getByLabelText(
      /temperature/i
    ) as HTMLSelectElement;

    expect(weightInput.value).toBe('50');
    expect(donenessSelect.value).toBe('medium');
    expect(temperatureSelect.value).toBe('refrigerated');
  });

  it('adds egg with correct properties on form submit', async () => {
    const user = userEvent.setup();
    const mockOnAddEgg = vi.fn();
    render(<EggForm onAddEgg={mockOnAddEgg} disabled={false} />);

    const weightInput = screen.getByLabelText(/weight/i);
    const submitButton = screen.getByRole('button', { name: /add egg/i });

    // Change weight to 60
    await user.clear(weightInput);
    await user.type(weightInput, '60');

    // Submit form
    await user.click(submitButton);

    // Check that onAddEgg was called
    expect(mockOnAddEgg).toHaveBeenCalledTimes(1);

    // Check the egg properties (except id which is random)
    const addedEgg: Egg = mockOnAddEgg.mock.calls[0][0];
    expect(addedEgg.weight).toBe(60);
    expect(addedEgg.doneness).toBe('medium');
    expect(addedEgg.temperature).toBe('refrigerated');
    expect(addedEgg.id).toBeTruthy(); // Should have an ID
  });

  it('changes doneness and temperature correctly', async () => {
    const user = userEvent.setup();
    const mockOnAddEgg = vi.fn();
    render(<EggForm onAddEgg={mockOnAddEgg} disabled={false} />);

    const donenessSelect = screen.getByLabelText(/doneness/i);
    const temperatureSelect = screen.getByLabelText(/temperature/i);
    const submitButton = screen.getByRole('button', { name: /add egg/i });

    // Change to soft and room temperature
    await user.selectOptions(donenessSelect, 'soft');
    await user.selectOptions(temperatureSelect, 'room');

    // Submit form
    await user.click(submitButton);

    // Check the egg properties
    const addedEgg: Egg = mockOnAddEgg.mock.calls[0][0];
    expect(addedEgg.doneness).toBe('soft');
    expect(addedEgg.temperature).toBe('room');
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    const mockOnAddEgg = vi.fn();
    render(<EggForm onAddEgg={mockOnAddEgg} disabled={false} />);

    const weightInput = screen.getByLabelText(/weight/i) as HTMLInputElement;
    const donenessSelect = screen.getByLabelText(
      /doneness/i
    ) as HTMLSelectElement;
    const temperatureSelect = screen.getByLabelText(
      /temperature/i
    ) as HTMLSelectElement;
    const submitButton = screen.getByRole('button', { name: /add egg/i });

    // Change values
    await user.clear(weightInput);
    await user.type(weightInput, '75');
    await user.selectOptions(donenessSelect, 'hard');
    await user.selectOptions(temperatureSelect, 'room');

    // Submit
    await user.click(submitButton);

    // Check form reset to defaults
    expect(weightInput.value).toBe('50');
    expect(donenessSelect.value).toBe('medium');
    expect(temperatureSelect.value).toBe('refrigerated');
  });

  it('validates weight minimum (20g)', async () => {
    const user = userEvent.setup();
    const mockOnAddEgg = vi.fn();
    render(<EggForm onAddEgg={mockOnAddEgg} disabled={false} />);

    const weightInput = screen.getByLabelText(/weight/i);
    const submitButton = screen.getByRole('button', { name: /add egg/i });

    // Try to add egg with weight < 20
    await user.clear(weightInput);
    await user.type(weightInput, '15');
    await user.click(submitButton);

    // Should show error
    expect(
      screen.getByText(/weight must be between 20 and 100 grams/i)
    ).toBeInTheDocument();

    // Should NOT call onAddEgg
    expect(mockOnAddEgg).not.toHaveBeenCalled();
  });

  it('validates weight maximum (100g)', async () => {
    const user = userEvent.setup();
    const mockOnAddEgg = vi.fn();
    render(<EggForm onAddEgg={mockOnAddEgg} disabled={false} />);

    const weightInput = screen.getByLabelText(/weight/i);
    const submitButton = screen.getByRole('button', { name: /add egg/i });

    // Try to add egg with weight > 100
    await user.clear(weightInput);
    await user.type(weightInput, '150');
    await user.click(submitButton);

    // Should show error
    expect(
      screen.getByText(/weight must be between 20 and 100 grams/i)
    ).toBeInTheDocument();

    // Should NOT call onAddEgg
    expect(mockOnAddEgg).not.toHaveBeenCalled();
  });

  it('validates non-numeric weight', async () => {
    const user = userEvent.setup();
    const mockOnAddEgg = vi.fn();
    render(<EggForm onAddEgg={mockOnAddEgg} disabled={false} />);

    const weightInput = screen.getByLabelText(/weight/i);
    const submitButton = screen.getByRole('button', { name: /add egg/i });

    // Try to add egg with invalid weight
    await user.clear(weightInput);
    await user.type(weightInput, 'abc');
    await user.click(submitButton);

    // Should show error
    expect(
      screen.getByText(/please enter a valid weight/i)
    ).toBeInTheDocument();

    // Should NOT call onAddEgg
    expect(mockOnAddEgg).not.toHaveBeenCalled();
  });

  it('disables all inputs when disabled prop is true', () => {
    const mockOnAddEgg = vi.fn();
    render(<EggForm onAddEgg={mockOnAddEgg} disabled={true} />);

    const weightInput = screen.getByLabelText(/weight/i) as HTMLInputElement;
    const donenessSelect = screen.getByLabelText(
      /doneness/i
    ) as HTMLSelectElement;
    const temperatureSelect = screen.getByLabelText(
      /temperature/i
    ) as HTMLSelectElement;
    const submitButton = screen.getByRole('button', {
      name: /add egg/i,
    }) as HTMLButtonElement;

    expect(weightInput.disabled).toBe(true);
    expect(donenessSelect.disabled).toBe(true);
    expect(temperatureSelect.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
  });

  it('shows disabled message when form is disabled', () => {
    const mockOnAddEgg = vi.fn();
    render(<EggForm onAddEgg={mockOnAddEgg} disabled={true} />);

    expect(
      screen.getByText(/cannot add eggs while timer is running/i)
    ).toBeInTheDocument();
  });

  it('does not show disabled message when form is enabled', () => {
    const mockOnAddEgg = vi.fn();
    render(<EggForm onAddEgg={mockOnAddEgg} disabled={false} />);

    expect(
      screen.queryByText(/cannot add eggs while timer is running/i)
    ).not.toBeInTheDocument();
  });

  it('accepts valid weight at boundaries: 20g and 100g', async () => {
    const user = userEvent.setup();
    const mockOnAddEgg = vi.fn();
    const { unmount } = render(
      <EggForm onAddEgg={mockOnAddEgg} disabled={false} />
    );

    // Test minimum boundary (20g)
    const weightInput = screen.getByLabelText(/weight/i);
    const submitButton = screen.getByRole('button', { name: /add egg/i });

    await user.clear(weightInput);
    await user.type(weightInput, '20');
    await user.click(submitButton);

    expect(mockOnAddEgg).toHaveBeenCalledTimes(1);
    expect(mockOnAddEgg.mock.calls[0][0].weight).toBe(20);

    unmount();

    // Test maximum boundary (100g)
    mockOnAddEgg.mockClear();
    render(<EggForm onAddEgg={mockOnAddEgg} disabled={false} />);

    const weightInput2 = screen.getByLabelText(/weight/i);
    const submitButton2 = screen.getByRole('button', { name: /add egg/i });

    await user.clear(weightInput2);
    await user.type(weightInput2, '100');
    await user.click(submitButton2);

    expect(mockOnAddEgg).toHaveBeenCalledTimes(1);
    expect(mockOnAddEgg.mock.calls[0][0].weight).toBe(100);
  });

  it('generates unique IDs for each egg', async () => {
    const user = userEvent.setup();
    const mockOnAddEgg = vi.fn();
    render(<EggForm onAddEgg={mockOnAddEgg} disabled={false} />);

    const submitButton = screen.getByRole('button', { name: /add egg/i });

    // Add first egg
    await user.click(submitButton);
    const firstEgg: Egg = mockOnAddEgg.mock.calls[0][0];

    // Add second egg
    await user.click(submitButton);
    const secondEgg: Egg = mockOnAddEgg.mock.calls[1][0];

    // IDs should be different
    expect(firstEgg.id).not.toBe(secondEgg.id);
    expect(firstEgg.id).toBeTruthy();
    expect(secondEgg.id).toBeTruthy();
  });
});
