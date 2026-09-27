import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function MyResults() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.myAxisRanks().then(setData);
  }, []);

  if (!data) return <div className="app-shell" />;

  return (
    <div className="app-shell">
      <button onClick={() => navigate(-1)} className="mb-4 self-start text-sm text-white/70 hover:text-white">
        › بازگشت
      </button>
      <h1 className="mb-1 text-lg font-bold text-white drop-shadow-sm">نتایج من</h1>
      <p className="mb-5 text-xs text-white/70">
        {data.cycleTitle
          ? `جایگاه شما در هر محور، در مقایسه با هم‌ردیفانتان در دوره «${data.cycleTitle}»`
          : "هنوز نتیجه‌ای برای نمایش وجود ندارد."}
      </p>

      {data.axes.length === 0 ? (
        <div className="card text-center text-sm text-slate-500">
          هنوز ارزیابی‌های کافی برای شما ثبت نهایی نشده است.
        </div>
      ) : (
        <div className="space-y-3">
          {data.axes.map((a: any) => (
            <div key={a.axis} className="card">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{a.axis}</span>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600">
                  رتبه {a.rank} از {a.total}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${(a.score / 5) * 100}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-400">میانگین امتیاز: {a.score}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
