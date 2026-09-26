import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Fun() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

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
    await api.funAnswer(questionId, userId);
  }

  return (
    <div className="app-shell">
      <button onClick={() => navigate(-1)} className="mb-4 self-start text-sm text-slate-500">
        › بازگشت
      </button>
      <div className="mb-1 flex items-center gap-2">
        <h1 className="text-lg font-bold text-slate-800">حالا یکم جدی نباشیم! 😄</h1>
      </div>
      <p className="mb-5 text-xs text-slate-400">
        این بخش کاملاً اختیاری است و هیچ تأثیری در امتیاز عملکردی ندارد.
      </p>

      <div className="space-y-5">
        {data.questions.map((q: any) => (
          <div key={q.id} className="card">
            <p className="mb-3 text-sm text-slate-700">{q.text}</p>
            <div className="flex flex-wrap gap-2">
              {data.candidates.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => choose(q.id, c.id)}
                  className={`rounded-full px-3 py-1.5 text-xs transition ${
                    answers[q.id] === c.id ? "bg-amber-400 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
