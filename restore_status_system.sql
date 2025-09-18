-- Script para restaurar o sistema de status das demandas
-- Execute este código no SQL Editor do Supabase

-- 1. Adicionar a coluna 'status' se ela não existir
ALTER TABLE demandas ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pendente_visualizacao';

-- 2. Atualizar todas as demandas existentes para ter um status padrão
UPDATE demandas SET status = 'pendente_visualizacao' WHERE status IS NULL;

-- 3. Adicionar a constraint CHECK para garantir que apenas os status válidos sejam permitidos
ALTER TABLE demandas DROP CONSTRAINT IF EXISTS check_status;
ALTER TABLE demandas ADD CONSTRAINT check_status 
CHECK (status IN ('pendente_visualizacao', 'visualizada', 'em_producao', 'finalizada'));

-- 4. Criar índice para a coluna status para melhor performance em filtros
CREATE INDEX IF NOT EXISTS idx_demandas_status ON demandas(status);

-- 5. Verificar os status atuais (opcional, para depuração)
SELECT status, COUNT(*) FROM demandas GROUP BY status;
