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

  function load() {
    api.adminUsersFull().then(setUsers);
  }
  useEffect(load, []);

  return (
    <div className="app-shell pb-10">
      <button onClick={() => navigate("/admin")} className="mb-4 self-start text-sm text-white/70 hover:text-white">
        › بازگشت به پنل مدیریتی
      </button>
      <h1 className="mb-5 text-lg font-bold text-white drop-shadow-sm">مدیریت کارمندان و چارت</h1>

      <button onClick={() => setShowAdd(true)} className="btn-primary mb-4 w-full">
        + افزودن کارمند جدید
      </button>

      <div className="space-y-2">
        {users?.map((u) => (
          <div key={u.id} className="card flex items-center justify-between !p-3">
            <div className="flex items-center gap-3">
              {u.avatarUrl ? (
                <img src={u.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                  {u.name?.[0]}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {u.name} {!u.active && <span className="text-xs text-red-400">(غیرفعال)</span>}
                </p>
                <p className="text-xs text-slate-400">
                  {u.personnelCode} · {ROLE_LABEL[u.role]} · {u.unit}
                </p>
              </div>
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
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const created = await api.adminCreateUser(code, name, role, unit, reportsTo || null, password);
      if (photo) {
        const url = await api.uploadAvatar(created.id, photo);
        await api.adminSetAvatar(created.id, url);
      }
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
        <div>
          <label className="mb-1.5 block text-sm text-slate-600">عکس پروفایل (اختیاری)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
          />
          <p className="mt-1 text-xs text-slate-400">بعداً فقط خود کارمند می‌تواند این عکس را عوض کند.</p>
        </div>
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
  const [code, setCode] = useState(user.personnelCode);
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [unit, setUnit] = useState(user.unit);
  const [reportsTo, setReportsTo] = useState(user.reportsToId ?? "");
  const [active, setActive] = useState(user.active);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.adminUpdateUser(user.id, code, name, role, unit, reportsTo || null, active);
      if (newPassword) await api.adminResetPassword(user.id, newPassword);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    setError("");
    setDeleting(true);
    try {
      await api.adminDeleteUser(user.id);
      onSaved();
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <Overlay>
      <div className="mb-4 flex items-center gap-3">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
            {user.name?.[0]}
          </div>
        )}
        <div>
          <h2 className="text-sm font-bold text-slate-800">ویرایش {user.name}</h2>
          <p className="text-xs text-slate-400">عکس پروفایل فقط توسط خود کارمند قابل تغییر است</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-slate-500">کد پرسنلی</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
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

      <div className="mt-4 border-t border-slate-100 pt-4">
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="w-full text-center text-xs text-red-500">
            حذف این کارمند
          </button>
        ) : (
          <div className="rounded-xl bg-red-50 p-3 text-center">
            <p className="mb-2 text-xs text-red-600">
              مطمئنی؟ اگر این فرد سابقه ارزیابی داشته باشد، حذف رد می‌شود و باید غیرفعالش کنی.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="btn-outline flex-1 !py-1.5 text-xs">
                انصراف
              </button>
              <button
                onClick={onDelete}
                disabled={deleting}
                className="flex-1 rounded-full bg-red-500 py-1.5 text-xs font-medium text-white"
              >
                {deleting ? "در حال حذف..." : "بله، حذف کن"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}
