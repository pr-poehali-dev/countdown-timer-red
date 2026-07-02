import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';

const pad = (n: number) => String(n).padStart(2, '0');

const Index = () => {
  const [title, setTitle] = useState('Обратный отсчёт');
  const [totalMs, setTotalMs] = useState(25 * 60 * 1000);
  const [remaining, setRemaining] = useState(25 * 60 * 1000);
  const [running, setRunning] = useState(false);
  const [editing, setEditing] = useState(false);

  const [draftTitle, setDraftTitle] = useState(title);
  const [d, setD] = useState('0');
  const [h, setH] = useState('0');
  const [m, setM] = useState('25');
  const [s, setS] = useState('0');

  const endRef = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    endRef.current = Date.now() + remaining;
    const id = setInterval(() => {
      const left = endRef.current - Date.now();
      if (left <= 0) {
        setRemaining(0);
        setRunning(false);
        clearInterval(id);
      } else {
        setRemaining(left);
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const finished = remaining <= 0;

  const start = () => { if (remaining > 0) setRunning(true); };
  const pause = () => setRunning(false);
  const stop = () => { setRunning(false); setRemaining(totalMs); };
  const reset = () => { setRunning(false); setRemaining(totalMs); };

  const openEdit = useCallback(() => {
    setRunning(false);
    setDraftTitle(title);
    setD(String(days));
    setH(String(hours));
    setM(String(mins));
    setS(String(secs));
    setEditing(true);
  }, [title, days, hours, mins, secs]);

  const applyEdit = () => {
    const ms =
      (parseInt(d) || 0) * 86400000 +
      (parseInt(h) || 0) * 3600000 +
      (parseInt(m) || 0) * 60000 +
      (parseInt(s) || 0) * 1000;
    const safe = Math.max(ms, 0);
    setTitle(draftTitle.trim() || 'Обратный отсчёт');
    setTotalMs(safe);
    setRemaining(safe);
    setEditing(false);
  };

  const progress = totalMs > 0 ? (remaining / totalMs) * 100 : 0;

  const Segment = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <span
        className={`font-display font-600 leading-none tabular-nums text-[hsl(0_85%_58%)] text-6xl sm:text-8xl md:text-9xl ${
          finished ? '' : running ? 'animate-pulse-glow' : ''
        }`}
        style={{ textShadow: '0 0 18px hsl(0 90% 50% / 0.55), 0 0 46px hsl(0 90% 45% / 0.35)' }}
      >
        {pad(value)}
      </span>
      <span className="mt-2 text-[0.65rem] sm:text-xs uppercase tracking-[0.35em] text-zinc-500 font-body">
        {label}
      </span>
    </div>
  );

  const Colon = () => (
    <span
      className="font-display text-5xl sm:text-7xl md:text-8xl text-[hsl(0_60%_40%)] leading-none self-start mt-1 sm:mt-2"
      style={{ textShadow: '0 0 14px hsl(0 90% 50% / 0.4)' }}
    >
      :
    </span>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 45%, hsl(0 80% 30% / 0.25), transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center animate-fade-in">
        <div className="mb-8 sm:mb-12 text-center">
          <div className="flex items-center justify-center gap-2 text-zinc-500 mb-3">
            <span className={`h-2 w-2 rounded-full ${running ? 'bg-red-500 animate-pulse-glow' : 'bg-zinc-600'}`} />
            <span className="text-xs uppercase tracking-[0.4em] font-body">
              {finished ? 'Время вышло' : running ? 'Идёт отсчёт' : 'Пауза'}
            </span>
          </div>
          <h1 className="font-display font-500 text-2xl sm:text-4xl uppercase tracking-wide text-zinc-100">
            {title}
          </h1>
        </div>

        <div className="flex items-start justify-center gap-2 sm:gap-4 select-none">
          <Segment value={days} label="дни" />
          <Colon />
          <Segment value={hours} label="часы" />
          <Colon />
          <Segment value={mins} label="мин" />
          <Colon />
          <Segment value={secs} label="сек" />
        </div>

        <div className="mt-10 sm:mt-14 w-full max-w-md h-[3px] bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[hsl(0_85%_55%)] transition-all duration-200 ease-linear"
            style={{ width: `${progress}%`, boxShadow: '0 0 12px hsl(0 90% 50% / 0.6)' }}
          />
        </div>

        <div className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-3">
          {!running ? (
            <button
              onClick={start}
              disabled={finished}
              className="group flex items-center gap-2 px-8 py-4 rounded-full bg-[hsl(0_85%_50%)] hover:bg-[hsl(0_85%_45%)] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-body font-500 uppercase tracking-wider text-sm"
              style={{ boxShadow: '0 0 24px hsl(0 85% 50% / 0.45)' }}
            >
              <Icon name="Play" size={18} />
              Старт
            </button>
          ) : (
            <button
              onClick={pause}
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-all font-body font-500 uppercase tracking-wider text-sm"
            >
              <Icon name="Pause" size={18} />
              Пауза
            </button>
          )}

          <button
            onClick={stop}
            className="flex items-center gap-2 px-6 py-4 rounded-full border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900 transition-all font-body font-500 uppercase tracking-wider text-sm text-zinc-300"
          >
            <Icon name="Square" size={16} />
            Стоп
          </button>

          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-4 rounded-full border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900 transition-all font-body font-500 uppercase tracking-wider text-sm text-zinc-300"
          >
            <Icon name="RotateCcw" size={16} />
            Сброс
          </button>

          <button
            onClick={openEdit}
            className="flex items-center gap-2 px-6 py-4 rounded-full border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900 transition-all font-body font-500 uppercase tracking-wider text-sm text-zinc-300"
          >
            <Icon name="Pencil" size={16} />
            Изменить
          </button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#111114] p-6 sm:p-8">
            <h2 className="font-display font-500 text-xl uppercase tracking-wide mb-6 flex items-center gap-2">
              <Icon name="Settings2" size={20} className="text-[hsl(0_85%_55%)]" />
              Настройка таймера
            </h2>

            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2 font-body">
              Название
            </label>
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Например: До Нового года"
              className="w-full mb-6 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-[hsl(0_85%_50%)] transition-colors font-body"
            />

            <div className="grid grid-cols-4 gap-3 mb-8">
              {[
                { label: 'Дни', val: d, set: setD },
                { label: 'Часы', val: h, set: setH },
                { label: 'Мин', val: m, set: setM },
                { label: 'Сек', val: s, set: setS },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center">
                  <input
                    type="number"
                    min={0}
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-full text-center rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-3 text-lg font-display text-[hsl(0_85%_58%)] outline-none focus:border-[hsl(0_85%_50%)] transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="mt-2 text-[0.6rem] uppercase tracking-widest text-zinc-500 font-body">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-3 rounded-full border border-zinc-700 hover:bg-zinc-900 transition-all font-body font-500 uppercase tracking-wider text-sm text-zinc-300"
              >
                Отмена
              </button>
              <button
                onClick={applyEdit}
                className="flex-1 py-3 rounded-full bg-[hsl(0_85%_50%)] hover:bg-[hsl(0_85%_45%)] transition-all font-body font-500 uppercase tracking-wider text-sm"
                style={{ boxShadow: '0 0 20px hsl(0 85% 50% / 0.4)' }}
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
