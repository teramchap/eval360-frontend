import { supabase, personnelCodeToEmail } from "./supabase";
import { ROLE_LABEL, RELATION_LABEL, STATUS_LABEL } from "./labels";

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message || "خطایی رخ داد. لطفاً دوباره تلاش کنید.");
  return data as T;
}

export const api = {
  login: async (personnelCode: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: personnelCodeToEmail(personnelCode),
      password,
    });
    if (error) throw new Error("شماره پرسنلی یا رمز عبور اشتباه است.");
  },
  logout: () => supabase.auth.signOut(),

  me: async () => {
    const u = await rpc<any>("get_my_profile");
    return { ...u, roleLabel: ROLE_LABEL[u.role] };
  },
  notifications: async () => {
    const d = await rpc<any>("get_my_evaluations");
    const notifications: { text: string }[] = [];
    if (!d.cycle) return { notifications };
    if (d.summary?.remaining > 0) notifications.push({ text: `${d.summary.remaining} ارزیابی برای شما باقی مانده است.` });
    if (d.selfEvaluation && d.selfEvaluation.status !== "COMPLETED")
      notifications.push({ text: "خودارزیابی دوره جاری هنوز تکمیل نشده است." });
    return { notifications };
  },
  myEvaluations: async () => {
    const d = await rpc<any>("get_my_evaluations");
    if (!d.cycle) return d;
    return {
      ...d,
      selfEvaluation: d.selfEvaluation
        ? { ...d.selfEvaluation, statusLabel: STATUS_LABEL[d.selfEvaluation.status] }
        : null,
      people: (d.people ?? []).map((p: any) => ({
        ...p,
        roleLabel: ROLE_LABEL[p.role],
        relationLabel: RELATION_LABEL[p.relationType],
        statusLabel: STATUS_LABEL[p.status],
      })),
    };
  },
  evaluationDetail: async (id: string) => {
    const d = await rpc<any>("get_evaluation_detail", { p_evaluation_id: id });
    return {
      ...d,
      evaluated: { ...d.evaluated, roleLabel: ROLE_LABEL[d.evaluated.role] },
      relationLabel: RELATION_LABEL[d.relationType],
    };
  },
  saveAnswer: (id: string, questionId: string, score: number | null, insufficientInformation: boolean) =>
    rpc<void>("save_answer", { p_evaluation_id: id, p_question_id: questionId, p_score: score, p_insufficient: insufficientInformation }),
  submitEvaluation: (id: string, strengthComment: string, improvementComment: string) =>
    rpc<{ ok: true; message: string }>("submit_evaluation", {
      p_evaluation_id: id,
      p_strength: strengthComment,
      p_improvement: improvementComment,
    }),

  fun: () => rpc<any>("get_fun_data"),
  funAnswer: (questionId: string, selectedUserId: string) =>
    rpc<void>("save_fun_answer", { p_question_id: questionId, p_selected_user_id: selectedUserId }),

  updateProfile: (email: string, phone: string) => rpc<any>("update_my_profile", { p_email: email, p_phone: phone }),
  changePassword: async (_currentPassword: string, newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  },

  adminUsers: () => rpc<any[]>("admin_list_users"),
  adminCycles: () => rpc<any[]>("admin_list_cycles"),
  adminCreateCycle: (title: string, startDate: string, endDate: string) =>
    rpc<any>("admin_create_cycle", { p_title: title, p_start: startDate, p_end: endDate }),
  adminActivateCycle: (id: string) => rpc<any>("admin_activate_cycle", { p_cycle_id: id }),
  adminCloseCycle: (id: string) => rpc<any>("admin_close_cycle", { p_cycle_id: id }),
  adminDashboard: async (cycleId: string) => {
    const d = await rpc<any>("admin_get_dashboard", { p_cycle_id: cycleId });
    return { ...d, people: (d.people ?? []).map((p: any) => ({ ...p, roleLabel: ROLE_LABEL[p.role] })) };
  },
  adminReport: async (cycleId: string, userId: string) => {
    const d = await rpc<any>("admin_get_person_report", { p_cycle_id: cycleId, p_user_id: userId });
    return { ...d, groups: (d.groups ?? []).map((g: any) => ({ ...g, relationLabel: RELATION_LABEL[g.relationType] })) };
  },
  adminTeamReport: (cycleId: string) => rpc<any>("admin_get_team_report", { p_cycle_id: cycleId }),
  adminFunReport: (cycleId: string) => rpc<any>("admin_get_fun_report", { p_cycle_id: cycleId }),
};
