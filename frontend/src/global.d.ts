/**
 * Global TypeScript Declarations
 * For modules without type definitions
 */

// Declare React if @types/react is not found in Docker
declare module 'react' {
    export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prev: T) => T)) => void];
    export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
    export function useCallback<T extends (...args: never[]) => unknown>(callback: T, deps: unknown[]): T;
    export function useRef<T>(initialValue: T): { current: T };
    export function useMemo<T>(factory: () => T, deps: unknown[]): T;
    export function useContext<T>(context: React.Context<T>): T;
    export function useReducer<R extends React.Reducer<unknown, unknown>>(
        reducer: R,
        initialArg: React.ReducerState<R>
    ): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>];
    export function useLayoutEffect(effect: () => void | (() => void), deps?: unknown[]): void;
    export function createContext<T>(defaultValue: T): React.Context<T>;
    export function createElement(...args: unknown[]): React.ReactElement;
    export const Fragment: React.ComponentType;
    export const StrictMode: React.ComponentType;

    export type FC<P = object> = React.FunctionComponent<P>;
    export type ReactNode = React.ReactNode;
    export type ReactElement = React.ReactElement;
    export type ComponentType<P = object> = React.ComponentType<P>;
    export type Context<T> = React.Context<T>;
    export type Reducer<S, A> = React.Reducer<S, A>;
    export type Dispatch<A> = React.Dispatch<A>;
    export type ReducerState<R> = R extends React.Reducer<infer S, unknown> ? S : never;
    export type ReducerAction<R> = R extends React.Reducer<unknown, infer A> ? A : never;
    export type FunctionComponent<P = object> = (props: P) => ReactElement | null;

    namespace React {
        type ReactNode = string | number | boolean | null | undefined | ReactElement | ReactNode[];
        interface ReactElement<P = unknown> {
            type: string | ComponentType<P>;
            props: P;
            key: string | number | null;
        }
        interface Context<T> {
            Provider: ComponentType<{ value: T; children?: ReactNode }>;
            Consumer: ComponentType<{ children: (value: T) => ReactNode }>;
        }
        type ComponentType<P = object> = FunctionComponent<P> | ComponentClass<P>;
        type FunctionComponent<P = object> = (props: P) => ReactElement | null;
        interface ComponentClass<P = object> {
            new(props: P): Component<P>;
        }
        abstract class Component<P = object, S = object> {
            props: P;
            state: S;
            setState(state: Partial<S> | ((prevState: S) => Partial<S>)): void;
            render(): ReactNode;
        }
        type Reducer<S, A> = (state: S, action: A) => S;
        type Dispatch<A> = (action: A) => void;
    }

    export default React;
}

// Declare react-dom
declare module 'react-dom' {
    export function render(element: React.ReactElement, container: Element | null): void;
    export function createRoot(container: Element | null): { render(element: React.ReactElement): void };
}

declare module 'react-dom/client' {
    export function createRoot(container: Element | null): { render(element: React.ReactElement): void };
}

// Declare react-router-dom
declare module 'react-router-dom' {
    export function BrowserRouter(props: { children?: React.ReactNode }): React.ReactElement;
    export function Routes(props: { children?: React.ReactNode }): React.ReactElement;
    export function Route(props: { path?: string; element?: React.ReactElement; index?: boolean; children?: React.ReactNode }): React.ReactElement;
    export function Link(props: { to: string; children?: React.ReactNode; className?: string }): React.ReactElement;
    export function NavLink(props: { to: string; children?: React.ReactNode; className?: string | ((props: { isActive: boolean }) => string) }): React.ReactElement;
    export function Navigate(props: { to: string; replace?: boolean }): React.ReactElement;
    export function Outlet(): React.ReactElement;
    export function useNavigate(): (to: string, options?: { replace?: boolean }) => void;
    export function useLocation(): { pathname: string; search: string; hash: string };
    export function useParams<T extends Record<string, string>>(): T;
    export function useSearchParams(): [URLSearchParams, (params: URLSearchParams | Record<string, string>) => void];
}
