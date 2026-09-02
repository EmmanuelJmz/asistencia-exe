import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, KeyRound, CheckCircle2, School, Delete, X } from 'lucide-react';
import { dbService } from '../db/databaseService';

interface AuthPinScreenProps {
  onAuthenticated: () => void;
}

export const AuthPinScreen: React.FC<AuthPinScreenProps> = ({ onAuthenticated }) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockCountdown, setLockCountdown] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const security = dbService.getSecurityConfig();

  useEffect(() => {
    // Check if system is currently locked
    const now = Date.now();
    if (security.lockedUntilTimestamp > now) {
      const remainingSec = Math.ceil((security.lockedUntilTimestamp - now) / 1000);
      setLockCountdown(remainingSec);
    }
  }, [security.lockedUntilTimestamp]);

  useEffect(() => {
    if (lockCountdown > 0) {
      const timer = setTimeout(() => {
        setLockCountdown(lockCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lockCountdown]);

  const handleDigitClick = (digit: string) => {
    if (lockCountdown > 0 || isSuccess) return;
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMsg(null);
      if (newPin.length === 4) {
        verify(newPin);
      }
    }
  };

  const handleDeleteDigit = () => {
    if (lockCountdown > 0 || isSuccess) return;
    setPin(prev => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    if (lockCountdown > 0 || isSuccess) return;
    setPin('');
    setErrorMsg(null);
  };

  const verify = (inputPin: string) => {
    const res = dbService.verifyPin(inputPin);
    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        onAuthenticated();
      }, 400);
    } else {
      setErrorMsg(res.message);
      setPin('');
      if (res.isLocked) {
        setLockCountdown(60);
      }
    }
  };

  const handleDemoBypass = () => {
    setPin('1234');
    verify('1234');
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center justify-center p-4 selection:bg-blue-700 selection:text-white">
      {/* Classic Desktop Dialog Window */}
      <div className="w-full max-w-sm bg-white border border-slate-400 rounded shadow-xl overflow-hidden">
        
        {/* Windows Dialog Titlebar */}
        <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-1.5 font-semibold">
            <Lock className="w-3.5 h-3.5 text-blue-300" />
            <span>Seguridad del Sistema - EduGestión</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span>[PIN: 4 dígitos]</span>
          </div>
        </div>

        {/* Dialog Content */}
        <div className="p-6 bg-slate-50 space-y-5 border-b border-slate-200">
          
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
            <div className="w-12 h-12 rounded bg-blue-700 flex items-center justify-center text-white shrink-0 shadow-xs">
              <School className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                Control Escolar y Asistencias
              </h1>
              <p className="text-xs text-slate-600">
                Ingrese su PIN para desbloquear el sistema
              </p>
            </div>
          </div>

          {/* PIN Input Display */}
          <div className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-3 py-2 bg-white rounded border border-slate-300 shadow-inner">
              {[0, 1, 2, 3].map(idx => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    isSuccess
                      ? 'bg-emerald-600 border-emerald-700'
                      : pin.length > idx
                      ? 'bg-blue-800 border-blue-900'
                      : 'bg-slate-100 border-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-slate-500 block">
              PIN por defecto: <strong className="text-blue-700 font-mono">1234</strong>
            </span>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded bg-red-50 border border-red-300 text-red-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {lockCountdown > 0 && (
            <div className="p-2 rounded bg-amber-50 border border-amber-300 text-amber-800 text-xs text-center font-mono">
              Sistema bloqueado temporalmente. Espere {lockCountdown}s
            </div>
          )}

          {isSuccess && (
            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>PIN verificado. Accediendo al sistema...</span>
            </div>
          )}

          {/* Tactile Classic Keypad */}
          <div className="grid grid-cols-3 gap-2 w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                onClick={() => handleDigitClick(num)}
                disabled={lockCountdown > 0 || isSuccess}
                className="h-11 rounded bg-white hover:bg-slate-100 active:bg-blue-50 border border-slate-300 text-slate-800 font-bold text-base transition-colors shadow-xs disabled:opacity-40"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              disabled={lockCountdown > 0 || isSuccess}
              className="h-11 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 font-semibold text-xs transition-colors disabled:opacity-40"
            >
              Borrar
            </button>
            <button
              onClick={() => handleDigitClick('0')}
              disabled={lockCountdown > 0 || isSuccess}
              className="h-11 rounded bg-white hover:bg-slate-100 active:bg-blue-50 border border-slate-300 text-slate-800 font-bold text-base transition-colors shadow-xs disabled:opacity-40"
            >
              0
            </button>
            <button
              onClick={handleDeleteDigit}
              disabled={lockCountdown > 0 || isSuccess}
              className="h-11 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40"
              title="Retroceso"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dialog Footer Actions */}
        <div className="bg-slate-100 px-4 py-3 flex items-center justify-between text-xs">
          <button
            onClick={handleDemoBypass}
            className="text-blue-700 hover:underline font-medium text-xs"
          >
            Usar PIN Demo (1234)
          </button>
          <span className="text-[11px] text-slate-500">
            SQLite v3 Local • Offline
          </span>
        </div>

      </div>
    </div>
  );
};
