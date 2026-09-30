import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { RELATION_LABEL } from "../../lib/labels";

export default function AdminPersonReport() {
  const { id, userId } = useParams<{ id: string; userId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [ranks, setRanks] = useState<Record<string, { rank: number; total: number }>>({});
  const [identified, setIdentified] = useState<any[] | null>(null);
  const [identifiedBlockedReason, setIdentifiedBlockedReason] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !userId) return;
    api.adminReport(id, userId).then(setReport);
    api.adminPeerAxisRanks(id, userId).then((rows) => {
      const map: Record<string, { rank: number; total: number }> = {};
      rows.forEach((r) => (map[r.axis] = { rank: r.rank, total: r.total }));
      setRanks(map);
    });
    api
      .adminIdentifiedFeedback(id, userId)
      .then(setIdentified)
      .catch((err) => setIdentifiedBlockedReason(err.message));
  }, [id, userId]);

  if (!report) return <div className="app-shell" />;

  return (
    <div className="app-shell pb-10">
      <button onClick={() => navigate(-1)} className="mb-4 self-start text-sm text-white/70 hover:text-white">
        › بازگشت
      </button>
      <h1 className="mb-1 text-lg font-bold text-white drop-shadow-sm">
        گزارش دریافتی {report.evaluatedName ? `«${report.evaluatedName}»` : "فردی"}
      </h1>
      <p className="mb-5 text-xs text-white/70">
        این صفحه یعنی: «دیگران چه نظری درباره‌ی {report.evaluatedName ?? "این فرد"} دارند» — نه ارزیابی‌هایی که خودش درباره‌ی بقیه داده.
        بخش امتیاز و محورها تجمیعی و ناشناس است؛ فقط بخش «نظرات شناسه‌دار» پایین صفحه هویت ارزیاب را نشان می‌دهد.
      </p>

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
        <p className="mb-1 text-sm font-bold text-slate-700">امتیاز محورها</p>
        <p className="mb-3 text-[11px] text-slate-400">رتبه، مقایسه‌ی نسبی (بدون وزن‌دهی) با هم‌ردیفان همین نقش در این دوره است</p>
        <div className="space-y-3">
          {report.axisScores.map((a: any) => (
            <div key={a.axis}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {a.axis} {a.lowResponse && <span className="text-amber-400">(پاسخ کم)</span>}
                </span>
                <span className="flex items-center gap-2">
                  {ranks[a.axis] && (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] text-brand-600">
                      رتبه {ranks[a.axis].rank} از {ranks[a.axis].total}
                    </span>
                  )}
                  <span className="font-medium text-slate-800">{a.score != null ? a.score.toFixed(2) : "—"}</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${((a.score ?? 0) / 5) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-4">
        <p className="mb-1 text-sm font-bold text-slate-700">امتیاز تک‌تک سؤال‌ها (ناشناس)</p>
        <p className="mb-3 text-[11px] text-slate-400">میانگین وزن‌دارِ همه‌ی ارزیاب‌ها روی هر سؤال، بدون افشای هویت</p>
        <div className="space-y-4">
          {Object.entries(
            report.questionScores.reduce((acc: Record<string, any[]>, q: any) => {
              (acc[q.axis] ??= []).push(q);
              return acc;
            }, {})
          ).map(([axis, qs]: [string, any]) => (
            <div key={axis}>
              <p className="mb-2 text-xs font-bold text-brand-600">{axis}</p>
              <div className="space-y-2">
                {qs.map((q: any, i: number) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-600">
                      {q.question} {q.lowResponse && <span className="text-amber-400">(پاسخ کم)</span>}
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-50 px-2 py-0.5 font-medium text-slate-700">
                      {q.score != null ? q.score.toFixed(2) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-4">
        <p className="mb-1 text-sm font-bold text-slate-700">پاسخ‌های شناسه‌دار (فقط مدیر)</p>
        {identifiedBlockedReason ? (
          <p className="text-xs text-amber-500">{identifiedBlockedReason}</p>
        ) : identified && identified.length > 0 ? (
          <div className="space-y-2">
            <p className="mb-1 text-[11px] text-slate-400">
              روی اسم هر ارزیاب بزن تا جواب تک‌تک سؤال‌هایی که درباره‌ی {report.evaluatedName ?? "این فرد"} داده را ببینی.
            </p>
            {identified.map((f: any) => (
              <div key={f.evaluationId} className="rounded-lg bg-slate-50">
                <button
                  onClick={() => setExpanded(expanded === f.evaluationId ? null : f.evaluationId)}
                  className="flex w-full items-center justify-between p-2.5 text-right"
                >
                  <span className="text-xs font-medium text-slate-700">
                    {f.evaluatorName} <span className="text-slate-400">({RELATION_LABEL[f.relationType]})</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-600">
                      {f.averageScore != null ? f.averageScore.toFixed(2) : "—"} / ۵
                    </span>
                    <span className="text-slate-400">{expanded === f.evaluationId ? "▲" : "▼"}</span>
                  </span>
                </button>

                {expanded === f.evaluationId && (
                  <div className="space-y-2 border-t border-slate-200 p-2.5">
                    {f.strengthComment && <p className="text-[11px] text-mint-600">+ {f.strengthComment}</p>}
                    {f.improvementComment && <p className="text-[11px] text-amber-600">− {f.improvementComment}</p>}
                    <div className="space-y-1.5 pt-1">
                      {f.answers.map((a: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-slate-600">{a.question}</span>
                          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 font-medium text-slate-700">
                            {a.insufficientInformation ? "بی‌اطلاع" : a.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">هنوز ارزیابی تکمیل‌شده‌ای برای این فرد ثبت نشده است.</p>
        )}
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
