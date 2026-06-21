import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://trjmensppswoupdedaxs.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyam1lbnNwcHN3b3VwZGVkYXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NDgyMDIsImV4cCI6MjA5MTIyNDIwMn0.7ctwfHjkMVTMB5rc9u4G3Cn9GbLdXBjN22sd_fh8_Rk"

export const supabase = createClient(supabaseUrl, supabaseKey)