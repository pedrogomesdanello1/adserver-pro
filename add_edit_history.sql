-- Script para adicionar histórico de edição às demandas
-- Execute este código no SQL Editor do Supabase

-- 1. Adicionar coluna 'last_edited_by' se ela não existir
ALTER TABLE demandas ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES auth.users(id);

-- 2. Adicionar coluna 'updated_at' se ela não existir
ALTER TABLE demandas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Criar trigger para atualizar 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Criar trigger para atualizar 'last_edited_by' automaticamente
CREATE OR REPLACE FUNCTION update_last_edited_by_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_edited_by = auth.uid();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Aplicar triggers na tabela demandas
DROP TRIGGER IF EXISTS update_demandas_updated_at ON demandas;
CREATE TRIGGER update_demandas_updated_at
    BEFORE UPDATE ON demandas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_demandas_last_edited_by ON demandas;
CREATE TRIGGER update_demandas_last_edited_by
    BEFORE UPDATE ON demandas
    FOR EACH ROW
    EXECUTE FUNCTION update_last_edited_by_column();

-- 6. Atualizar todas as demandas existentes para ter updated_at = created_at
UPDATE demandas SET updated_at = created_at WHERE updated_at IS NULL;

-- 7. Verificar se as colunas foram criadas corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'demandas' 
AND column_name IN ('last_edited_by', 'updated_at');
