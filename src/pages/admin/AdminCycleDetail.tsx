import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";

type Tab = "people" | "team" | "fun";

export default function AdminCycleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("people");
  const [dashboard, setDashboard] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [fun, setFun] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    api.adminDashboard(id).then(setDashboard);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (tab === "team" && !team) api.adminTeamReport(id).then(setTeam);
    if (tab === "fun" && !fun) api.adminFunReport(id).then(setFun);
  }, [tab, id]);

  if (!dashboard) return <div className="app-shell" />;

  return (
    <div className="app-shell pb-10">
      <button onClick={() => navigate("/admin")} className="mb-4 self-start text-sm text-white/70 hover:text-white">
        › بازگشت به دوره‌ها
      </button>
      <h1 className="mb-5 text-lg font-bold text-white drop-shadow-sm">داشبورد دوره</h1>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="card !p-3">
          <p className="text-lg font-bold text-brand-600">{dashboard.stats.participationPercent}%</p>
          <p className="text-[11px] text-slate-400">مشارکت کلی</p>
        </div>
        <div className="card !p-3">
          <p className="text-lg font-bold text-mint-500">{dashboard.stats.completedEvaluations}</p>
          <p className="text-[11px] text-slate-400">تکمیل‌شده</p>
        </div>
        <div className="card !p-3">
          <p className="text-lg font-bold text-amber-400">{dashboard.stats.remainingEvaluations}</p>
          <p className="text-[11px] text-slate-400">باقی‌مانده</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 text-xs">
        {(
          [
            ["people", "افراد"],
            ["team", "گزارش تجمیعی"],
            ["fun", "بخش غیررسمی"],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 ${tab === t ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "people" && (
        <div className="space-y-2">
          {dashboard.people.map((p: any) => (
            <Link
              key={p.userId}
              to={`/admin/cycles/${id}/report/${p.userId}`}
              className="card flex items-center justify-between !p-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-400">
                  {p.roleLabel} · {p.evaluationsCompleted}/{p.evaluationsReceived} دریافت‌شده
                </p>
              </div>
              <span className="text-xs text-slate-400">مشارکت خودش: {p.participation}%</span>
            </Link>
          ))}
        </div>
      )}

      {tab === "team" && team && (
        <div className="space-y-4">
          <div className="card">
            <p className="mb-2 text-sm font-bold text-mint-500">قوی‌ترین محورها</p>
            {team.strongestAxes.map((a: any) => (
              <div key={a.axis} className="mb-1 flex justify-between text-xs">
                <span className="text-slate-600">{a.axis}</span>
                <span className="font-medium text-slate-800">{a.average.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <p className="mb-2 text-sm font-bold text-amber-400">محورهای نیازمند توجه</p>
            {team.weakestAxes.map((a: any) => (
              <div key={a.axis} className="mb-1 flex justify-between text-xs">
                <span className="text-slate-600">{a.axis}</span>
                <span className="font-medium text-slate-800">{a.average.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "fun" && fun && (
        <div className="space-y-3">
          {fun.result.map((r: any) => (
            <div key={r.question} className="card">
              <p className="mb-2 text-sm text-slate-700">{r.question}</p>
              <div className="flex flex-wrap gap-2">
                {r.counts.map((c: any) => (
                  <span key={c.name} className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-600">
                    {c.name} ({c.count})
                  </span>
                ))}
                {r.counts.length === 0 && <span className="text-xs text-slate-400">پاسخی ثبت نشده است.</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
