import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";

export default function AdminPersonReport() {
  const { id, userId } = useParams<{ id: string; userId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (!id || !userId) return;
    api.adminReport(id, userId).then(setReport);
  }, [id, userId]);

  if (!report) return <div className="app-shell" />;

  return (
    <div className="app-shell pb-10">
      <button onClick={() => navigate(-1)} className="mb-4 self-start text-sm text-slate-500">
        › بازگشت
      </button>
      <h1 className="mb-1 text-lg font-bold text-slate-800">گزارش فردی</h1>
      <p className="mb-5 text-xs text-slate-400">نظرات و پاسخ‌ها کاملاً تجمیعی و بدون افشای هویت ارزیاب نمایش داده می‌شوند.</p>

      <div className="card mb-4 text-center">
        <p className="mb-1 text-xs text-slate-500">امتیاز نهایی</p>
        <p className="text-3xl font-bold text-brand-600">
          {report.finalScore != null ? report.finalScore.toFixed(2) : "—"}
          <span className="text-sm text-slate-400"> / ۵</span>
        </p>
        {report.lowConfidenceOverall && (
          <p className="mt-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] text-amber-500">
            تعداد پاسخ‌دهندگان کم است — این عدد را با احتیاط تفسیر کنید
          </p>
        )}
      </div>

      <div className="card mb-4">
        <p className="mb-3 text-sm font-bold text-slate-700">تفکیک بر اساس نوع رابطه</p>
        <div className="space-y-2">
          {report.groups.map((g: any) => (
            <div key={g.relationLabel} className="flex items-center justify-between text-xs">
              <span className="text-slate-600">
                {g.relationLabel} {g.lowResponse && <span className="text-amber-400">(پاسخ کم)</span>}
              </span>
              <span className="font-medium text-slate-800">
                {g.average != null ? g.average.toFixed(2) : "—"} · وزن {g.weight}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-4">
        <p className="mb-3 text-sm font-bold text-slate-700">امتیاز محورها</p>
        <div className="space-y-2">
          {report.axisScores.map((a: any) => (
            <div key={a.axis}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-slate-600">
                  {a.axis} {a.lowResponse && <span className="text-amber-400">(پاسخ کم)</span>}
                </span>
                <span className="font-medium text-slate-800">{a.score != null ? a.score.toFixed(2) : "—"}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${((a.score ?? 0) / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-4">
        <p className="mb-2 text-sm font-bold text-mint-500">نقاط قوت (تجمیعی)</p>
        {report.comments.strengths.length === 0 && <p className="text-xs text-slate-400">نظری ثبت نشده است.</p>}
        <ul className="space-y-2 text-xs text-slate-600">
          {report.comments.strengths.map((s: string, i: number) => (
            <li key={i} className="rounded-lg bg-mint-50 p-2">
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <p className="mb-2 text-sm font-bold text-amber-400">نقاط قابل بهبود (تجمیعی)</p>
        {report.comments.improvements.length === 0 && <p className="text-xs text-slate-400">نظری ثبت نشده است.</p>}
        <ul className="space-y-2 text-xs text-slate-600">
          {report.comments.improvements.map((s: string, i: number) => (
            <li key={i} className="rounded-lg bg-amber-50 p-2">
              {s}
            </li>
          ))}
        </ul>
        {report.comments.lowResponse && (
          <p className="mt-2 text-[11px] text-amber-400">تعداد نظرات کم است — با احتیاط مطالعه شود.</p>
        )}
      </div>
    </div>
  );
}
