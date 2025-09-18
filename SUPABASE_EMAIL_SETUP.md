# 📧 Configuração de Email via Supabase Edge Functions

## 🚨 **PROBLEMA IDENTIFICADO:**
- **CORS Error**: Resend não permite requisições diretas do frontend
- **API Key**: Precisa ser configurada no Supabase (não no frontend)

## 🔧 **SOLUÇÃO IMPLEMENTADA:**
Criamos uma **Supabase Edge Function** que faz o envio de email sem problemas de CORS.

## 📋 **PASSOS PARA CONFIGURAR:**

### **1. Instalar Supabase CLI (se não tiver):**
```bash
npm install -g supabase
```

### **2. Fazer Login no Supabase:**
```bash
supabase login
```

### **3. Linkar o Projeto:**
```bash
supabase link --project-ref SEU_PROJECT_ID
```

### **4. Configurar a API Key do Resend:**
```bash
supabase secrets set RESEND_API_KEY=re_7G97ifdg_KTmup9KDKdGXBJA2FXX3giiC
```

### **5. Deploy da Edge Function:**
```bash
supabase functions deploy send-email
```

### **6. Testar a Function:**
```bash
supabase functions serve send-email
```

## 🎯 **ALTERNATIVA SIMPLES (Recomendada):**

Se não quiser configurar Edge Functions, podemos **voltar para notificações internas** apenas:

1. ✅ **Notificações no sistema** (sino + popup)
2. ❌ **Emails desabilitados** (sem CORS)

## 🔍 **VERIFICAÇÃO:**

Após configurar, teste criando um comentário e verifique no console:
```
=== INICIANDO ENVIO DE EMAIL VIA SUPABASE ===
Email enviado com sucesso via Supabase: {...}
=== EMAIL ENVIADO COM SUCESSO ===
```

## 📞 **PRÓXIMOS PASSOS:**

**Escolha uma opção:**
1. **Configurar Edge Functions** (emails funcionam)
2. **Desabilitar emails** (apenas notificações internas)
3. **Usar API key real** (testar se resolve CORS)

**Qual opção prefere?** 🤔
