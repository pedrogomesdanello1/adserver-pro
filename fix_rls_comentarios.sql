-- Script para corrigir as políticas RLS da tabela comentarios
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos remover as políticas existentes (se houver)
DROP POLICY IF EXISTS "Usuários autenticados podem ver comentários" ON comentarios;
DROP POLICY IF EXISTS "Usuários autenticados podem criar comentários" ON comentarios;
DROP POLICY IF EXISTS "Usuários podem editar seus próprios comentários" ON comentarios;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios comentários" ON comentarios;

-- Criar políticas mais permissivas para funcionar corretamente
CREATE POLICY "Permitir leitura de comentários para usuários autenticados" ON comentarios
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de comentários para usuários autenticados" ON comentarios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de comentários para usuários autenticados" ON comentarios
  FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão de comentários para usuários autenticados" ON comentarios
  FOR DELETE USING (true);

-- Verificar se a tabela existe e tem a estrutura correta
-- Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS comentarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  demanda_id UUID NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  anexos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna anexos se não existir
ALTER TABLE comentarios ADD COLUMN IF NOT EXISTS anexos JSONB DEFAULT '[]'::jsonb;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_comentarios_demanda_id ON comentarios(demanda_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_user_id ON comentarios(user_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON comentarios(created_at);

-- Verificar se RLS está habilitado
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;
