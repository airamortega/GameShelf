// server/api/cron.ts
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('global_stats')
    .update({ 
      last_updated: new Date().toISOString(),
      status: 'updated_by_cron',
      data: { message: 'Actualización semanal completada' }
    })
    .eq('id', true) 

  if (error) throw error

  return { success: true, updated: data }
})