-- Script simples para verificar as tabelas
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar se a tabela notificacoes existe
SELECT 'Tabela notificacoes existe:' as info, EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'notificacoes'
) as existe;

-- 2. Verificar se a tabela profiles existe
SELECT 'Tabela profiles existe:' as info, EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'profiles'
) as existe;

-- 3. Contar usuários na tabela profiles
SELECT 'Total de usuários:' as info, COUNT(*) as total FROM profiles;

-- 4. Verificar estrutura da tabela notificacoes
SELECT 'Colunas da tabela notificacoes:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns
WHERE table_name = 'notificacoes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar estrutura da tabela profiles
SELECT 'Colunas da tabela profiles:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar alguns usuários de exemplo
SELECT 'Usuários de exemplo:' as info;
SELECT id, email, raw_user_meta_data->>'full_name' as full_name, raw_user_meta_data->>'name' as name
FROM profiles 
LIMIT 3;
