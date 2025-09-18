import { supabase } from '@/lib/supabaseClient';

class EmailServiceReal {
  constructor() {
    // Substitua pela sua API key do Resend
    this.apiKey = import.meta.env.VITE_RESEND_API_KEY || 're_1234567890';
    this.fromEmail = 'noreply@seudominio.com'; // Substitua pelo seu domínio
  }

  // Enviar email real usando Resend
  async sendEmail({ to, subject, html }) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar email: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Email enviado com sucesso:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return { success: false, error: error.message };
    }
  }

  // Enviar notificação quando um comentário é adicionado
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
        return { success: false, error: 'Demanda não encontrada' };
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

      // Coletar destinatários
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

      // Enviar emails
      const results = [];
      for (const email of destinatarios) {
        const result = await this.sendEmail({
          to: email,
          subject: `Novo comentário na demanda: ${demanda.titulo}`,
          html: this.generateCommentEmailHTML(demanda.titulo, comentario.texto, comentario.user_id)
        });
        results.push({ email, result });
      }

      console.log(`Emails enviados para: ${Array.from(destinatarios).join(', ')}`);
      return { success: true, destinatarios: Array.from(destinatarios), results };

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
        return { success: false, error: 'Demanda não encontrada' };
      }

      // Buscar email do responsável
      const { data: responsavel, error: responsavelError } = await supabase
        .from('profiles')
        .select('email, raw_user_meta_data')
        .eq('id', responsavelId)
        .single();

      if (responsavelError || !responsavel) {
        console.error('Erro ao buscar responsável:', responsavelError);
        return { success: false, error: 'Responsável não encontrado' };
      }

      // Enviar email
      const result = await this.sendEmail({
        to: responsavel.email,
        subject: `Nova demanda atribuída: ${demanda.titulo}`,
        html: this.generateAssignmentEmailHTML(demanda.titulo, responsavel.raw_user_meta_data?.name || responsavel.email)
      });

      console.log(`Notificação de atribuição enviada para: ${responsavel.email}`);
      return { success: true, destinatario: responsavel.email, result };

    } catch (error) {
      console.error('Erro ao enviar notificação de atribuição:', error);
      return { success: false, error: error.message };
    }
  }

  // Gerar HTML do email de comentário
  generateCommentEmailHTML(tituloDemanda, textoComentario, userId) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Novo Comentário na Demanda</h2>
        <p><strong>Demanda:</strong> ${tituloDemanda}</p>
        <p><strong>Comentário:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${textoComentario}
        </div>
        <p style="color: #666; font-size: 12px;">
          Acesse o sistema para ver mais detalhes.
        </p>
      </div>
    `;
  }

  // Gerar HTML do email de atribuição
  generateAssignmentEmailHTML(tituloDemanda, nomeResponsavel) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Nova Demanda Atribuída</h2>
        <p>Olá <strong>${nomeResponsavel}</strong>,</p>
        <p>Você foi designado como responsável pela seguinte demanda:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <strong>${tituloDemanda}</strong>
        </div>
        <p>Acesse o sistema para ver mais detalhes e começar o trabalho.</p>
        <p style="color: #666; font-size: 12px;">
          Esta é uma notificação automática do sistema DEMANDASH.
        </p>
      </div>
    `;
  }
}

export const emailServiceReal = new EmailServiceReal();
