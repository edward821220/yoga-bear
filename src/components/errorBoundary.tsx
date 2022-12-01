import React, { Component, ErrorInfo, ReactNode } from "react";
import styled from "styled-components";

const Title = styled.h1`
  font-size: 24px;
  text-align: center;
`;
interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    const { hasError } = this.state;
    const { children } = this.props;
    if (hasError) {
      return <Title>Sorry.. there was an error</Title>;
    }

    return children;
  }
}

export default ErrorBoundary;