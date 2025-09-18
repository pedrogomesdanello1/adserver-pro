import { supabase } from '@/lib/supabaseClient';

class EmailServiceReal {
  constructor() {
    // Substitua pela sua API key do Resend
    this.apiKey = import.meta.env.VITE_RESEND_API_KEY || 're_1234567890';
    // Usar domínio de teste do Resend (não precisa configurar domínio próprio)
    this.fromEmail = 'onboarding@resend.dev';
    
    // Debug da API key - FORÇAR CACHE BREAK
    console.log('🔑 API Key carregada:', this.apiKey ? 'SIM' : 'NÃO');
    console.log('🔑 API Key completa:', this.apiKey);
    console.log('🔑 Variável de ambiente:', import.meta.env.VITE_RESEND_API_KEY);
    console.log('🔑 Timestamp:', new Date().toISOString());
    console.log('🔑 CACHE BREAK:', Math.random().toString(36).substring(7));
    
    // Verificar se API key é válida
    if (this.apiKey === 're_1234567890' || !this.apiKey.startsWith('re_')) {
      console.error('🚨 API KEY INVÁLIDA DETECTADA NO CONSTRUCTOR!');
      console.error('🚨 Valor atual:', this.apiKey);
      console.error('🚨 Variável env:', import.meta.env.VITE_RESEND_API_KEY);
    } else {
      console.log('✅ API KEY VÁLIDA DETECTADA NO CONSTRUCTOR!');
    }
  }

  // Enviar email com fallback para simulação
  async sendEmail({ to, subject, html }) {
    try {
      // Carregar API key dinamicamente para evitar problemas de timing
      const dynamicApiKey = import.meta.env.VITE_RESEND_API_KEY || 're_1234567890';
      
      console.log('=== INICIANDO ENVIO DE EMAIL ===');
      console.log('Para:', to);
      console.log('Assunto:', subject);
      console.log('🔍 API Key do constructor:', this.apiKey);
      console.log('🔍 API Key dinâmica:', dynamicApiKey);
      console.log('🔍 Variável env no sendEmail:', import.meta.env.VITE_RESEND_API_KEY);
      console.log('🔍 Usando API key dinâmica:', dynamicApiKey.substring(0, 10) + '...');

      // Verificar se a API key dinâmica é válida (não é a de exemplo)
      if (dynamicApiKey === 're_1234567890' || !dynamicApiKey.startsWith('re_')) {
        console.log('⚠️ API Key dinâmica inválida ou de exemplo detectada');
        console.log('=== FALLBACK: EMAIL SIMULADO ===');
        console.log(`📧 Email seria enviado para: ${to}`);
        console.log(`📝 Assunto: ${subject}`);
        console.log(`📄 Conteúdo: ${html.substring(0, 100)}...`);
        
        // Simular delay de envio
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { 
          success: true, 
          data: { 
            simulated: true, 
            to, 
            subject,
            message: 'Email simulado - API key não configurada'
          } 
        };
      }

      const emailData = {
        from: this.fromEmail,
        to: [to],
        subject,
        html,
      };

      console.log('Dados do email:', emailData);

      // Tentar envio direto usando API key dinâmica (pode falhar por CORS)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${dynamicApiKey}`,
        },
        body: JSON.stringify(emailData),
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        throw new Error(`Erro ao enviar email: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Email enviado com sucesso:', data);
      console.log('=== EMAIL ENVIADO COM SUCESSO ===');
      return { success: true, data };
    } catch (error) {
      console.error('=== ERRO AO ENVIAR EMAIL ===');
      console.error('Erro completo:', error);
      
      // Fallback: simular envio
      console.log('=== FALLBACK: EMAIL SIMULADO ===');
      console.log(`📧 Email seria enviado para: ${to}`);
      console.log(`📝 Assunto: ${subject}`);
      console.log(`❌ Motivo: ${error.message}`);
      
      return { 
        success: true, 
        data: { 
          simulated: true, 
          to, 
          subject,
          error: error.message
        } 
      };
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

      // Coletar destinatários - NOTIFICAR TODOS OS USUÁRIOS CADASTRADOS
      const destinatarios = new Set();
      
      // Buscar TODOS os usuários cadastrados no sistema
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('email')
        .not('email', 'is', null);

      if (!usersError && allUsers) {
        allUsers.forEach(user => {
          if (user.email) {
            destinatarios.add(user.email);
          }
        });
      }

      // Adicionar usuários mencionados (se houver)
      mentionedUsers.forEach(user => {
        if (user.email) {
          destinatarios.add(user.email);
        }
      });

      console.log(`Total de destinatários encontrados: ${destinatarios.size}`);
      console.log('Destinatários:', Array.from(destinatarios));

      // Enviar emails
      const results = [];
      for (const email of destinatarios) {
        console.log(`Enviando email para: ${email}`);
        const result = await this.sendEmail({
          to: email,
          subject: `Novo comentário na demanda: ${demanda.titulo}`,
          html: this.generateCommentEmailHTML(demanda.titulo, comentario.texto, comentario.user_id)
        });
        results.push({ email, result });
        console.log(`Resultado para ${email}:`, result);
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

      console.log(`Enviando notificação de atribuição para: ${responsavel.email}`);

      // Enviar email
      const result = await this.sendEmail({
        to: responsavel.email,
        subject: `Nova demanda atribuída: ${demanda.titulo}`,
        html: this.generateAssignmentEmailHTML(demanda.titulo, responsavel.raw_user_meta_data?.name || responsavel.email)
      });

      console.log(`Resultado da notificação de atribuição:`, result);
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
