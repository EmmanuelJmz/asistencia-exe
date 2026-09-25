import React, { useState } from 'react';
import { Lock, User, ShieldCheck, Loader2 } from 'lucide-react';
import { dbService } from '../db/databaseService';

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    setIsLoading(true);
    try {
      await dbService.login(username, password, rememberMe);
      // App.tsx auth listener will automatically handle the redirect
    } catch (err: any) {
      setError('Usuario o contraseña incorrectos.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen min-h-screen bg-slate-50 dark:bg-[#121212] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#FF441F] rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      <div className="bg-white/80 dark:bg-[#1E1E1E]/90 backdrop-blur-xl border border-white/50 dark:border-[#333333] rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(255,68,31,0.15)] p-8 w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-orange-100 rounded-2xl mb-4 border border-orange-200">
            <ShieldCheck className="w-10 h-10 text-[#FF441F]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Acceso Seguro</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-slate-700 dark:text-gray-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">
              Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej: director"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#404040] rounded-xl text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF441F] focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-gray-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500 dark:text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#404040] rounded-xl text-slate-800 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF441F] focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 rounded border-slate-300 text-[#FF441F] focus:ring-[#FF441F]"
            />
            <span>Recordarme en este equipo</span>
          </label>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rappi-btn-primary disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
