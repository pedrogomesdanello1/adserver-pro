-- Script para verificar a estrutura da tabela profiles
-- Execute este código no SQL Editor do Supabase

-- Verificar se a tabela profiles existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'profiles'
);

-- Verificar estrutura da tabela profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar alguns registros de exemplo
SELECT id, email, raw_user_meta_data, full_name
FROM profiles 
LIMIT 5;

-- Verificar se há usuários cadastrados
SELECT COUNT(*) as total_usuarios FROM profiles;

-- Verificar estrutura do raw_user_meta_data
SELECT 
  id, 
  email,
  raw_user_meta_data,
  jsonb_pretty(raw_user_meta_data) as meta_data_formatado
FROM profiles 
WHERE raw_user_meta_data IS NOT NULL
LIMIT 3;
