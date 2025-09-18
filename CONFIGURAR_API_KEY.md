# 🔑 Configurar API Key do Resend

## 📋 **INSTRUÇÕES PARA CONFIGURAR:**

### **PASSO 1: Criar arquivo .env.local**
Crie um arquivo chamado `.env.local` na raiz do projeto com o seguinte conteúdo:

```bash
# Configurações do Resend para envio de emails
VITE_RESEND_API_KEY=re_7G97ifdg_KTmup9KDKdGXBJA2FXX3giiC
```

### **PASSO 2: Reiniciar o servidor**
Após criar o arquivo, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

### **PASSO 3: Testar**
1. Abra o console (F12)
2. Crie um comentário em uma demanda
3. Verifique os logs no console

## 🎯 **O QUE DEVE APARECER NO CONSOLE:**

**Com API key válida:**
```
=== INICIANDO ENVIO DE EMAIL ===
Para: usuario@exemplo.com
Assunto: Novo comentário na demanda: Nome da Demanda
API Key (primeiros 10 chars): re_7G97ifdg...
Dados do email: {...}
Status da resposta: 200
✅ Email enviado com sucesso: {...}
=== EMAIL ENVIADO COM SUCESSO ===
```

**Se ainda houver erro de CORS:**
```
=== ERRO AO ENVIAR EMAIL ===
Erro completo: TypeError: NetworkError when attempting to fetch resource.
=== FALLBACK: EMAIL SIMULADO ===
📧 Email seria enviado para: usuario@exemplo.com
📝 Assunto: Novo comentário na demanda: Nome da Demanda
❌ Motivo: NetworkError when attempting to fetch resource.
```

## 🔍 **VERIFICAÇÃO:**

Após configurar, o sistema deve:
1. ✅ **Detectar API key válida** (não mais a de exemplo)
2. ✅ **Tentar envio real** via Resend
3. ✅ **Se falhar por CORS**, simular com logs detalhados

## 📞 **PRÓXIMOS PASSOS:**

1. **Crie o arquivo .env.local** com a API key
2. **Reinicie o servidor**
3. **Teste criando um comentário**
4. **Me informe o que aparece no console**

**A API key está correta, agora é só configurar!** 🚀
