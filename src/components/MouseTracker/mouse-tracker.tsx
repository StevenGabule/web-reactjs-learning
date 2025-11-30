
import type { ReactNode } from 'react';
import React from 'react';

type MousePosition = { x: number, y: number };
type MouseTrackerProps = {
	children: (position: MousePosition) => ReactNode;
}

export const MouseTracker = ({ children }: MouseTrackerProps) => {
	const [position, setPosition] = React.useState<MousePosition>({ x: 0, y: 0, });

	React.useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setPosition({ x: e.clientX, y: e.clientY });
		}

		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove)
	}, [])

	return <>{children(position)}</>
}

const useMousePosition = (): MousePosition => {
	const [position, setPosition] = React.useState<MousePosition>({ x: 0, y: 0 });
	React.useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setPosition({ x: e.clientX, y: e.clientY });
		};

		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	}, []);

	return position;
}

export const Cursor = () => {
	const { x, y } = useMousePosition();
	return <div style={{ left: x, top: y }}>Cursor</div>
}