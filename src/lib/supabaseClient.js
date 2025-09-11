import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://seiebvksmpugjvlmzjsc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlaWVidmtzbXB1Z2p2bG16anNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzU2NjQsImV4cCI6MjA3MzExMTY2NH0.fdDyYgPkLDUoDAQDlFq6X2jLhjQzL_RXQ32ttx9CjLw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)