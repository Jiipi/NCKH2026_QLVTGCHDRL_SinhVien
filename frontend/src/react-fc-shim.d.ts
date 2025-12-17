// React 19 type compatibility shim
// This augments the React namespace to include FC which was removed in React 19 types
import { FC as FunctionComponent, PropsWithChildren } from 'react';

declare global {
    namespace React {
        // Re-export FC as an alias for React.FC to maintain backward compatibility
        export type FC<P = {}> = FunctionComponent<P>;
    }
}

export { };
