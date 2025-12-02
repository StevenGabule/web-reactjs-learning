/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable react-refresh/only-export-components */
import type { ComponentType, ReactNode } from 'react';
import React, { Component } from 'react';

// Basic HOC structure
export function withEnhancements<P extends object>(WrappedComponent: ComponentType<P>) {
	return function Enhancement(props: P) {
		return <WrappedComponent {...props} />
	}
}

type User = {
	id: number;
	name: string;
	email: string
}

type AuthProps = {
	isAuthenticated: boolean;
	user: User | null
}

const useAuth = () => {
	return {
		isLoading: false,
		user: null,
		isAuthenticated: false
	}
}

export function withAuth<P extends object>(WrapperComponent: ComponentType<P & AuthProps>) {
	return function AuthenticateComponent(props: Omit<P, keyof AuthProps>) {
		const { isLoading, user, isAuthenticated } = useAuth();

		if (isLoading) {
			return 'Loading..'
		}

		if (!isAuthenticated) {
			return 'Display Login Component'
		}

		return <WrapperComponent {...(props as P)} user={user} isAuthenticated={isAuthenticated} />
	}
}

type DashboardProps = {
	id: number;
	page: number;
}

function Dashboard({ user }: AuthProps & DashboardProps) {
	return <h1>Welcome! {user?.name}</h1>
}

withAuth(Dashboard);


// Practical Examples & Use Cases

// 1. withLoading - Data Fetching States
// One of the most common patterns: handling loading states consistently across your app.
interface WithLoadingProps {
	isLoading: boolean;
}

function withLoading<P extends object>(
	WrapperComponent: ComponentType<P>,
	LoadingComponent: ComponentType = () => <div>Loading...</div>
) {
	return function WithLoadingComponent(
		props: P & WithLoadingProps
	) {
		const { isLoading, ...restProps } = props;
		if (isLoading) {
			return <LoadingComponent />
		}

		return <WrapperComponent {...(restProps as P)} />
	}
}

// Usage
interface UserListProps {
	users: User[];
}

function UserList({ users }: UserListProps) {
	return (
		<ul>
			{users.map(user => (
				<li key={user.id}>{user.name}</li>
			))}
		</ul>
	)
}


const UserListWithLoading = withLoading(UserList);

export function TestApp() {
	const [users, setUsers] = React.useState<User[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		// @ts-expect-error error
		fetchUsers().then(data => {
			setUsers(data);
			setIsLoading(false)
			// @ts-expect-error error
		}).catch(err => {
			console.log(err)
			setIsLoading(false)
		})
	}, []);

	return <UserListWithLoading users={users} isLoading={isLoading} />
}

// 2. withErrorBoundary - Error Handling
// Wrap components with error catching capability:
interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

interface FallbackProps {
	error: Error | null;
	resetError: () => void;
}

export function withErrorBoundary<P extends object>(
	WrappedComponent: ComponentType<P>,
	FallbackComponent: ComponentType<FallbackProps>
) {
	return class ErrorBoundaryWrapper extends Component<P, ErrorBoundaryState> {
		static displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'
			})`;

		state: ErrorBoundaryState = {
			hasError: false,
			error: null
		};

		static getDerivedStateFromError(error: Error): ErrorBoundaryState {
			return { hasError: true, error }
		}

		componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
			// Log to error reporting service
			console.error('Component error:', error, errorInfo);
		}

		resetError = () => {
			this.setState({ hasError: false, error: null })
		}

		render() {
			if (this.state.hasError) {
				return <FallbackComponent
					error={this.state.error}
					resetError={this.resetError}
				/>
			}

			return <WrappedComponent {...this.props} />
		}
	}
}

function ErrorFallback({ error, resetError }: FallbackProps) {
	return (
		<div className="error-container">
			<h2>Something went wrong!</h2>
			<p>{error?.message}</p>
			<button onClick={resetError}>Try again!</button>
		</div>
	)
}

function RiskyComponent({ data }: { data: any }) {
	// This might throw an error
	return <div>{data.nested.value}</div>
}


export const SafeRiskyComponent = withErrorBoundary(RiskyComponent, ErrorFallback);

// 3. withLogger - Development & Debugging
// Track component lifecycle and prop changes:
interface LoggerOptions {
	logProps?: boolean;
	logRenders?: boolean;
	logMounts?: boolean;
}

function withLogger<P extends object>(
	WrappedComponent: ComponentType<P>,
	options: LoggerOptions = {}
) {
	const { logProps = true, logRenders = true, logMounts = true } = options;
	const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
	return function LoggerComponent(props: P) {
		const renderCount = React.useRef(0);
		const prevProps = React.useRef<P>(null);

		React.useEffect(() => {
			if (logMounts) {
				console.log(`[${componentName}] Mounted`);
			}

			return () => {
				if (logMounts) {
					console.log(`[${componentName}] Unmounted`)
				}
			}
		}, [])

		React.useEffect(() => {
			if (logProps && prevProps.current) {
				const changes = getChangedProps(prevProps.current, props);
				if (Object.keys(changes).length > 0) {
					console.log(`[${componentName}] Props changed: ${changes}`);
				}
			}
			prevProps.current = props;
		});

		if (logRenders) {
			renderCount.current += 1;
			console.log(`[${componentName}] Render #${renderCount.current}`)
		}

		return <WrappedComponent {...props} />
	}
};

