import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { ROLE_LABEL } from "../../lib/labels";

type Tab = "people" | "ranking" | "team" | "fun";

export default function AdminCycleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("people");
  const [dashboard, setDashboard] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [fun, setFun] = useState<any>(null);
  const [ranking, setRanking] = useState<any[] | null>(null);

  useEffect(() => {
    if (!id) return;
    api.adminDashboard(id).then(setDashboard);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (tab === "team" && !team) api.adminTeamReport(id).then(setTeam);
    if (tab === "fun" && !fun) api.adminFunReport(id).then(setFun);
    if (tab === "ranking" && !ranking) api.adminRanking(id).then(setRanking);
  }, [tab, id]);

  if (!dashboard) return <div className="app-shell" />;

  const rankingByRole: Record<string, any[]> = {};
  (ranking ?? []).forEach((r) => {
    if (!rankingByRole[r.role]) rankingByRole[r.role] = [];
    rankingByRole[r.role].push(r);
  });

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

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {(
          [
            ["people", "افراد"],
            ["ranking", "رتبه‌بندی افراد"],
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
          <p className="mb-1 text-[11px] text-white/70">
            روی هر نفر بزن تا ببینی دیگران درباره‌ی او چه نظری داده‌اند (نه ارزیابی‌های خودش درباره‌ی بقیه).
          </p>
          {dashboard.people.map((p: any) => (
            <Link
              key={p.userId}
              to={`/admin/cycles/${id}/report/${p.userId}`}
              className="card flex items-center justify-between !p-3"
            >
              <div className="flex items-center gap-3">
                {p.avatarUrl ? (
                  <img src={p.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                    {p.name?.[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-400">
                    {p.roleLabel} · {p.evaluationsCompleted}/{p.evaluationsReceived} دریافت‌شده
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400">مشارکت خودش: {p.participation}%</span>
            </Link>
          ))}
        </div>
      )}

      {tab === "ranking" && (
        <div className="space-y-4">
          <p className="text-[11px] text-white/70">
            مقایسه‌ی امتیاز نهایی افراد، فقط بین هم‌ردیف‌ها (چون معیار سنجش هر نقش فرق دارد).
          </p>
          {!ranking ? (
            <div className="card text-center text-sm text-slate-500">در حال بارگذاری...</div>
          ) : (
            Object.entries(rankingByRole).map(([role, people]) => (
              <div key={role} className="card">
                <p className="mb-2 text-sm font-bold text-brand-600">{ROLE_LABEL[role]}</p>
                <div className="space-y-1.5">
                  {people
                    .slice()
                    .sort((a, b) => (a.roleRank ?? 999) - (b.roleRank ?? 999))
                    .map((p) => (
                      <div key={p.userId} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-center text-xs font-bold text-slate-400">
                            {p.roleRank ?? "—"}
                          </span>
                          {p.avatarUrl ? (
                            <img src={p.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">
                              {p.name?.[0]}
                            </div>
                          )}
                          <span className="text-xs text-slate-700">{p.name}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {p.finalScore != null ? p.finalScore : "بدون امتیاز"}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
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
