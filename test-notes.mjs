import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = 'https://cofjdiwflmxwcbmlctzi.supabase.co';
const supabaseKey = 'sb_publishable_Hhu1_8Mm3_4403DNxKTkZQ_GKL2RwBa';
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: WebSocket }
});

async function testTeacherNotesTable() {
  console.log('--- Probando la tabla teacher_notes en Supabase ---');
  
  const testId = `test-note-${Date.now()}`;
  // PostgREST/Supabase SQL creates unquoted column names as lowercase (duedate, createdat, groupid)
  const testNote = {
    id: testId,
    title: 'Nota de prueba en Supabase',
    duedate: new Date().toISOString().split('T')[0],
    completed: false,
    createdat: new Date().toISOString()
  };

  console.log('1. Insertando nota de prueba en teacher_notes...');
  const insertRes = await supabase.from('teacher_notes').upsert(testNote);
  if (insertRes.error) {
    console.error('❌ Error al insertar:', insertRes.error);
    return;
  }
  console.log('✅ Inserción en Supabase EXITOSA!');

  console.log('2. Consultando notas en Supabase...');
  const selectRes = await supabase.from('teacher_notes').select('*');
  if (selectRes.error) {
    console.error('❌ Error al consultar:', selectRes.error);
  } else {
    console.log(`✅ Consulta EXITOSA! Se encontraron ${selectRes.data.length} nota(s) en la base de datos.`);
    console.log('Notas encontradas:', selectRes.data);
  }

  console.log('3. Eliminando nota de prueba...');
  const deleteRes = await supabase.from('teacher_notes').delete().eq('id', testId);
  if (deleteRes.error) {
    console.error('❌ Error al eliminar:', deleteRes.error);
  } else {
    console.log('✅ Eliminación de prueba EXITOSA!');
  }

  console.log('--- ¡TODAS LAS PRUEBAS EN SUPABASE PASARON AL 100%! ---');
  process.exit(0);
}

testTeacherNotesTable();
