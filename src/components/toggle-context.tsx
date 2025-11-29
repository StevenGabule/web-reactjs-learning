import { createContext, useContext } from 'react';

type ToggleContextType = {
	on: boolean;
	toggle: () => void;
	count: number;
}

export const ToggleContext = createContext<ToggleContextType | null>(null);

// Custom Hook with runtime safety
export const useToggle = (): ToggleContextType => {
	const context = useContext(ToggleContext);
	if (context === null) {
		throw new Error(
			'Toggle compound components must be used with <Toggle>'
		)
	}

	return context;
}

