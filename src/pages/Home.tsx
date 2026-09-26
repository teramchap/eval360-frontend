import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";

export default function Home() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    api.myEvaluations().then(setData);
    api.notifications().then((r) => setNotifCount(r.notifications.length));
  }, []);

  const summary = data?.summary;
  const selfDone = data?.selfEvaluation?.status === "COMPLETED";

  return (
    <div className="app-shell">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">سلام، {user?.name?.split(" ")[0] ?? ""} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">به سامانه ارزیابی ۳۶۰ درجه خوش آمدید</p>
        </div>
        <div className="relative">
          <BellIcon />
          {notifCount > 0 && (
            <span className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {notifCount}
            </span>
          )}
        </div>
      </header>

      {!data?.cycle ? (
        <div className="card text-center text-sm text-slate-500">در حال حاضر دوره ارزیابی فعالی وجود ندارد.</div>
      ) : (
        <>
          <div className="mb-4 rounded-xl2 bg-gradient-to-l from-brand-600 to-brand-400 p-5 text-white shadow-card">
            <p className="mb-1 text-sm opacity-90">ارزیابی این دوره</p>
            <p className="mb-3 text-2xl font-bold">{summary?.percent ?? 0}% تکمیل شده</p>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/30">
              <div className="h-full rounded-full bg-white" style={{ width: `${summary?.percent ?? 0}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-90">{summary?.remaining ?? 0} ارزیابی باقی مانده</span>
              <Link to="/evaluations" className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-brand-600">
                ادامه ارزیابی
              </Link>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <Link to="/evaluations" className="rounded-xl2 bg-mint-50 p-4 shadow-card">
              <p className="mb-6 text-sm font-semibold text-slate-800">ارزیابی همکاران</p>
              <p className="mb-3 text-xs text-slate-500">{summary?.remaining ?? 0} نفر باقی مانده</p>
              <span className="inline-block rounded-full bg-mint-500 px-4 py-1.5 text-xs font-medium text-white">
                شروع ارزیابی
              </span>
            </Link>
            <Link to="/evaluations?self=1" className="rounded-xl2 bg-plum-50 p-4 shadow-card">
              <p className="mb-6 text-sm font-semibold text-slate-800">خودارزیابی</p>
              <p className="mb-3 text-xs text-slate-500">{selfDone ? "تکمیل شده" : "تکمیل نشده"}</p>
              <span className="inline-block rounded-full bg-plum-500 px-4 py-1.5 text-xs font-medium text-white">
                شروع خودارزیابی
              </span>
            </Link>
          </div>

          <Link to="/fun" className="card flex items-center justify-between bg-amber-50">
            <div>
              <p className="mb-1 text-sm font-semibold text-slate-800">حالا یکم جدی نباشیم! 😄</p>
              <p className="text-xs text-slate-500">چند سؤال کوتاه درباره همکارانتان</p>
            </div>
            <span className="rounded-full bg-amber-400 px-4 py-1.5 text-xs font-medium text-white">شروع</span>
          </Link>
        </>
      )}

      <BottomNav />
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
      <path d="M6 8a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20a2 2 0 004 0" strokeLinecap="round" />
    </svg>
  );
}
