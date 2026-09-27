import { JALALI_MONTHS, today } from "../lib/jalali";

interface Props {
  label: string;
  value: { jy: number; jm: number; jd: number };
  onChange: (v: { jy: number; jm: number; jd: number }) => void;
}

const t = today();
const YEARS = Array.from({ length: 6 }, (_, i) => t.jy - 1 + i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function JalaliDateField({ label, value, onChange }: Props) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-slate-600">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        <select
          className="rounded-xl border border-slate-200 px-2 py-2.5 text-sm outline-none focus:border-brand-400"
          value={value.jd}
          onChange={(e) => onChange({ ...value, jd: Number(e.target.value) })}
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-slate-200 px-2 py-2.5 text-sm outline-none focus:border-brand-400"
          value={value.jm}
          onChange={(e) => onChange({ ...value, jm: Number(e.target.value) })}
        >
          {JALALI_MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-slate-200 px-2 py-2.5 text-sm outline-none focus:border-brand-400"
          value={value.jy}
          onChange={(e) => onChange({ ...value, jy: Number(e.target.value) })}
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
