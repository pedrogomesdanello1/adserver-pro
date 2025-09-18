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
VITE_FROM_EMAIL=noreply@seudominio.com
```

### 3. **Ativar o serviço real**
No arquivo `src/services/emailService.js`, substitua a importação:

```javascript
// Trocar esta linha:
import { emailService } from '@/services/emailService';

// Por esta:
import { emailServiceReal as emailService } from '@/services/emailServiceReal';
```

### 4. **Configurar domínio (Opcional)**
- No Resend, adicione seu domínio
- Ou use o domínio de teste do Resend

## 🎯 **Resultado**
- ✅ Emails reais enviados
- ✅ Notificações funcionando
- ✅ Sistema completo

## 💰 **Custos**
- **Resend:** 3.000 emails/mês GRÁTIS
- **SendGrid:** 100 emails/dia GRÁTIS
- **AWS SES:** $0.10 por 1.000 emails

## 🔧 **Alternativas**
Se não quiser configurar agora, o sistema continua funcionando com notificações no banco de dados!
