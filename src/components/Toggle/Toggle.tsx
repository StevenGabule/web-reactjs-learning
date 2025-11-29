import type { ReactNode } from 'react'
import React from 'react';
import { ToggleContext, useToggle as UseToggle } from './toggle-context';

type ToggleProps = {
	children: ReactNode;
	defaultOn?: boolean;
	onToggle?: (on: boolean) => void;
	value?: boolean;
	onChange?: (on: boolean) => void;
}

export const Toggle = ({
	children,
	defaultOn = false,
	onToggle,
	value,
	onChange
}: ToggleProps) => {
	const [on, setOn] = React.useState(defaultOn)
	const [count, setCount] = React.useState(0)

	// determine if controlled mode
	const isControlled = value !== undefined;

	// use value prop if controlled otherwise internal state
	const currentOn = isControlled ? value : on;

	const toggle = () => {
		const newValue = !currentOn;

		if (isControlled) {
			onChange?.(newValue)
		} else {
			setOn(newValue)
		}
		onToggle?.(newValue);
		setCount(count + 1);
	}

	return (
		<ToggleContext.Provider value={{ on: currentOn, toggle, count }}>
			{children}
		</ToggleContext.Provider>
	)
}

Toggle.Button = ({ children }: { children?: ReactNode }) => {
	const { on, toggle } = UseToggle()
	return (
		<button
			onClick={toggle}
			aria-pressed={on}
			className={`toggle-btn ${on ? 'active' : ''}`}
		>
			{children ?? (on ? 'On' : 'OFF')}
		</button>
	)
}

Toggle.On = ({ children }: { children: ReactNode }) => {
	const { on } = UseToggle()
	return on ? <>{children}</> : null;
}

Toggle.Off = ({ children }: { children: ReactNode }) => {
	const { on } = UseToggle()
	return on ? null : <>{children}</>;
}

Toggle.Status = () => {
	const { on } = UseToggle()
	return on ? 'ON' : 'OFF';
}

Toggle.Count = () => UseToggle().count;