import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    api.me().then((u) => {
      setEmail(u.email ?? "");
      setPhone(u.phone ?? "");
      setAvatarUrl(u.avatarUrl ?? null);
    });
  }, []);

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setError("");
    setUploadingPhoto(true);
    try {
      const url = await api.uploadAvatar(user.id, file);
      await api.updateProfile(email, phone, url);
      setAvatarUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  }

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
      <button onClick={() => navigate(-1)} className="mb-4 self-start text-sm text-white/70 hover:text-white">
        › بازگشت
      </button>
      <h1 className="mb-5 text-lg font-bold text-white drop-shadow-sm">اطلاعات حساب کاربری</h1>

      <div className="card mb-4 flex flex-col items-center">
        <div className="relative mb-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-600">
              {user?.name?.[0] ?? "?"}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs text-white shadow"
            disabled={uploadingPhoto}
          >
            📷
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
        </div>
        <p className="text-xs text-slate-400">{uploadingPhoto ? "در حال آپلود..." : "برای تغییر عکس، روی آیکون دوربین بزنید"}</p>
      </div>

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

      <p className="mt-4 text-center text-xs text-white/70">
        برای تغییر نام، نقش یا واحد، به مدیر واحد اطلاع دهید.
      </p>
    </div>
  );
}
