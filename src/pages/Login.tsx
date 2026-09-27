import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(code, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="" className="mx-auto mb-4 h-20 w-20 drop-shadow-lg" />
          <h1 className="text-xl font-bold text-white drop-shadow-sm">سامانه ارزیابی ۳۶۰ درجه</h1>
          <p className="mt-1 text-sm text-white/75">ارزش هر فرد، در نگاه دیگران معنا پیدا می‌کند</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-slate-600">شماره پرسنلی</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="مثلاً ۱۰۰۲"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-600">رمز عبور</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "در حال ورود..." : "ورود"}
          </button>
        </form>
      </div>
    </div>
  );
}
