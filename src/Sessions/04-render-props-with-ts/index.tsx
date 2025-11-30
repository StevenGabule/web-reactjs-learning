
import type { CSSProperties, ReactNode } from 'react';
import React from 'react';

// Generic async data fetcher
type AsyncState<T> =
	{ status: 'idle' }
	| { status: 'loading' }
	| { status: 'success', data: T }
	| { status: 'error', error: Error };

type FetcherProps<T> = {
	url: string;
	children: (state: AsyncState<T>) => ReactNode
}

function Fetcher<T>({ url, children }: FetcherProps<T>) {
	const [state, setState] = React.useState<AsyncState<T>>({
		status: 'idle'
	});

	React.useEffect(() => {
		let cancelled = false;
		setState({ status: 'loading' });

		fetch(url)
			.then(res => res.json())
			.then((data: T) => {
				if (!cancelled) {
					setState({ status: 'success', data })
				}
			}).catch((error: Error) => {
				if (!cancelled) {
					setState({ status: 'error', error })
				}
			});

		return () => { cancelled = true; }
	}, [url])

	return (
		<>
			{children(state)}
		</>
	)
}

// Type inference flows through to the consumer
type User = {
	id: string;
	name: string;
	email: string;
}

<Fetcher<User> url="/api/users">
	{(state) => {
		switch (state.status) {
			case 'idle':
				return null
			case 'loading':
				return 'Loading...'
			case 'error':
				return 'Error'
			case 'success':
				return <UserCard user={state.data} />
			default:
				break;
		}
	}}
</Fetcher>

const UserCard = ({ user }: { user: User }) => {
	return JSON.stringify(user)
}


/**
 * Advanced: List Rendering with Generics
 * Build a type-safe virtualized list using generics:
 */
type VirtualListProps<T> = {
	items: T[];
	height: number;
	itemHeight: number;
	renderItem: (item: T, index: number, style: CSSProperties) => ReactNode;
	keyExtractor: (item: T) => string;
}

export function VirtualList<T>({
	items,
	height,
	itemHeight,
	renderItem,
	keyExtractor
}: VirtualListProps<T>) {
	const [scrollTop, setScrollTop] = React.useState(0)
	const containerRef = React.useRef<HTMLDivElement>(null);
	const startIndex = Math.floor(scrollTop / itemHeight);
	const endIndex = Math.min(startIndex + Math.ceil(height / itemHeight) + 1, items.length)
	const visibleItems = items.slice(startIndex, endIndex);

	return (
		<div
			ref={containerRef}
			style={{ height, overflow: 'auto' }}
			onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
		>
			<div style={{ height: items.length * itemHeight }}>
				{visibleItems.map((item, i) => {
					const actualIndex = startIndex + i;
					const style = {
						position: 'absolute' as const,
						top: actualIndex * itemHeight,
						height: itemHeight
					}
					return (
						<div key={keyExtractor(item)} style={style}>
							{renderItem(item, actualIndex, style)}
						</div>
					)
				})}
			</div>
		</div>
	)
}

type FormErrors<T> = Partial<Record<keyof T, string>>;

type FormRenderProps<T> = {
	values: T,
	errors: FormErrors<T>;
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleSubmit: (e: React.FormEvent) => void;
};

type FormProps<T> = {
	initialValues: T;
	children: (props: FormRenderProps<T>) => ReactNode;
	validate?: (values: T) => FormErrors<T>;
}

type LoginForm = { email: string; password: string };

function Form<T extends Record<string, unknown>>({
	initialValues,
	children,
	validate
}: FormProps<T>) {
	const [values, setValues] = React.useState<T>(initialValues)
	const [errors, setErrors] = React.useState<FormErrors<T>>({});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setValues(prev => ({ ...prev, [name]: value }))
	}

	const handleSubmit = () => {
		if (validate) {
			const validateErrors = validate(values);
			setErrors(validateErrors);
		}
	}

	// Render props: call children as a function!
	return <>{children({ values, errors, handleChange, handleSubmit })}</>
}

const validateLogin = (values: LoginForm): Partial<Record<keyof LoginForm, string>> => {
	const errors: Partial<Record<keyof LoginForm, string>> = {}
	if (!values.email) errors.email = 'Email is required';
	if (!values.password) errors.password = 'Password is required';

	return errors;
}

export const BuildForm = () => {
	return (
		<Form<LoginForm>
			initialValues={{ email: '', password: '' }}
			validate={validateLogin}
		>
			{({ values, errors, handleChange, handleSubmit }) => (
				<form onSubmit={handleSubmit}>
					<input
						name="email"
						value={values.email}  // Typed!
						onChange={handleChange}
					/>
					{errors.email && <span>{errors.email}</span>}
					<button type="submit">Submit</button>
				</form>
			)}
		</Form>
	)
}


