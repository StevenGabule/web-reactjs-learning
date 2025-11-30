/* eslint-disable @typescript-eslint/no-explicit-any */

import { Loader } from 'lucide-react';
import type { ReactNode } from 'react';
import React from 'react';

type FetcherProps<T> = {
	url: string;
	children: (state: {
		data: T | null;
		loading: boolean;
		error: Error | null;
	}) => ReactNode;
}

// Example 1: Data fetching with render props
function Fetcher<T>({ url, children }: FetcherProps<T>) {
	const [state, setState] = React.useState({
		data: null as T | null,
		loading: true,
		error: null as Error | null
	});

	React.useEffect(() => {
		fetch(url)
			.then(res => res.json())
			.then(data => setState({ data, loading: false, error: null }))
			.catch(error => setState({ data: null, loading: false, error }))
	}, [url])

	return <>{children(state)}</>
}

type User = {
	id: number;
	name: string;
}

const UserList = ({ data }: { data: any }) => {
	return JSON.stringify(data)
}

// Usage - consumer controls ALL rendering
<Fetcher<User[]> url={'/api/users'}>
	{({ data, loading, error }) => {
		if (loading) return <Loader />
		if (error) return 'Error parse';
		return <UserList data={data} />
	}}
</Fetcher>


// Example 2: Toggle Logic
type ToggleProps = {
	children: (state: {
		on: boolean;
		toggle: () => void;
		setOn: () => void;
		setOff: () => void;
	}) => ReactNode;
}

const Toggle = ({ children }: ToggleProps) => {
	const [on, setOn] = React.useState(false)

	return (
		<>
			{children({
				on,
				toggle: () => setOn(prev => prev),
				setOn: () => setOn(true),
				setOff: () => setOn(false),
			})}
		</>
	)
}

export const RealWorldExample = () => {
	return <>
		<Toggle>
			{({ on, toggle }) => (
				<button onClick={toggle}>
					{on ? '🌙' : '☀️'}
				</button>
			)}
		</Toggle>
		<Toggle>
			{({ on, toggle }) => (
				<div className={`modal ${on ? 'visible' : 'hidden'}`}>
					<button onClick={toggle}>Close</button>
				</div>
			)}
		</Toggle>
	</>
}