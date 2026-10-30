import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Button from './Button';

describe('Button', () => {
  test('renders its title as an accessible button', async () => {
    await render(<Button title="Book caregiver" onPress={jest.fn()} />);

    expect(screen.getByText('Book caregiver')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Book caregiver' })).toBeTruthy();
  });

  test('calls onPress when enabled', async () => {
    const onPress = jest.fn();
    await render(<Button title="Book caregiver" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Book caregiver' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['disabled', { disabled: true }, false],
    ['loading', { loading: true }, true],
  ])('blocks presses while %s', async (_state, props, busy) => {
    const onPress = jest.fn();
    await render(<Button title="Book caregiver" onPress={onPress} {...props} />);

    const button = screen.getByRole('button', { name: 'Book caregiver' });
    expect(button.props.accessibilityState).toEqual({ disabled: true, busy });

    await fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
  });
});
