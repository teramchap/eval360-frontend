import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { ROLE_LABEL } from "../../lib/labels";

const ROLES = ["EXPERT", "SENIOR_EXPERT", "SUPERVISOR", "MANAGER"];

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[] | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");

  function load() {
    api.adminUsersFull().then(setUsers);
  }
  useEffect(load, []);

  return (
    <div className="app-shell pb-10">
      <button onClick={() => navigate("/admin")} className="mb-4 self-start text-sm text-slate-500">
        › بازگشت به پنل مدیریتی
      </button>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">مدیریت کارمندان و چارت</h1>
      </div>

      <button onClick={() => setShowAdd(true)} className="btn-primary mb-4 w-full">
        + افزودن کارمند جدید
      </button>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <div className="space-y-2">
        {users?.map((u) => (
          <div key={u.id} className="card flex items-center justify-between !p-3">
            <div>
              <p className="text-sm font-medium text-slate-800">
                {u.name} {!u.active && <span className="text-xs text-red-400">(غیرفعال)</span>}
              </p>
              <p className="text-xs text-slate-400">
                {u.personnelCode} · {ROLE_LABEL[u.role]} · {u.unit}
              </p>
            </div>
            <button onClick={() => setEditing(u)} className="btn-outline !py-1.5 text-xs">
              ویرایش
            </button>
          </div>
        ))}
      </div>

      {showAdd && (
        <AddUserModal
          users={users ?? []}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
      {editing && (
        <EditUserModal
          user={editing}
          users={users ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        {children}
      </div>
    </div>
  );
}

function AddUserModal({ users, onClose, onSaved }: { users: any[]; onClose: () => void; onSaved: () => void }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("EXPERT");
  const [unit, setUnit] = useState("");
  const [reportsTo, setReportsTo] = useState("");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.adminCreateUser(code, name, role, unit, reportsTo || null, password);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Overlay>
      <h2 className="mb-4 text-sm font-bold text-slate-800">افزودن کارمند جدید</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          placeholder="کد پرسنلی (مثلاً 1017)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          placeholder="نام و نام خانوادگی"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </select>
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          placeholder="واحد (مثلاً QC)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          required
        />
        <select
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          value={reportsTo}
          onChange={(e) => setReportsTo(e.target.value)}
        >
          <option value="">بدون سرپرست مستقیم (مثلاً خود مدیر واحد)</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({ROLE_LABEL[u.role]})
            </option>
          ))}
        </select>
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          placeholder="رمز عبور اولیه"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-outline flex-1">
            انصراف
          </button>
          <button className="btn-primary flex-1" disabled={busy}>
            {busy ? "در حال ثبت..." : "ثبت کارمند"}
          </button>
        </div>
      </form>
    </Overlay>
  );
}

function EditUserModal({
  user,
  users,
  onClose,
  onSaved,
}: {
  user: any;
  users: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [unit, setUnit] = useState(user.unit);
  const [reportsTo, setReportsTo] = useState(user.reportsToId ?? "");
  const [active, setActive] = useState(user.active);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.adminUpdateUser(user.id, name, role, unit, reportsTo || null, active);
      if (newPassword) await api.adminResetPassword(user.id, newPassword);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Overlay>
      <h2 className="mb-1 text-sm font-bold text-slate-800">ویرایش {user.name}</h2>
      <p className="mb-4 text-xs text-slate-400">کد پرسنلی: {user.personnelCode}</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </select>
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          required
        />
        <select
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          value={reportsTo}
          onChange={(e) => setReportsTo(e.target.value)}
        >
          <option value="">بدون سرپرست مستقیم</option>
          {users
            .filter((u) => u.id !== user.id)
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({ROLE_LABEL[u.role]})
              </option>
            ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          فعال (اگر غیرفعال شود، دیگر در چارت و ارزیابی‌ها ظاهر نمی‌شود)
        </label>
        <input
          type="password"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          placeholder="بازنشانی رمز عبور (اختیاری)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-outline flex-1">
            انصراف
          </button>
          <button className="btn-primary flex-1" disabled={busy}>
            {busy ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </form>
    </Overlay>
  );
}
