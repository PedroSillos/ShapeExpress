import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Ops! Algo deu errado.</h1>
            <p className="text-white/60">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>
            {this.state.error && (
              <div className="bg-black/40 p-4 rounded-xl text-xs text-red-400 overflow-auto max-h-40 text-left">
                {(() => {
                  try {
                    const parsed = JSON.parse(this.state.error.message);
                    if (parsed && parsed.error) {
                      // Se for erro de permissão do Firestore
                      if (parsed.error.includes('permission-denied') || parsed.error.includes('Missing or insufficient permissions')) {
                        return 'Você não tem permissão para acessar ou modificar estes dados.';
                      }
                      return parsed.error;
                    }
                  } catch (e) {
                    // Not JSON
                  }
                  
                  const msg = this.state.error.message;
                  if (msg.includes('auth/')) {
                    return 'Ocorreu um erro de autenticação. Verifique seus dados.';
                  }
                  return msg;
                })()}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
            >
              Recarregar Aplicativo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
