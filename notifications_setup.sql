-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'comentario', 'menção', 'demanda_atribuida', etc.
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  dados_extras JSONB DEFAULT '{}'::jsonb, -- Para armazenar IDs de demandas, comentários, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver suas próprias notificações" ON notificacoes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem marcar suas notificações como lidas" ON notificacoes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar notificações" ON notificacoes
  FOR INSERT WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON notificacoes(created_at);
