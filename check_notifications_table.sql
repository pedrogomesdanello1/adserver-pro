-- Script para verificar a estrutura da tabela notificacoes
-- Execute este código no SQL Editor do Supabase

-- Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'notificacoes'
);

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'notificacoes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notificacoes' AND schemaname = 'public';

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'notificacoes' AND schemaname = 'public';

-- Testar inserção de uma notificação de teste
-- Primeiro, vamos pegar um user_id válido da tabela profiles
INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, dados_extras, lida)
SELECT 
  id, 
  'teste', 
  'Teste de notificação', 
  'Esta é uma notificação de teste', 
  '{"teste": true}'::jsonb, 
  false
FROM profiles 
LIMIT 1;

-- Verificar se a notificação foi inserida
SELECT * FROM notificacoes WHERE tipo = 'teste' ORDER BY created_at DESC LIMIT 1;

-- Limpar notificação de teste
DELETE FROM notificacoes WHERE tipo = 'teste';
