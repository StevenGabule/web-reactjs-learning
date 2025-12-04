// __tests__/withEventTracking.test.tsx
import { render, fireEvent, screen } from '@testing-library/react';
import { withEventTracking } from '../hocs/withEventTracking';
import { analytics } from '../services/analytics';

// Mock analytics service
jest.mock('../services/analytics', () => ({
	analytics: {
		trackEvent: jest.fn(),
	},
}));

describe('withEventTracking', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('tracks events when handlers are called', () => {
		const mockOnClick = jest.fn();

		interface TestProps {
			onClick: () => void;
			itemId: string;
		}

		function TestComponent({ onClick, itemId }: TestProps) {
			return <button onClick={onClick}>Click {itemId}</button>;
		}

		const TrackedComponent = withEventTracking(TestComponent, {
			onClick: {
				eventName: 'button_clicked',
				getPropsProperties: (props: TestProps) => ({
					itemId: props.itemId,
				}),
			},
		});

		render(<TrackedComponent onClick={mockOnClick} itemId="123" />);

		fireEvent.click(screen.getByText('Click 123'));

		expect(analytics.trackEvent).toHaveBeenCalledWith({
			name: 'button_clicked',
			properties: { itemId: '123' },
		});

		expect(mockOnClick).toHaveBeenCalled();
	});

	it('respects shouldTrack condition', () => {
		const mockOnClick = jest.fn();

		interface TestProps {
			onClick: (value: number) => void;
		}

		function TestComponent({ onClick }: TestProps) {
			return <button onClick={() => onClick(5)}>Click</button>;
		}

		const TrackedComponent = withEventTracking(TestComponent, {
			onClick: {
				eventName: 'button_clicked',
				shouldTrack: (value: number) => value > 10, // Only track if > 10
			},
		});

		render(<TrackedComponent onClick={mockOnClick} />);

		fireEvent.click(screen.getByText('Click'));

		// Should NOT track because value (5) is not > 10
		expect(analytics.trackEvent).not.toHaveBeenCalled();
		expect(mockOnClick).toHaveBeenCalledWith(5);
	});
});