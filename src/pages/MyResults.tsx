import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function MyResults() {
  const navigate = useNavigate();
  const [axisData, setAxisData] = useState<any>(null);
  const [qData, setQData] = useState<any>(null);

  useEffect(() => {
    api.myAxisRanks().then(setAxisData);
    api.myQuestionRanks().then(setQData);
  }, []);

  if (!axisData || !qData) return <div className="app-shell" />;

  const axisRankByName: Record<string, { rank: number; total: number }> = {};
  axisData.axes.forEach((a: any) => (axisRankByName[a.axis] = { rank: a.rank, total: a.total }));

  const grouped: Record<string, any[]> = {};
  qData.questions.forEach((q: any) => {
    if (!grouped[q.axis]) grouped[q.axis] = [];
    grouped[q.axis].push(q);
  });

  const cycleTitle = qData.cycleTitle ?? axisData.cycleTitle;

  return (
    <div className="app-shell">
      <button onClick={() => navigate(-1)} className="mb-4 self-start text-sm text-white/70 hover:text-white">
        › بازگشت
      </button>
      <h1 className="mb-1 text-lg font-bold text-white drop-shadow-sm">نتایج من</h1>
      <p className="mb-5 text-xs text-white/70">
        {cycleTitle
          ? `جایگاه شما در هر سؤال، در مقایسه با هم‌ردیفانتان در دوره «${cycleTitle}»`
          : "هنوز نتیجه‌ای برای نمایش وجود ندارد."}
      </p>

      {Object.keys(grouped).length === 0 ? (
        <div className="card text-center text-sm text-slate-500">
          هنوز ارزیابی‌های کافی برای شما ثبت نهایی نشده است.
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([axis, questions]) => (
            <div key={axis}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white drop-shadow-sm">{axis}</h2>
                {axisRankByName[axis] && (
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-brand-600">
                    رتبه محور: {axisRankByName[axis].rank} از {axisRankByName[axis].total}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {questions.map((q: any, i: number) => (
                  <div key={i} className="card !p-3">
                    <p className="mb-2 text-xs text-slate-600">{q.question}</p>
                    <div className="flex items-center justify-between">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${(q.score / 5) * 100}%` }} />
                      </div>
                      <span className="mr-3 shrink-0 text-xs font-bold text-slate-800">{q.score}</span>
                      <span className="mr-2 shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] text-brand-600">
                        رتبه {q.rank}/{q.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
