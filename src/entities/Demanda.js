import { supabase } from '../lib/supabaseClient';
import { Comentario } from './Comentario';

export const Demanda = {
  list: async () => {
    try {
      // Primeiro, tentar carregar com JOIN
      const { data, error } = await supabase
        .from('demandas')
        .select(`
          *, 
          responsibleUser:profiles!responsavel_designado(name, email, avatar_url),
          comentarios_count:comentarios(count)
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Erro ao listar demandas com JOIN:", error);
        
        // Fallback: carregar sem JOIN
        console.log("Tentando carregar sem JOIN...");
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('demandas')
          .select(`
            *, 
            comentarios_count:comentarios(count)
          `)
          .order('created_at', { ascending: false });
          
        if (fallbackError) {
          console.error("Erro ao listar demandas (fallback):", fallbackError);
          return [];
        }
        
        console.log("Demandas carregadas (fallback):", fallbackData?.length || 0);
        return fallbackData || [];
      }
      
      console.log("Demandas carregadas (com JOIN):", data?.length || 0);
      return data || [];
      
    } catch (error) {
      console.error("Erro geral ao listar demandas:", error);
      return [];
    }
  },

  create: async (novaDemanda) => {
    // Corrigir problema de fuso horário na data
    const demandaParaInserir = { ...novaDemanda };
    if (demandaParaInserir.prazo_estimado) {
      // Garantir que a data seja tratada como string no formato correto
      const data = new Date(demandaParaInserir.prazo_estimado + 'T00:00:00');
      demandaParaInserir.prazo_estimado = data.toISOString().split('T')[0];
    }
    
    const { data, error } = await supabase
      .from('demandas')
      .insert([demandaParaInserir])
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
  },

  // Métodos para gerenciar comentários
  getComentarios: async (demandaId) => {
    return await Comentario.listByDemanda(demandaId);
  },

  addComentario: async (demandaId, texto, userId, anexos = []) => {
    const novoComentario = {
      demanda_id: demandaId,
      texto: texto,
      user_id: userId,
      anexos: anexos
    };
    return await Comentario.create(novoComentario);
  },

  deleteComentario: async (comentarioId) => {
    return await Comentario.delete(comentarioId);
  },

  updateComentario: async (comentarioId, updates) => {
    return await Comentario.update(comentarioId, updates);
  }
};