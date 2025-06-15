
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting daily lending interest processing...')

    // Get all active lending positions
    const { data: lendingPositions, error: fetchError } = await supabase
      .from('user_lending')
      .select(`
        *,
        crypto:cryptocurrencies(
          id,
          name,
          symbol,
          current_price
        )
      `)
      .eq('status', 'active')

    if (fetchError) {
      console.error('Error fetching lending positions:', fetchError)
      throw fetchError
    }

    console.log(`Found ${lendingPositions?.length || 0} active lending positions`)

    const today = new Date().toISOString().split('T')[0]
    const processedPayments = []

    // Check if payments were already processed today
    const { data: existingPayments } = await supabase
      .from('lending_interest_payments')
      .select('user_lending_id')
      .eq('payment_date', today)

    const processedIds = new Set(existingPayments?.map(p => p.user_lending_id) || [])

    for (const position of lendingPositions || []) {
      // Skip if already processed today
      if (processedIds.has(position.id)) {
        console.log(`Skipping already processed position: ${position.id}`)
        continue
      }

      try {
        // Calculate daily interest
        const dailyRate = position.annual_interest_rate / 365
        const dailyInterest = position.amount_lent * dailyRate
        
        console.log(`Processing position ${position.id}: ${dailyInterest} ${position.crypto.symbol} interest`)

        // Round to 8 decimal places for crypto precision
        const roundedInterest = Math.round(dailyInterest * 100000000) / 100000000

        if (roundedInterest <= 0) {
          console.log(`Skipping zero interest for position: ${position.id}`)
          continue
        }

        // Create transaction record
        const { data: transaction, error: transactionError } = await supabase
          .from('transaction_history')
          .insert({
            user_id: position.user_id,
            cryptocurrency_id: position.cryptocurrency_id,
            transaction_type: 'lending_interest',
            amount: roundedInterest,
            usd_value: roundedInterest * (position.crypto.current_price || 0),
            status: 'completed',
            description: `Daily lending interest: ${roundedInterest} ${position.crypto.symbol}`
          })
          .select()
          .single()

        if (transactionError) {
          console.error(`Error creating transaction for position ${position.id}:`, transactionError)
          continue
        }

        // Create interest payment record
        const { error: paymentError } = await supabase
          .from('lending_interest_payments')
          .insert({
            user_lending_id: position.id,
            user_id: position.user_id,
            cryptocurrency_id: position.cryptocurrency_id,
            interest_amount: roundedInterest,
            payment_date: today,
            transaction_id: transaction.id
          })

        if (paymentError) {
          console.error(`Error creating payment record for position ${position.id}:`, paymentError)
          continue
        }

        // Update lending position with new total interest earned
        const newTotalInterest = position.total_interest_earned + roundedInterest
        const { error: updateError } = await supabase
          .from('user_lending')
          .update({
            total_interest_earned: newTotalInterest,
            amount_lent: position.amount_lent + roundedInterest, // Compound the interest
            updated_at: new Date().toISOString()
          })
          .eq('id', position.id)

        if (updateError) {
          console.error(`Error updating lending position ${position.id}:`, updateError)
          continue
        }

        processedPayments.push({
          positionId: position.id,
          userId: position.user_id,
          symbol: position.crypto.symbol,
          interestAmount: roundedInterest,
          usdValue: roundedInterest * (position.crypto.current_price || 0)
        })

        console.log(`Successfully processed interest payment for position ${position.id}`)
        
      } catch (error) {
        console.error(`Error processing position ${position.id}:`, error)
        continue
      }
    }

    console.log(`Daily lending interest processing completed. Processed ${processedPayments.length} payments.`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processedPayments.length} interest payments`,
        payments: processedPayments,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in daily lending interest processing:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
