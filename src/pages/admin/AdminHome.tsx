import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import JalaliDateField from "../../components/JalaliDateField";
import { isoToJalaliDisplay, jalaliPartsToIso, today } from "../../lib/jalali";

const STATUS_LABEL: Record<string, string> = { DRAFT: "پیش‌نویس", ACTIVE: "فعال", CLOSED: "بسته‌شده" };
const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-500",
  ACTIVE: "bg-mint-50 text-mint-500",
  CLOSED: "bg-slate-100 text-slate-400",
};

export default function AdminHome() {
  const navigate = useNavigate();
  const [cycles, setCycles] = useState<any[] | null>(null);
  const [title, setTitle] = useState("");
  const t = today();
  const [startDate, setStartDate] = useState(t);
  const [endDate, setEndDate] = useState(t);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    api.adminCycles().then(setCycles);
  }
  useEffect(load, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    const startIso = jalaliPartsToIso(startDate.jy, startDate.jm, startDate.jd);
    const endIso = jalaliPartsToIso(endDate.jy, endDate.jm, endDate.jd);
    if (endIso <= startIso) {
      setError("تاریخ پایان باید بعد از تاریخ شروع باشد.");
      return;
    }
    setBusy(true);
    try {
      await api.adminCreateCycle(title, startIso, endIso);
      setTitle("");
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }


  async function onActivate(id: string) {
    setError("");
    try {
      await api.adminActivateCycle(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function onClose(id: string) {
    await api.adminCloseCycle(id);
    load();
  }

  return (
    <div className="app-shell pb-10">
      <button onClick={() => navigate("/profile")} className="mb-4 self-start text-sm text-white/70 hover:text-white">
        › بازگشت به پروفایل
      </button>
      <h1 className="mb-1 text-lg font-bold text-white drop-shadow-sm">پنل مدیریتی</h1>
      <p className="mb-5 text-sm text-white/75">ساخت و مدیریت دوره‌های ارزیابی</p>

      <Link to="/admin/users" className="card mb-4 flex items-center justify-between bg-plum-50">
        <div>
          <p className="text-sm font-semibold text-plum-700">مدیریت کارمندان و چارت</p>
          <p className="text-xs text-slate-500">افزودن کارمند جدید، ویرایش نقش/سرپرست، بازنشانی رمز</p>
        </div>
        <span className="text-plum-400">‹</span>
      </Link>

      <Link to="/admin/org-chart" className="card mb-6 flex items-center justify-between bg-brand-50">
        <div>
          <p className="text-sm font-semibold text-brand-700">نمایش چارت سازمانی</p>
          <p className="text-xs text-slate-500">ساختار فعلی گزارش‌دهی را به‌صورت درختی ببینید</p>
        </div>
        <span className="text-brand-400">‹</span>
      </Link>

      <form onSubmit={onCreate} className="card mb-6 space-y-3">
        <h2 className="text-sm font-bold text-slate-700">ساخت دوره جدید</h2>
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          placeholder="عنوان دوره — مثلاً دوره پاییز ۱۴۰۴"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <JalaliDateField label="تاریخ شروع دوره" value={startDate} onChange={setStartDate} />
          <JalaliDateField label="تاریخ پایان دوره" value={endDate} onChange={setEndDate} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "در حال ساخت..." : "ساخت دوره"}
        </button>
      </form>

      <h2 className="mb-3 text-sm font-bold text-slate-700">دوره‌ها</h2>
      <div className="space-y-3">
        {cycles?.map((c) => (
          <div key={c.id} className="card">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">{c.title}</p>
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${STATUS_STYLE[c.status]}`}>
                {STATUS_LABEL[c.status]}
              </span>
            </div>
            <p className="mb-3 text-xs text-slate-400">
              از {isoToJalaliDisplay(c.startDate)} تا {isoToJalaliDisplay(c.endDate)}
            </p>
            <div className="flex gap-2">
              {c.status === "DRAFT" && (
                <button onClick={() => onActivate(c.id)} className="btn-primary flex-1 !py-1.5 text-xs">
                  فعال‌سازی دوره
                </button>
              )}
              {c.status === "ACTIVE" && (
                <>
                  <Link to={`/admin/cycles/${c.id}`} className="btn-primary flex-1 !py-1.5 text-center text-xs">
                    مشاهده داشبورد
                  </Link>
                  <button onClick={() => onClose(c.id)} className="btn-outline !py-1.5 text-xs">
                    بستن دوره
                  </button>
                </>
              )}
              {c.status === "CLOSED" && (
                <Link to={`/admin/cycles/${c.id}`} className="btn-outline flex-1 !py-1.5 text-center text-xs">
                  مشاهده گزارش‌ها
                </Link>
              )}
            </div>
          </div>
        ))}
        {cycles?.length === 0 && <p className="text-center text-sm text-slate-400">هنوز دوره‌ای ساخته نشده است.</p>}
      </div>
    </div>
  );
}
