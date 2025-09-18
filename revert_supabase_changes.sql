-- Script para reverter todas as mudanças feitas no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Remover a coluna status se ela existir
ALTER TABLE demandas DROP COLUMN IF EXISTS status;

-- 2. Remover a constraint de status se ela existir
ALTER TABLE demandas DROP CONSTRAINT IF EXISTS check_status;

-- 3. Remover o índice de status se ele existir
DROP INDEX IF EXISTS idx_demandas_status;

-- 4. Remover a coluna updated_at se ela existir
ALTER TABLE demandas DROP COLUMN IF EXISTS updated_at;

-- 5. Remover a coluna last_edited_by se ela existir
ALTER TABLE demandas DROP COLUMN IF EXISTS last_edited_by;

-- 6. Remover triggers problemáticos
DROP TRIGGER IF EXISTS trigger_update_last_edited_by ON demandas CASCADE;
DROP TRIGGER IF EXISTS update_last_edited_by_trigger ON demandas CASCADE;

-- 7. Remover funções problemáticas
DROP FUNCTION IF EXISTS update_last_edited_by() CASCADE;

-- 8. Verificar se a tabela demandas está funcionando
SELECT COUNT(*) as total_demandas FROM demandas;

-- 9. Verificar estrutura da tabela demandas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'demandas' 
ORDER BY ordinal_position;
