import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Fun() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    api.fun().then((d) => {
      setData(d);
      const map: Record<string, string> = {};
      d.myAnswers.forEach((a: any) => (map[a.questionId] = a.selectedUserId));
      setAnswers(map);
    });
  }, []);

  if (!data) return <div className="app-shell" />;

  async function choose(questionId: string, userId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: userId }));
    setSavingId(questionId);
    try {
      await api.funAnswer(questionId, userId);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="app-shell">
      <button onClick={() => navigate(-1)} className="mb-4 self-start text-sm text-white/70 hover:text-white">
        › بازگشت
      </button>
      <h1 className="mb-1 text-lg font-bold text-white drop-shadow-sm">حالا یکم جدی نباشیم! 😄</h1>
      <p className="mb-5 text-xs text-white/70">
        این بخش کاملاً اختیاری است و هیچ تأثیری در امتیاز عملکردی ندارد.
      </p>

      {!data.cycleId ? (
        <div className="card text-center text-sm text-slate-500">دوره فعالی برای این بخش وجود ندارد.</div>
      ) : (
        <div className="space-y-4">
          {data.questions.map((q: any) => (
            <div key={q.id} className="card">
              <p className="mb-3 text-sm text-slate-700">{q.text}</p>
              <select
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
                value={answers[q.id] ?? ""}
                onChange={(e) => choose(q.id, e.target.value)}
                disabled={savingId === q.id}
              >
                <option value="" disabled>
                  انتخاب کنید...
                </option>
                {data.candidates.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
