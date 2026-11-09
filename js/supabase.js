// ใช้ Publishable key เท่านั้นใน Frontend ห้ามใส่ service_role / secret key
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://lahvuzadzfovriptiowy.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_wH7jB6xi16UlExcVlKOwMg_4nTTg0WX';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
