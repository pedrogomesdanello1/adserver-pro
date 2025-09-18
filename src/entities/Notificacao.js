import { supabase } from '../lib/supabaseClient';

export const Notificacao = {
  // Listar notificações do usuário atual
  list: async (userId) => {
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Erro ao listar notificações:", error);
      return [];
    }
    return data;
  },

  // Criar nova notificação
  create: async (notificacao) => {
    const { data, error } = await supabase
      .from('notificacoes')
      .insert([notificacao])
      .select();

    if (error) {
      console.error("Erro ao criar notificação:", error);
      return null;
    }
    return data[0];
  },

  // Marcar notificação como lida
  markAsRead: async (notificacaoId) => {
    const { data, error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', notificacaoId)
      .select();

    if (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      return null;
    }
    return data[0];
  },

  // Marcar todas as notificações como lidas
  markAllAsRead: async (userId) => {
    const { data, error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('user_id', userId)
      .eq('lida', false)
      .select();

    if (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
      return [];
    }
    return data;
  },

  // Contar notificações não lidas
  countUnread: async (userId) => {
    const { count, error } = await supabase
      .from('notificacoes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('lida', false);

    if (error) {
      console.error("Erro ao contar notificações não lidas:", error);
      return 0;
    }
    return count || 0;
  },

  // Deletar notificação
  delete: async (notificacaoId) => {
    console.log('Tentando deletar notificação:', notificacaoId);
    
    const { data, error } = await supabase
      .from('notificacoes')
      .delete()
      .eq('id', notificacaoId)
      .select();

    if (error) {
      console.error("Erro ao deletar notificação:", error);
      return false;
    }
    
    console.log('Notificação deletada com sucesso:', data);
    return true;
  }
};