function getChangedProps<P extends object>(prev: P, current: P): Partial<P> {
	const changes: Partial<P> = {};

	Object.keys(current).forEach((key) => {
		if (prev[key as keyof P] !== current[key as keyof P]) {
			changes[key as keyof P] = current[key as keyof P];
		}
	})

	return changes;
}

function UserCardBase() {
	return (
		<h1>User Card Info</h1>
	)
}

// Usage (only in development)
export const UserCard = import.meta.env.NODE_ENV === 'development'
	? withLogger(UserCardBase, { logRenders: true, logProps: true }) : UserCardBase;


// 4. withPermissions - Role-Based Access Control - Control what users can see based on their permissions:
const useCurrentUser = () => {
	return {
		permissions: ['read', 'write']
	}
}

type Permission = 'read' | 'write' | 'delete' | 'admin';

interface WithPermissionsConfig {
	requiredPermissions: Permission[];
	fallback?: ReactNode;
	requireAll?: boolean;
}

function withPermission<P extends object>(
	WrappedComponent: ComponentType<P>,
	config: WithPermissionsConfig
) {
	const {
		requiredPermissions,
		fallback = null,
		requireAll = true
	} = config;

	return function PermissionGatedComponent(props: P) {
		const { permissions } = useCurrentUser();

		const hasPermission = requireAll
			? requiredPermissions.every(p => permissions.includes(p))
			: requiredPermissions.some(p => permissions.includes(p));

		if (!hasPermission) {
			return <>{fallback}</>
		}

		return <WrappedComponent {...props} />
	}
}

// Usage
function DeleteButton({ onDelete }: { onDelete: () => void }) {
	return (
		<button onClick={onDelete} className='danger'>
			Delete
		</button>
	)
}

const AdminDeleteButton = withPermission(DeleteButton, {
	requiredPermissions: ['delete', 'admin'],
	requireAll: false, // Either permission works
	fallback: <span>No permission to delete</span>
});

export function UserRow({ user }: { user: User }) {

	const deleteUser = (id: number) => {
		console.error(id);
	}

	return (
		<tr>
			<td>{user.name}</td>
			<td>{user.email}</td>
			<td>
				<AdminDeleteButton onDelete={() => deleteUser(user.id)} />
			</td>
		</tr>
	)
}

// 5. withTheme - Theme Injection - Inject theme context into components (pre-hooks pattern):

// @ts-expect-error error
import { ThemeContext, Theme } from './ThemeContext';

interface WithThemeProps {
	theme: Theme;
	toggleTheme: () => void;
}

function withTheme<P extends WithThemeProps>(WrappedComponent: ComponentType<P>) {
	return function ThemeComponent(
		props: Omit<P, keyof WithThemeProps>
	) {
		return (
			<ThemeContext.Consumer>
				{(themeContext: any) => (
					<WrappedComponent
						{...(props as P)}
						theme={themeContext.theme}
						toggleTheme={themeContext.toggleTheme}
					/>
				)}
			</ThemeContext.Consumer>
		)
	}
}

// Usage
interface CardProps extends WithThemeProps {
	title: string;
	children: ReactNode;
}

function Card({ title, children, theme }: CardProps) {
	return (
		<div style={{
			background: theme.colors.cardBackground,
			color: theme.colors.text,
			padding: theme.spacing.medium
		}}>
			<h3>{title}</h3>
			{children}
		</div>
	)
}

export const ThemeCard = withTheme(Card);


// Composing Multiple HOCs
// You can stack HOCs together:
function composeHOCs<P extends object>(...hocs: Array<(component: ComponentType<any>) => ComponentType<any>>) {
	return (BaseComponent: ComponentType<P>) => {
		return hocs.reduceRight(
			(acc, hoc) => hoc(acc),
			BaseComponent
		)
	}
}

const enhance = composeHOCs(
	withAuth,
	withTheme,
	// @ts-expect-error ignore
	withErrorBoundary
)

// @ts-expect-error ignore
export const SuperComponent = enhance(BaseComponent);

interface AnalyticsConfig {
	screenName: string;
	trackProps?: string[]
}

interface AnalyticsConfig {
	screenName: string;
	trackProps?: string[];
}

function withAnalytics<P extends object>(
	WrappedComponent: ComponentType<P>,
	config: AnalyticsConfig
) {
	return function AnalyticsComponent(props: P) {
		const { screenName, trackProps = [] } = config;

		React.useEffect(() => {
			// Track screen view
			// @ts-expect-error error
			analytics.trackScreen(screenName);
		}, []);

		React.useEffect(() => {
			// Track specific prop changes
			const trackedData = trackProps.reduce((acc, propName) => {
				if (propName in props) {
					acc[propName] = props[propName as keyof P];
				}
				return acc;
			}, {} as Record<string, unknown>);

			if (Object.keys(trackedData).length > 0) {
				// @ts-expect-error error
				analytics.trackEvent('prop_change', {
					screen: screenName,
					...trackedData,
				});
			}
		}, trackProps.map(p => props[p as keyof P]));

		return <WrappedComponent {...props} />;
	};
}

// Usage
// @ts-expect-error error
const TrackedCheckout = withAnalytics(CheckoutPage, {
	screenName: 'Checkout',
	trackProps: ['cartTotal', 'itemCount'],
});