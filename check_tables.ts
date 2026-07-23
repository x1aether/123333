
import { supabase } from './src/lib/db';

async function checkTables() {
  const tables = ['products', 'orders', 'users', 'coupons'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${table}' check failed: ${error.message}`);
    } else {
      console.log(`✅ Table '${table}' exists and is accessible.`);
    }
  }
}
checkTables();
