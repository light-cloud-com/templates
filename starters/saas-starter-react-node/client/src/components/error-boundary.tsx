import { Component, type ReactNode } from "react";
import { ErrorState } from "@/components/states";

/** Catches render errors and failed route downloads (e.g. after a redeploy) and offers a reload. */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null; key?: string }> {
  state: { error: Error | null; key?: string } = { error: null, key: this.props.resetKey };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  static getDerivedStateFromProps(props: { resetKey?: string }, state: { error: Error | null; key?: string }) {
    // Navigating elsewhere clears the error.
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null;
  }

  render() {
    if (this.state.error) {
      return <ErrorState title="This page failed to load" error={this.state.error} onRetry={() => window.location.reload()} className="my-8" />;
    }
    return this.props.children;
  }
}
