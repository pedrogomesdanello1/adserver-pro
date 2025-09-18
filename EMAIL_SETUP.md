# 📧 Configuração de Email Real

## 🚀 Passo a Passo para Implementar Emails

### 1. **Criar conta no Resend**
- Acesse: https://resend.com
- Crie uma conta gratuita
- Vá em "API Keys" e crie uma nova chave

### 2. **Configurar variáveis de ambiente**
Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_RESEND_API_KEY=re_sua_chave_aqui
```

**Nota:** O sistema já está configurado para usar o domínio de teste do Resend (`onboarding@resend.dev`), então não precisa configurar `VITE_FROM_EMAIL`.

### 3. **Ativar o serviço real**
No arquivo `src/services/emailService.js`, substitua a importação:

```javascript
// Trocar esta linha:
import { emailService } from '@/services/emailService';

// Por esta:
import { emailServiceReal as emailService } from '@/services/emailServiceReal';
```

### 4. **Domínio de Teste (Já Configurado)**
- ✅ Sistema já usa `onboarding@resend.dev`
- ✅ Não precisa configurar domínio próprio
- ✅ Funciona imediatamente para testes

## 🎯 **Resultado**
- ✅ Emails reais enviados
- ✅ Notificações funcionando
- ✅ Sistema completo

## 💰 **Custos**
- **Resend:** 3.000 emails/mês GRÁTIS
- **SendGrid:** 100 emails/dia GRÁTIS
- **AWS SES:** $0.10 por 1.000 emails

## 🧪 **Domínio de Teste do Resend**

### **Como Funciona:**
- ✅ **Remetente:** `onboarding@resend.dev`
- ✅ **Funciona imediatamente** sem configuração
- ✅ **Ideal para testes** e desenvolvimento
- ✅ **3.000 emails/mês** gratuitos

### **Limitações do Domínio de Teste:**
- ⚠️ Emails podem ir para **spam**
- ⚠️ Alguns provedores podem **bloquear**
- ⚠️ **Não recomendado** para produção

### **Para Produção (Opcional):**
- Configure seu próprio domínio no Resend
- Melhor deliverability
- Emails não vão para spam

## 🔧 **Alternativas**
Se não quiser configurar agora, o sistema continua funcionando com notificações no banco de dados!
