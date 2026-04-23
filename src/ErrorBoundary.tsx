import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
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
      let errorMessage = "Ocorreu um erro inesperado.";
      let isPermissionError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error?.includes('Missing or insufficient permissions')) {
            isPermissionError = true;
            errorMessage = "Você não tem permissão para acessar ou modificar estes dados. Por favor, verifique as regras de segurança do Firestore no console do Firebase.";
          }
        }
      } catch (e) {
        // Not a JSON error
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4 font-sans">
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h1 className="text-xl font-bold">Ops! Algo deu errado.</h1>
            <p className="text-white/60 text-sm">
              {errorMessage}
            </p>
            {isPermissionError && (
              <div className="text-left bg-black/50 p-4 rounded-xl mt-4 text-xs text-white/80 font-mono overflow-auto">
                Lembre-se de atualizar o arquivo firestore.rules no console do Firebase para permitir o acesso à coleção necessária.
              </div>
            )}
            <button
              className="w-full py-3 bg-brand-red text-black font-bold uppercase tracking-widest rounded-xl hover:scale-105 transition-transform mt-6"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
