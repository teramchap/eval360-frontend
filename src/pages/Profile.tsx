import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import BottomNav from "../components/BottomNav";

const MENU = [
  { label: "اطلاعات حساب کاربری", desc: "ویرایش اطلاعات فردی، شماره تماس و ایمیل", to: "/profile/edit" },
  { label: "تغییر رمز عبور", desc: "امنیت حساب خود را حفظ کنید", to: "/profile/password" },
  { label: "تنظیمات اعلان‌ها", desc: "مدیریت اطلاع‌رسانی‌ها", to: null },
  { label: "راهنما و پشتیبانی", desc: "سؤالات متداول و ارتباط با پشتیبانی", to: null },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    api.myEvaluations().then((d) => setSummary(d.summary));
  }, []);

  return (
    <div className="app-shell">
      <h1 className="mb-5 text-lg font-bold text-slate-800">پروفایل من</h1>

      <div className="card mb-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-600">
            {user?.name?.[0] ?? "?"}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.roleLabel}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
          <div className="rounded-lg bg-slate-50 p-2">
            <p className="text-slate-400">شماره پرسنلی</p>
            <p className="mt-0.5 font-medium text-slate-700">{user?.personnelCode}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <p className="text-slate-400">واحد</p>
            <p className="mt-0.5 font-medium text-slate-700">{user?.unit}</p>
          </div>
        </div>
      </div>

      {summary && (
        <div className="card mb-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">وضعیت ارزیابی این دوره</p>
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-mint-500" style={{ width: `${summary.percent}%` }} />
          </div>
          <p className="text-xs text-slate-400">
            {summary.percent}% تکمیل شده · {summary.remaining} ارزیابی باقی مانده
          </p>
        </div>
      )}

      {user?.role === "MANAGER" && (
        <Link to="/admin" className="card mb-4 flex items-center justify-between bg-brand-50">
          <div>
            <p className="text-sm font-semibold text-brand-700">پنل مدیریتی</p>
            <p className="text-xs text-slate-500">دوره‌ها، داشبورد مشارکت و گزارش‌ها</p>
          </div>
          <span className="text-brand-400">‹</span>
        </Link>
      )}

      <div className="card divide-y divide-slate-100">
        {MENU.map((m) =>
          m.to ? (
            <Link key={m.label} to={m.to} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-slate-700">{m.label}</p>
                <p className="text-xs text-slate-400">{m.desc}</p>
              </div>
              <span className="text-slate-300">‹</span>
            </Link>
          ) : (
            <div key={m.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 opacity-50">
              <div>
                <p className="text-sm font-medium text-slate-700">{m.label}</p>
                <p className="text-xs text-slate-400">{m.desc}</p>
              </div>
              <span className="text-slate-300">‹</span>
            </div>
          )
        )}
        <button onClick={logout} className="flex w-full items-center justify-between py-3 text-red-500">
          <div className="text-right">
            <p className="text-sm font-medium">خروج از حساب</p>
            <p className="text-xs text-red-300">تخلیه امن از سامانه</p>
          </div>
          <span>‹</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
