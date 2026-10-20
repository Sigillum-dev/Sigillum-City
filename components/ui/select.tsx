'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { FIELD_INPUT } from '@/components/ui/field';

export interface SelectOption {
  value: string;
  label: string;
}

/** Dropdown bergaya Sigillum pengganti <select> bawaan browser (daftar opsi bawaan OS
 *  tidak bisa diberi tema: abu-abu dengan sorotan biru). Pola listbox ARIA: panah / Home /
 *  End / Enter / Spasi / Escape / ketik huruf pertama, dan klik di luar menutupnya. */
export function Select({
  value,
  onChange,
  options,
  className,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = Math.max(0, options.findIndex((o) => o.value === value));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  function openList() {
    if (disabled) return;
    setActive(selected);
    setOpen(true);
  }

  function pick(i: number) {
    const o = options[i];
    if (o) onChange(o.value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((a) => Math.min(options.length - 1, a + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        pick(active);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        if (e.key.length === 1) {
          const k = e.key.toLowerCase();
          const next = options.findIndex(
            (o, i) => i > active && o.label.toLowerCase().startsWith(k),
          );
          const first = options.findIndex((o) => o.label.toLowerCase().startsWith(k));
          if (next >= 0) setActive(next);
          else if (first >= 0) setActive(first);
        }
    }
  }

  return (
    <div ref={root} className={cn('relative', className)}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          FIELD_INPUT,
          'flex w-full items-center justify-between gap-2 text-left',
          open && 'border-gold shadow-[0_0_0_3px_rgba(214,182,118,0.12)]',
        )}
      >
        <span className="truncate">{options[selected]?.label ?? ''}</span>
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className={cn(
            'size-3 shrink-0 text-gold transition-transform duration-200',
            open && 'rotate-180',
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          onClick={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-60 overflow-auto rounded-panel border border-line bg-surface py-1 font-body text-[13.5px] normal-case tracking-normal shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
        >
          {options.map((o, i) => (
            <li
              key={o.value || `opt-${i}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === selected}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                // Select biasanya dibungkus <label>: tanpa ini klik opsi diteruskan ke tombol dan membuka ulang daftar.
                e.preventDefault();
                pick(i);
              }}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-ink-2 transition-colors',
                i === active && 'bg-gold/10 text-ink',
                i === selected && 'text-gold-2',
              )}
            >
              <span className="truncate">{o.label}</span>
              {i === selected && (
                <svg aria-hidden viewBox="0 0 12 12" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m2.5 6.5 2.5 2.5 4.5-5.5" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
