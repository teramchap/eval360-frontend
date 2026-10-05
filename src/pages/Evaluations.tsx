import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import BottomNav from "../components/BottomNav";

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  COMPLETED: { bg: "bg-mint-50", text: "text-mint-500", dot: "●" },
  IN_PROGRESS: { bg: "bg-amber-50", text: "text-amber-400", dot: "◔" },
  NOT_STARTED: { bg: "bg-slate-100", text: "text-slate-500", dot: "○" },
};

export default function Evaluations() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.myEvaluations().then(setData);
  }, []);

  if (!data) return <div className="app-shell" />;
  const { summary, selfEvaluation, people, cycle } = data;
  const closed = cycle?.status === "CLOSED";

  function actionLabel(status: string) {
    if (closed) return "مشاهده";
    if (status === "COMPLETED") return "مشاهده";
    if (status === "IN_PROGRESS") return "ادامه ارزیابی";
    return "شروع ارزیابی";
  }

  return (
    <div className="app-shell">
      <h1 className="mb-1 text-lg font-bold text-white drop-shadow-sm">ارزیابی‌های من</h1>
      <p className="mb-5 text-sm text-white/75">افرادی که باید ارزیابی کنید و وضعیت پیشرفت شما</p>

      {closed && (
        <div className="card mb-4 !bg-slate-100 text-center">
          <p className="text-sm font-medium text-slate-600">این دوره بسته شده است — فقط می‌توانید مشاهده کنید.</p>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="card">
          <p className="mb-2 text-xs text-slate-500">وضعیت کلی دوره ارزیابی</p>
          <p className="text-xl font-bold text-mint-500">{summary?.percent ?? 0}%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-mint-500" style={{ width: `${summary?.percent ?? 0}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-400">{summary?.remaining ?? 0} نفر باقی مانده</p>
        </div>
        <div className="card bg-plum-50">
          <p className="mb-2 text-xs text-slate-600">خودارزیابی</p>
          <p className="mb-3 text-sm font-semibold text-slate-800">
            {selfEvaluation?.status === "COMPLETED" ? "تکمیل شده" : "تکمیل نشده"}
          </p>
          {selfEvaluation && (
            <Link to={`/evaluations/${selfEvaluation.evaluationId}`} className="text-xs font-medium text-plum-500">
              {closed ? "مشاهده خودارزیابی" : "شروع خودارزیابی"} ‹
            </Link>
          )}
        </div>
      </div>

      <h2 className="mb-3 text-sm font-bold text-slate-700">لیست افرادی که باید ارزیابی کنید</h2>
      <div className="space-y-3">
        {people?.map((p: any) => {
          const style = STATUS_STYLE[p.status];
          return (
            <div key={p.evaluationId} className="card flex items-center justify-between">
              <div className="flex flex-1 items-center gap-3">
                {p.avatarUrl ? (
                  <img src={p.avatarUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                    {p.name?.[0]}
                  </div>
                )}
                <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${style.bg} ${style.text}`}>
                    {style.dot} {p.statusLabel}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-400">
                  {p.roleLabel} · {p.relationLabel}
                </p>
                <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-mint-500"
                    style={{ width: `${p.total ? (p.answered / p.total) * 100 : 0}%` }}
                  />
                </div>
                </div>
              </div>
              <Link
                to={`/evaluations/${p.evaluationId}`}
                className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                  p.status === "COMPLETED" || closed ? "border border-slate-200 text-slate-600" : "bg-brand-500 text-white"
                }`}
              >
                {actionLabel(p.status)}
              </Link>
            </div>
          );
        })}
        {people?.length === 0 && <p className="text-center text-sm text-slate-400">ارزیابی‌ای برای شما ثبت نشده است.</p>}
      </div>

      <BottomNav />
    </div>
  );
}
