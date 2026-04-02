import React, { Component, ComponentType, ReactNode } from 'react';
import { ErrorFallback, IErrorFallbackProps } from '@/components/ErrorFallback/ErrorFallback';

/**
 * Interface defining properties for the ErrorBoundary component.
 */
export interface IErrorBoundaryProps {
    FallbackComponent?: ComponentType<IErrorFallbackProps>;
    onError?: (error: Error, stackTrace: string) => void;
    children?: ReactNode;
}

/**
 * Type defining the state used by the ErrorBoundary.
 */
interface IErrorBoundaryState {
    error: Error | null;
}

/**
 * ErrorBoundary catches rendering errors in children components.
 * Must be a class component to use life-cycle methods like getDerivedStateFromError and componentDidCatch.
 */
export class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
    state: IErrorBoundaryState = { error: null };

    static defaultProps: Partial<IErrorBoundaryProps> = {
        FallbackComponent: ErrorFallback,
    };

    /**
     * Updates state to reflect that an error occurred.
     * @param error - The error caught.
     */
    static getDerivedStateFromError(error: Error): IErrorBoundaryState {
        return { error };
    }

    /**
     * Called when an error is caught in the child component tree.
     * @param error - The error object.
     * @param info - Object containing component stack info.
     */
    componentDidCatch(error: Error, info: { componentStack: string }): void {
        if (typeof this.props.onError === 'function') {
            this.props.onError(error, info.componentStack);
        }
    }

    /**
     * Resets the error state to allow retrying the component tree.
     */
    resetError = (): void => {
        this.setState({ error: null });
    };

    render() {
        const { FallbackComponent, children } = this.props;

        if (this.state.error && FallbackComponent) {
            return (
                <FallbackComponent
                    error={this.state.error}
                    resetError={this.resetError}
                />
            );
        }

        return children;
    }
}
