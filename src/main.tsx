import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import App from './App.tsx'
import { LoadingScreen } from './components/LoadingScreen'
import './index.css'
import React from 'react';

// Wrap the app with a loading screen
function AppWithLoading() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking resources and loading necessary data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Show loading screen for 1.5 seconds to ensure resources are loaded

    return () => clearTimeout(timer);
  }, []);

  return isLoading ? <LoadingScreen /> : <App />;
}

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error(error, info); }
  render() {
    if (this.state.hasError) return <h1>Something went wrong.</h1>;
    return this.props.children;
  }
}

// In main.tsx
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AppWithLoading />
  </ErrorBoundary>
);
