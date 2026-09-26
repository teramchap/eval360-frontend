import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://edhrguwpnohbjxjfgssq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_bqxlsWwRToMBrt2NhoPhwA_9r798lt9";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/** کد پرسنلی به ایمیل مصنوعی‌ای که موقع seed کردن کاربران ساختیم تبدیل می‌شود */
export function personnelCodeToEmail(code: string) {
  return `${code.trim()}@eval360.local`;
}
