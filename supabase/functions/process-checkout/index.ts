import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { corsHeaders } from '../_shared/cors.ts';

interface CheckoutRequest {
  cart: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  user_id: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  total_amount: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CheckoutRequest = await req.json();
    const { cart, user_id, customer_name, customer_phone, total_amount } = body;

    console.log('Processing checkout:', { cart_items: cart.length, user_id, total_amount });

    // Validate input
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty or invalid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role for atomic operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Validate stock availability and update atomically
    const stockUpdates = [];
    const insufficientStock = [];

    for (const item of cart) {
      console.log(`Checking stock for product ${item.id}, quantity: ${item.quantity}`);
      
      // First, get current stock
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock, name')
        .eq('id', item.id)
        .single();

      if (!currentProduct) {
        console.error(`Product not found: ${item.id}`);
        insufficientStock.push({
          product_id: item.id,
          product_name: item.name,
          requested: item.quantity,
          available: 0
        });
        continue;
      }

      // Check if sufficient stock
      if (currentProduct.stock < item.quantity) {
        console.error(`Insufficient stock for ${item.name}: available ${currentProduct.stock}, requested ${item.quantity}`);
        insufficientStock.push({
          product_id: item.id,
          product_name: currentProduct.name,
          requested: item.quantity,
          available: currentProduct.stock
        });
        continue;
      }

      // Atomic stock update
      const newStock = currentProduct.stock - item.quantity;
      const { data: updatedProduct, error: stockError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.id)
        .select()
        .single();

      if (stockError || !updatedProduct) {
        console.error(`Stock update failed for product ${item.id}:`, stockError);
        insufficientStock.push({
          product_id: item.id,
          product_name: currentProduct.name,
          requested: item.quantity,
          available: currentProduct.stock
        });
      } else {
        stockUpdates.push({ 
          product_id: item.id, 
          old_stock: currentProduct.stock, 
          new_stock: updatedProduct.stock 
        });
        console.log(`Stock updated for ${item.name}: ${currentProduct.stock} -> ${updatedProduct.stock}`);
      }
    }

    // If any product has insufficient stock, rollback all stock updates
    if (insufficientStock.length > 0) {
      console.error('Insufficient stock detected, rolling back updates:', insufficientStock);
      
      // Rollback stock updates
      for (const update of stockUpdates) {
        await supabase
          .from('products')
          .update({ stock: update.old_stock })
          .eq('id', update.product_id);
      }

      return new Response(
        JSON.stringify({ 
          error: 'Insufficient stock',
          details: insufficientStock 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Insert transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id,
        customer_name: customer_name || null,
        customer_phone: customer_phone || null,
        total_amount,
        items: cart
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction insert failed:', transactionError);
      
      // Rollback stock updates
      for (const update of stockUpdates) {
        await supabase
          .from('products')
          .update({ stock: update.old_stock })
          .eq('id', update.product_id);
      }

      throw transactionError;
    }

    console.log('Transaction completed successfully:', transaction.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        transaction_id: transaction.id,
        stock_updates: stockUpdates
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in process-checkout:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
