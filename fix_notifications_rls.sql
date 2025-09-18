-- Corrigir políticas RLS da tabela notificacoes
-- Execute este script no SQL Editor do Supabase

-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON notificacoes;
DROP POLICY IF EXISTS "Usuários podem marcar suas notificações como lidas" ON notificacoes;
DROP POLICY IF EXISTS "Sistema pode criar notificações" ON notificacoes;

-- Criar políticas mais permissivas para funcionar corretamente
CREATE POLICY "Permitir leitura de notificações para usuários autenticados" ON notificacoes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Permitir inserção de notificações para usuários autenticados" ON notificacoes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de notificações para usuários autenticados" ON notificacoes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Permitir exclusão de notificações para usuários autenticados" ON notificacoes
  FOR DELETE USING (auth.uid() = user_id);

-- Verificar se RLS está habilitado
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notificacoes' AND schemaname = 'public';
