import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";

export default function Home() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.myEvaluations().then(setData);
  }, []);

  const summary = data?.summary;
  const selfEval = data?.selfEvaluation;
  const selfDone = selfEval?.status === "COMPLETED";
  const selfLink = selfEval ? `/evaluations/${selfEval.evaluationId}` : "/evaluations";
  const closed = data?.cycle?.status === "CLOSED";

  return (
    <div className="app-shell">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white drop-shadow-sm">سلام، {user?.name?.split(" ")[0] ?? ""} 👋</h1>
          <p className="mt-1 text-sm text-white/75">به سامانه ارزیابی ۳۶۰ درجه خوش آمدید</p>
        </div>
        <img src="/logo.png" alt="" className="h-14 w-14 shrink-0 drop-shadow-lg" />
      </header>

      {!data?.cycle ? (
        <div className="card text-center text-sm text-slate-500">در حال حاضر دوره ارزیابی فعالی وجود ندارد.</div>
      ) : (
        <>
          {closed && (
            <div className="card mb-4 !bg-slate-100 text-center">
              <p className="text-sm font-medium text-slate-600">این دوره بسته شده — فقط می‌توانید نتایج ثبت‌شده را مشاهده کنید.</p>
            </div>
          )}

          <div className="mb-4 rounded-xl2 bg-gradient-to-l from-brand-600 to-brand-400 p-5 text-white shadow-card">
            <p className="mb-1 text-sm opacity-90">ارزیابی این دوره</p>
            <p className="mb-3 text-2xl font-bold">{summary?.percent ?? 0}% تکمیل شده</p>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/30">
              <div className="h-full rounded-full bg-white" style={{ width: `${summary?.percent ?? 0}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-90">{summary?.remaining ?? 0} ارزیابی باقی مانده</span>
              <Link to="/evaluations" className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-brand-600">
                {closed ? "مشاهده" : "ادامه ارزیابی"}
              </Link>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <Link to="/evaluations" className="rounded-xl2 bg-mint-50 p-4 shadow-card">
              <p className="mb-6 text-sm font-semibold text-slate-800">ارزیابی همکاران</p>
              <p className="mb-3 text-xs text-slate-500">{summary?.remaining ?? 0} نفر باقی مانده</p>
              <span className="inline-block rounded-full bg-mint-500 px-4 py-1.5 text-xs font-medium text-white">
                {closed ? "مشاهده" : "شروع ارزیابی"}
              </span>
            </Link>
            <Link to={selfLink} className="rounded-xl2 bg-plum-50 p-4 shadow-card">
              <p className="mb-6 text-sm font-semibold text-slate-800">خودارزیابی</p>
              <p className="mb-3 text-xs text-slate-500">{selfDone ? "تکمیل شده" : "تکمیل نشده"}</p>
              <span className="inline-block rounded-full bg-plum-500 px-4 py-1.5 text-xs font-medium text-white">
                {closed ? "مشاهده" : "شروع خودارزیابی"}
              </span>
            </Link>
          </div>

          {!closed && (
            <Link to="/fun" className="card flex items-center justify-between bg-amber-50">
              <div>
                <p className="mb-1 text-sm font-semibold text-slate-800">حالا یکم جدی نباشیم! 😄</p>
                <p className="text-xs text-slate-500">چند سؤال کوتاه درباره همکارانتان</p>
              </div>
              <span className="rounded-full bg-amber-400 px-4 py-1.5 text-xs font-medium text-white">شروع</span>
            </Link>
          )}

          <Link to="/my-results" className="card mt-3 flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm font-semibold text-slate-800">📊 نتایج من</p>
              <p className="text-xs text-slate-500">جایگاه شما در هر سؤال نسبت به هم‌ردیفانتان</p>
            </div>
            <span className="text-slate-300">‹</span>
          </Link>
        </>
      )}

      <BottomNav />
    </div>
  );
}
