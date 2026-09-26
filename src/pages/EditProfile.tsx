import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function EditProfile() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.me().then((u) => {
      setEmail(u.email ?? "");
      setPhone(u.phone ?? "");
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk(false);
    setBusy(true);
    try {
      await api.updateProfile(email, phone);
      setOk(true);
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
      <h1 className="mb-5 text-lg font-bold text-slate-800">اطلاعات حساب کاربری</h1>

      <form onSubmit={onSubmit} className="card space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-slate-600">ایمیل سازمانی</label>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-slate-600">شماره تماس</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {ok && <p className="text-sm text-mint-500">اطلاعات با موفقیت ذخیره شد.</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </form>
    </div>
  );
}
