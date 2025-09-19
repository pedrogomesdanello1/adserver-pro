import { supabase } from '../lib/supabaseClient';
import { Comentario } from './Comentario';

export const Demanda = {
  list: async () => {
    try {
      // Carregar demandas básicas
      const { data: demandas, error } = await supabase
        .from('demandas')
        .select(`
          *, 
          comentarios_count:comentarios(count)
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Erro ao listar demandas:", error);
        return [];
      }

      // Carregar dados dos responsáveis separadamente
      const demandasComResponsaveis = await Promise.all(
        demandas.map(async (demanda) => {
          if (demanda.responsavel_designado) {
            try {
              console.log(`Tentando carregar perfil para ID: ${demanda.responsavel_designado}`);
              
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('raw_user_meta_data, email')
                .eq('id', demanda.responsavel_designado)
                .single();
              
              if (profileError) {
                console.log(`Erro ao carregar perfil do responsável ${demanda.responsavel_designado}:`, profileError);
                return demanda;
              }
              
              if (profile) {
                // Extrair nome do JSON raw_user_meta_data
                const userName = profile.raw_user_meta_data?.name || profile.email;
                const responsibleUser = {
                  name: userName,
                  email: profile.email
                };
                
                console.log(`✅ Responsável carregado para demanda ${demanda.id}:`, responsibleUser);
                return {
                  ...demanda,
                  responsibleUser: responsibleUser
                };
              } else {
                console.log(`❌ Perfil não encontrado para ID: ${demanda.responsavel_designado}`);
                return demanda;
              }
            } catch (error) {
              console.log(`❌ Erro ao carregar perfil do responsável ${demanda.responsavel_designado}:`, error);
              return demanda;
            }
          }
          return demanda;
        })
      );
      
      console.log("Demandas carregadas:", demandasComResponsaveis?.length || 0);
      return demandasComResponsaveis || [];
      
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
    // Adicionar last_edited_by automaticamente
    const updatesWithEditor = {
      ...updates,
      last_edited_by: (await supabase.auth.getUser()).data.user?.id
    };

    const { error } = await supabase
      .from('demandas')
      .update(updatesWithEditor)
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