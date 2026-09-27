import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { ROLE_LABEL } from "../../lib/labels";

const ROLE_COLOR: Record<string, string> = {
  MANAGER: "bg-brand-500",
  SUPERVISOR: "bg-plum-500",
  SENIOR_EXPERT: "bg-mint-500",
  EXPERT: "bg-amber-400",
};

interface UserNode {
  id: string;
  name: string;
  role: string;
  unit: string;
  avatarUrl: string | null;
  reportsToId: string | null;
  active: boolean;
  children: UserNode[];
}

function buildTree(users: any[]): UserNode[] {
  const byId = new Map<string, UserNode>();
  users.forEach((u) => byId.set(u.id, { ...u, children: [] }));
  const roots: UserNode[] = [];
  byId.forEach((u) => {
    if (u.reportsToId && byId.has(u.reportsToId)) {
      byId.get(u.reportsToId)!.children.push(u);
    } else {
      roots.push(u);
    }
  });
  return roots;
}

function NodeCard({ node, depth }: { node: UserNode; depth: number }) {
  return (
    <div style={{ marginRight: depth > 0 ? 20 : 0 }}>
      <div className="mb-2 flex items-center gap-2 rounded-xl bg-white/95 p-2.5 shadow-card">
        <span className={`h-2 w-2 shrink-0 rounded-full ${ROLE_COLOR[node.role]}`} />
        {node.avatarUrl ? (
          <img src={node.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">
            {node.name?.[0]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800">
            {node.name} {!node.active && <span className="text-[10px] text-red-400">(غیرفعال)</span>}
          </p>
          <p className="text-[11px] text-slate-400">
            {ROLE_LABEL[node.role]} · {node.unit}
          </p>
        </div>
      </div>
      {node.children.length > 0 && (
        <div className="border-r-2 border-slate-200/70 pr-3">
          {node.children.map((c) => (
            <NodeCard key={c.id} node={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrgChart() {
  const navigate = useNavigate();
  const [tree, setTree] = useState<UserNode[] | null>(null);

  useEffect(() => {
    api.adminUsersFull().then((users) => setTree(buildTree(users)));
  }, []);

  return (
    <div className="app-shell pb-10">
      <button onClick={() => navigate("/admin")} className="mb-4 self-start text-sm text-white/70 hover:text-white">
        › بازگشت به پنل مدیریتی
      </button>
      <h1 className="mb-1 text-lg font-bold text-white drop-shadow-sm">چارت سازمانی</h1>
      <p className="mb-5 text-sm text-white/75">ساختار فعلی گزارش‌دهی، همانی که روابط ارزیابی از روی آن ساخته می‌شود</p>

      <div className="mb-4 flex flex-wrap gap-3 rounded-xl bg-white/90 p-3 text-[11px] text-slate-600">
        {Object.entries(ROLE_LABEL).map(([role, label]) => (
          <span key={role} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${ROLE_COLOR[role]}`} /> {label}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        {tree?.map((root) => (
          <NodeCard key={root.id} node={root} depth={0} />
        ))}
      </div>
      {tree?.length === 0 && <p className="text-center text-sm text-white/70">هنوز کارمندی ثبت نشده است.</p>}
    </div>
  );
}
