import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = 'https://cofjdiwflmxwcbmlctzi.supabase.co';
const supabaseKey = 'sb_publishable_Hhu1_8Mm3_4403DNxKTkZQ_GKL2RwBa';
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: WebSocket }
});

async function runTest() {
  console.log('Testing select groups...');
  const res = await supabase.from('groups').select('*');
  console.log('Select Error:', res.error);
  console.log('Select Data count:', res.data ? res.data.length : 0);
}
runTest();
