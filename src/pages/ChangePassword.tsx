import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk(false);
    if (next !== confirm) {
      setError("رمز جدید و تکرار آن یکسان نیستند.");
      return;
    }
    setBusy(true);
    try {
      await api.changePassword("", next);
      setOk(true);
      setNext("");
      setConfirm("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <button onClick={() => navigate(-1)} className="mb-4 self-start text-sm text-slate-500">
        › بازگشت
      </button>
      <h1 className="mb-5 text-lg font-bold text-slate-800">تغییر رمز عبور</h1>

      <form onSubmit={onSubmit} className="card space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-slate-600">رمز عبور جدید</label>
          <input
            type="password"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slate-600">تکرار رمز عبور جدید</label>
          <input
            type="password"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {ok && <p className="text-sm text-mint-500">رمز عبور با موفقیت تغییر کرد.</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "در حال ذخیره..." : "تغییر رمز عبور"}
        </button>
      </form>
    </div>
  );
}
