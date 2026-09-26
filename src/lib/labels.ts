export const ROLE_LABEL: Record<string, string> = {
  EXPERT: "کارشناس",
  SENIOR_EXPERT: "کارشناس ارشد",
  SUPERVISOR: "سرپرست",
  MANAGER: "مدیر واحد",
};

export const RELATION_LABEL: Record<string, string> = {
  SELF: "خود",
  MANAGER: "مدیر",
  SUPERVISOR: "سرپرست",
  DIRECT_SENIOR_EXPERT: "کارشناس ارشد مستقیم",
  DIRECT_SUBORDINATE: "زیرمجموعه مستقیم",
  PEER: "هم‌گروهی",
  OTHER_SENIOR_EXPERT: "سایر کارشناسان ارشد",
  OTHER_COLLEAGUE: "سایر همکاران",
  OTHER_MANAGEMENT_PEER: "سایر همکاران مدیریتی",
  OTHER_RELATED: "سایر افراد مرتبط",
};

export const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "شروع نشده",
  IN_PROGRESS: "در حال تکمیل",
  COMPLETED: "تکمیل شده",
};
