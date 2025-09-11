import { supabase } from '../lib/supabaseClient';

export const Demanda = {
  list: async () => {
    // AQUI ESTÁ A MUDANÇA: Pedimos todos os dados da demanda (*),
    // e também os dados da nossa nova tabela 'profiles' que está ligada pela coluna user_id.
    // Damos o apelido de "profile" para esses dados do usuário.
    const { data, error } = await supabase
      .from('demandas')
      .select('*, profile:profiles ( id, email, raw_user_meta_data )')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Erro ao listar demandas:", error);
      return [];
    }
    return data;
  },

  create: async (novaDemanda) => {
    const { data, error } = await supabase
      .from('demandas')
      .insert([novaDemanda])
      .select();

    if (error) {
      console.error("Erro ao criar demanda:", error);
      return null;
    }
    return data[0];
  },

  update: async (id, updates) => {
    const { error } = await supabase
      .from('demandas')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error("Erro ao atualizar demanda:", error);
      return false;
    }
    return true;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('demandas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao deletar demanda:", error);
      return false;
    }
    return true;
  }
};