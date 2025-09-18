-- Adicionar coluna para rastrear quem fez a última edição
ALTER TABLE demandas ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES auth.users(id);

-- Criar trigger para atualizar last_edited_by automaticamente
CREATE OR REPLACE FUNCTION update_last_edited_by()
RETURNS TRIGGER AS $$
BEGIN
  -- Se algum campo foi alterado (exceto updated_at), atualizar last_edited_by
  IF OLD.titulo IS DISTINCT FROM NEW.titulo OR
     OLD.descricao IS DISTINCT FROM NEW.descricao OR
     OLD.status IS DISTINCT FROM NEW.status OR
     OLD.prioridade IS DISTINCT FROM NEW.prioridade OR
     OLD.responsavel_designado IS DISTINCT FROM NEW.responsavel_designado OR
     OLD.observacoes IS DISTINCT FROM NEW.observacoes THEN
    
    NEW.last_edited_by = auth.uid();
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_update_last_edited_by ON demandas;
CREATE TRIGGER trigger_update_last_edited_by
  BEFORE UPDATE ON demandas
  FOR EACH ROW
  EXECUTE FUNCTION update_last_edited_by();
