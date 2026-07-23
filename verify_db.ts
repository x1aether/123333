
import { insertOne, findOneBy } from './src/lib/db';

async function verifyOrderFlow() {
  const order = {'id': 'f409acce-6389-4dd5-8981-03638182a3a4', 'customer_name': 'Verification Test User', 'total_amount': 299.99, 'status': 'pending', 'items': [{'product_id': '1', 'quantity': 1, 'price': 299.99}], 'created_at': '2026-07-23T17:50:00.366644'};
  try {
    await insertOne('orders', order);
    console.log('✅ Order successfully inserted into Supabase.');
    
    const fetched = await findOneBy('orders', { id: 'f409acce-6389-4dd5-8981-03638182a3a4' });
    if (fetched) {
      console.log('✅ Order retrieved successfully from DB.');
    } else {
      console.log('❌ Order could not be found after insertion.');
    }
  } catch (e) {
    console.error('❌ Database error:', e.message);
  }
}
