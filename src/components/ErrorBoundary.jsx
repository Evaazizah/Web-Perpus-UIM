import React from 'react';
import UimLogo from './UimLogo';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary tertangkap:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-800 font-sans">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center space-y-5">
            <div className="flex justify-center">
              <UimLogo className="w-16 h-16" />
            </div>

            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Terjadi Kendala Memuat Tampilan
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Portal Perpustakaan Universitas Islam Madura mengalami kendala saat menampilkan komponen. Silakan muat ulang halaman.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-slate-900 text-emerald-400 p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40 border border-slate-800">
                <p className="font-bold text-red-400">{String(this.state.error)}</p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] text-slate-400 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack.slice(0, 300)}...
                  </pre>
                )}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#047857] hover:bg-[#064e3b] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang Halaman</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
                title="Hapus cache sementara dan muat ulang"
              >
                Bersihkan Cache & Refresh
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

