import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = 'https://cofjdiwflmxwcbmlctzi.supabase.co';
const supabaseKey = 'sb_publishable_Hhu1_8Mm3_4403DNxKTkZQ_GKL2RwBa';
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: WebSocket }
});

async function runTest() {
  console.log('Testing insert...');
  const res = await supabase.from('groups').upsert({ id: 'grp-test1', name: 'Test Group', grade: '1', section: 'A' }).select();
  console.log('Insert Error:', res.error);
  console.log('Insert Data:', res.data);
  
  console.log('Testing select...');
  const res2 = await supabase.from('groups').select('*');
  console.log('Select Error:', res2.error);
  console.log('Select Data:', res2.data);
}
runTest();
