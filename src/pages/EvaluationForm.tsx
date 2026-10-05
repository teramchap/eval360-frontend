import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

const SCORE_LABELS = ["خیلی ضعیف", "ضعیف", "متوسط", "خوب", "عالی"];

export default function EvaluationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [strength, setStrength] = useState("");
  const [improvement, setImprovement] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.evaluationDetail(id).then((d) => {
      setData(d);
      setStrength(d.comments?.strengthComment ?? "");
      setImprovement(d.comments?.improvementComment ?? "");
    });
  }, [id]);

  if (!data) return <div className="app-shell" />;

  const grouped = groupByAxis(data.questions);
  const answeredCount = data.questions.filter((q: any) => q.answer).length;
  const allAnswered = answeredCount === data.questions.length;
  const readOnly = !!data.readOnly;

  async function setAnswer(questionId: string, score: number | null, insufficient: boolean) {
    if (readOnly) return;
    setSavingId(questionId);
    try {
      await api.saveAnswer(id!, questionId, score, insufficient);
      setData((prev: any) => ({
        ...prev,
        questions: prev.questions.map((q: any) =>
          q.id === questionId ? { ...q, answer: { score, insufficientInformation: insufficient } } : q
        ),
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  async function onSubmit() {
    setError("");
    setSubmitting(true);
    try {
      await api.submitEvaluation(id!, strength, improvement);
      setDone(true);
      setTimeout(() => navigate("/evaluations"), 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="app-shell items-center justify-center text-center">
        <div className="mb-3 text-4xl">✅</div>
        <p className="font-semibold text-slate-800">ارزیابی با موفقیت ثبت شد</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <button onClick={() => navigate(-1)} className="mb-4 self-start text-sm text-white/70 hover:text-white">
        › بازگشت
      </button>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-white drop-shadow-sm">
          {data.isSelf ? "خودارزیابی" : `ارزیابی ${data.evaluated.name}`}
        </h1>
        <p className="text-xs text-white/70">
          {data.evaluated.roleLabel}
          {!data.isSelf && ` · ${data.relationLabel}`}
        </p>
      </div>

      {readOnly && (
        <div className="card mb-5 !bg-slate-100 text-center">
          <p className="text-sm font-medium text-slate-600">
            {data.status === "COMPLETED" ? "این ارزیابی قبلاً ثبت نهایی شده و فقط قابل مشاهده است." : "دوره‌ی این ارزیابی بسته شده و دیگر قابل ثبت نیست."}
          </p>
        </div>
      )}

      <div className="card mb-5 !bg-brand-50">
        <p className="mb-2 text-xs font-semibold text-brand-700">راهنمای نمره‌دهی</p>
        <div className="flex items-center justify-between text-[11px] text-slate-600">
          {SCORE_LABELS.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span className="text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5 space-y-6">
        {Object.entries(grouped).map(([axis, qs]: [string, any]) => (
          <div key={axis}>
            <h2 className="mb-3 text-sm font-bold text-brand-600">{axis}</h2>
            <div className="space-y-4">
              {qs.map((q: any) => (
                <div key={q.id} className="card">
                  <p className="mb-3 text-sm text-slate-700">{q.text}</p>
                  <div className="mb-2 flex items-center justify-between gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        disabled={readOnly || savingId === q.id || q.answer?.insufficientInformation}
                        onClick={() => setAnswer(q.id, n, false)}
                        className={`flex h-10 flex-1 flex-col items-center justify-center rounded-lg text-xs font-medium transition disabled:opacity-80 ${
                          q.answer?.score === n
                            ? "bg-brand-500 text-white"
                            : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                        }`}
                        title={SCORE_LABELS[n - 1]}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-500">
                    <input
                      type="checkbox"
                      disabled={readOnly}
                      checked={!!q.answer?.insufficientInformation}
                      onChange={(e) => setAnswer(q.id, null, e.target.checked)}
                    />
                    اطلاعات کافی برای پاسخ ندارم
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {(allAnswered || readOnly) && (
        <div className="card mb-6 space-y-3">
          <h2 className="text-sm font-bold text-slate-700">چند کلمه بیشتر</h2>
          <div>
            <label className="mb-1 block text-xs text-slate-500">مهم‌ترین نقطه قوت این فرد چیست؟</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-brand-400 disabled:bg-slate-50"
              rows={2}
              disabled={readOnly}
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">اگر فقط یک مورد در عملکرد او بهتر شود، آن چیست؟</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-brand-400 disabled:bg-slate-50"
              rows={2}
              disabled={readOnly}
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
            />
          </div>
        </div>
      )}

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      {!readOnly && (
        <div className="sticky bottom-4">
          <button className="btn-primary w-full" disabled={!allAnswered || submitting} onClick={onSubmit}>
            {allAnswered
              ? submitting
                ? "در حال ثبت..."
                : "ثبت نهایی ارزیابی"
              : `${answeredCount}/${data.questions.length} سؤال پاسخ داده شده`}
          </button>
        </div>
      )}
    </div>
  );
}

function groupByAxis(questions: any[]) {
  const map: Record<string, any[]> = {};
  for (const q of questions) {
    if (!map[q.axis]) map[q.axis] = [];
    map[q.axis].push(q);
  }
  return map;
}
