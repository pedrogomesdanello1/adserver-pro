import { supabase } from '../lib/supabaseClient';

export const Comentario = {
  // Listar comentários de uma demanda específica
  listByDemanda: async (demandaId) => {
    const { data, error } = await supabase
      .from('comentarios')
      .select('*, profile:profiles ( id, email, raw_user_meta_data )')
      .eq('demanda_id', demandaId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error("Erro ao listar comentários:", error);
      return [];
    }
    return data;
  },

  // Criar novo comentário
  create: async (novoComentario) => {
    console.log('Comentario.create - Dados recebidos:', novoComentario);
    
    const { data, error } = await supabase
      .from('comentarios')
      .insert([novoComentario])
      .select('*, profile:profiles ( id, email, raw_user_meta_data )');

    console.log('Comentario.create - Resposta do Supabase:', { data, error });

    if (error) {
      console.error("Erro ao criar comentário:", error);
      return null;
    }
    return data[0];
  },

  // Deletar comentário
  delete: async (id) => {
    const { error } = await supabase
      .from('comentarios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao deletar comentário:", error);
      return false;
    }
    return true;
  },

  // Atualizar comentário
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('comentarios')
      .update(updates)
      .eq('id', id)
      .select('*, profile:profiles ( id, email, raw_user_meta_data )');

    if (error) {
      console.error("Erro ao atualizar comentário:", error);
      return null;
    }
    return data[0];
  }
};
