// Importar o serviço real de email
export { emailServiceReal as emailService } from '@/services/emailServiceReal';

// Código antigo comentado para referência
/*
import { supabase } from '@/lib/supabaseClient';
import { Notificacao } from '@/entities/Notificacao';

class EmailService {
  // Enviar notificação por email quando um comentário é adicionado
  async notifyCommentAdded(demandaId, comentario, mentionedUsers = []) {
    try {
      // Buscar dados da demanda
      const { data: demanda, error: demandaError } = await supabase
        .from('demandas')
        .select('titulo, responsavel_designado')
        .eq('id', demandaId)
        .single();

      if (demandaError || !demanda) {
        console.error('Erro ao buscar demanda:', demandaError);
        return;
      }

      // Buscar email do responsável da demanda
      let responsavelEmail = null;
      if (demanda.responsavel_designado) {
        const { data: responsavel, error: responsavelError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', demanda.responsavel_designado)
          .single();

        if (!responsavelError && responsavel) {
          responsavelEmail = responsavel.email;
        }
      }

      // Preparar lista de destinatários
      const destinatarios = new Set();
      
      // Adicionar responsável da demanda
      if (responsavelEmail) {
        destinatarios.add(responsavelEmail);
      }

      // Adicionar usuários mencionados
      mentionedUsers.forEach(user => {
        if (user.email) {
          destinatarios.add(user.email);
        }
      });

      // Criar notificações reais no banco de dados
      for (const email of destinatarios) {
        try {
          // Buscar ID do usuário pelo email
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

          if (userData && !userError) {
            await Notificacao.create({
              user_id: userData.id,
              tipo: 'comentario',
              titulo: 'Novo comentário na demanda',
              mensagem: `Novo comentário adicionado na demanda "${demanda.titulo}"`,
              dados_extras: {
                demanda_id: demandaId,
                comentario_id: comentario.id
              }
            });
          }
        } catch (error) {
          console.error('Erro ao criar notificação:', error);
        }
      }

      // Enviar emails (simulado - em produção usaria um serviço real como SendGrid, Resend, etc.)
      for (const email of destinatarios) {
        await this.sendEmail({
          to: email,
          subject: `Novo comentário na demanda: ${demanda.titulo}`,
          html: this.generateCommentEmailHTML(demanda.titulo, comentario.texto, comentario.user_id)
        });
      }

      console.log(`Notificações de email enviadas para: ${Array.from(destinatarios).join(', ')}`);
      return { success: true, destinatarios: Array.from(destinatarios) };

    } catch (error) {
      console.error('Erro ao enviar notificação por email:', error);
      return { success: false, error: error.message };
    }
  }

  // Enviar notificação quando uma demanda é atribuída
  async notifyDemandaAssigned(demandaId, responsavelId) {
    try {
      // Buscar dados da demanda
      const { data: demanda, error: demandaError } = await supabase
        .from('demandas')
        .select('titulo')
        .eq('id', demandaId)
        .single();

      if (demandaError || !demanda) {
        console.error('Erro ao buscar demanda:', demandaError);
        return;
      }

      // Buscar email do responsável
      const { data: responsavel, error: responsavelError } = await supabase
        .from('profiles')
        .select('email, raw_user_meta_data')
        .eq('id', responsavelId)
        .single();

      if (responsavelError || !responsavel) {
        console.error('Erro ao buscar responsável:', responsavelError);
        return;
      }

      // Enviar email
      // Criar notificação real no banco de dados
      await Notificacao.create({
        user_id: responsavelId,
        tipo: 'demanda_atribuida',
        titulo: 'Nova demanda atribuída',
        mensagem: `Você foi designado como responsável pela demanda "${demanda.titulo}"`,
        dados_extras: {
          demanda_id: demandaId
        }
      });

      await this.sendEmail({
        to: responsavel.email,
        subject: `Nova demanda atribuída: ${demanda.titulo}`,
        html: this.generateAssignmentEmailHTML(demanda.titulo, responsavel.raw_user_meta_data?.name || responsavel.email)
      });

      console.log(`Notificação de atribuição enviada para: ${responsavel.email}`);
      return { success: true, destinatario: responsavel.email };

    } catch (error) {
      console.error('Erro ao enviar notificação de atribuição:', error);
      return { success: false, error: error.message };
    }
  }

  // Método simulado para envio de email
  async sendEmail({ to, subject, html }) {
    // Em produção, aqui você integraria com um serviço real de email
    // Como SendGrid, Resend, AWS SES, etc.
    
    console.log('📧 Email simulado enviado:');
    console.log('Para:', to);
    console.log('Assunto:', subject);
    console.log('Conteúdo:', html);
    
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, messageId: `sim_${Date.now()}` };
  }

  // Gerar HTML do email para comentários
  generateCommentEmailHTML(tituloDemanda, textoComentario, userId) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0 0 10px 0;">Novo Comentário</h2>
          <p style="color: #64748b; margin: 0;">Uma nova mensagem foi adicionada à demanda:</p>
        </div>
        
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin: 0 0 15px 0;">${tituloDemanda}</h3>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #334155; line-height: 1.6;">${textoComentario}</p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
          <p style="color: #64748b; margin: 0; font-size: 14px;">
            Acesse o DEMANDASH para ver mais detalhes e responder ao comentário.
          </p>
        </div>
      </div>
    `;
  }

  // Gerar HTML do email para atribuições
  generateAssignmentEmailHTML(tituloDemanda, nomeResponsavel) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0ea5e9;">
          <h2 style="color: #0c4a6e; margin: 0 0 10px 0;">Nova Demanda Atribuída</h2>
          <p style="color: #0369a1; margin: 0;">Olá ${nomeResponsavel}, uma nova demanda foi atribuída a você!</p>
        </div>
        
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin: 0 0 15px 0;">${tituloDemanda}</h3>
          <p style="color: #64748b; margin: 0; line-height: 1.6;">
            Acesse o DEMANDASH para visualizar os detalhes completos da demanda e começar o trabalho.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px;">
          <p style="color: #64748b; margin: 0; font-size: 14px;">
            Faça login no sistema para acessar todas as informações da demanda.
          </p>
        </div>
      </div>
    `;
  }
}

export const emailService = new EmailService();
*/
