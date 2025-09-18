import React, { useState, useEffect } from 'react';
import { Demanda } from '@/entities/Demanda';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MentionInput from '@/components/ui/MentionInput';
import ImagePreview from '@/components/ui/ImagePreview';
import SearchInput from '@/components/ui/SearchInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Trash2, User, Edit2, Check, X, Paperclip, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';

export default function ComentariosSection({ demandaId }) {
  const { user } = useAuth();
  const { notify } = useNotifications();
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredComentarios, setFilteredComentarios] = useState([]);

  useEffect(() => {
    if (demandaId) {
      loadComentarios();
      loadAvailableUsers();
      
      // Configurar notificações em tempo real
      const channel = supabase
        .channel(`comentarios-${demandaId}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'comentarios',
            filter: `demanda_id=eq.${demandaId}`
          }, 
          (payload) => {
            console.log('Novo comentário recebido:', payload);
            // Recarregar comentários quando um novo for adicionado
            loadComentarios();
          }
        )
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'comentarios',
            filter: `demanda_id=eq.${demandaId}`
          }, 
          (payload) => {
            console.log('Comentário atualizado:', payload);
            loadComentarios();
          }
        )
        .on('postgres_changes', 
          { 
            event: 'DELETE', 
            schema: 'public', 
            table: 'comentarios',
            filter: `demanda_id=eq.${demandaId}`
          }, 
          (payload) => {
            console.log('Comentário deletado:', payload);
            loadComentarios();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [demandaId]);

  const loadComentarios = async () => {
    setIsLoading(true);
    try {
      const data = await Demanda.getComentarios(demandaId);
      setComentarios(data);
      setFilteredComentarios(data);
      
      // Buscar nomes dos usuários únicos
      const userIds = [...new Set(data.map(c => c.user_id))];
      await loadUserNames(userIds);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
    setIsLoading(false);
  };

  const loadUserNames = async (userIds) => {
    try {
      // Buscar nomes dos usuários da tabela profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, raw_user_meta_data')
        .in('id', userIds);
      
      if (error) {
        console.error('Erro ao buscar perfis:', error);
        return;
      }
      
      const nameMap = {};
      profiles.forEach(profile => {
        nameMap[profile.id] = profile.raw_user_meta_data?.name || profile.email;
      });
      
      setUserNames(nameMap);
    } catch (error) {
      console.error('Erro ao buscar nomes:', error);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      // Buscar todos os usuários para menções
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, raw_user_meta_data');
      
      if (error) {
        console.error('Erro ao buscar usuários para menção:', error);
        return;
      }
      
      const users = profiles.map(profile => ({
        id: profile.id,
        name: profile.raw_user_meta_data?.name,
        email: profile.email
      }));
      
      setAvailableUsers(users);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleMention = (mentionedUser) => {
    // Notificar que um usuário foi mencionado
    notify.info('Usuário mencionado', `Você mencionou ${mentionedUser.name || mentionedUser.email}`);
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          // Adicionar a imagem aos arquivos selecionados
          setSelectedFiles(prev => [...prev, file]);
          notify.success('Imagem colada', 'Imagem adicionada aos anexos!');
        }
      }
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredComentarios(comentarios);
      return;
    }

    const filtered = comentarios.filter(comentario => 
      comentario.texto.toLowerCase().includes(query.toLowerCase()) ||
      (userNames[comentario.user_id] && userNames[comentario.user_id].toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredComentarios(filtered);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredComentarios(comentarios);
  };

  const handleSubmitComentario = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim() && selectedFiles.length === 0) return;

    console.log('Tentando enviar comentário:', {
      demandaId,
      texto: novoComentario.trim(),
      userId: user?.id,
      user: user,
      files: selectedFiles
    });

    setIsSubmitting(true);
    try {
      // Upload dos arquivos se houver
      let anexos = [];
      if (selectedFiles.length > 0) {
        anexos = await uploadFiles(selectedFiles);
      }

      const comentario = await Demanda.addComentario(demandaId, novoComentario.trim(), user.id, anexos);
      console.log('Comentário criado:', comentario);
      if (comentario) {
        setComentarios(prev => [...prev, comentario]);
        setFilteredComentarios(prev => [...prev, comentario]);
        setNovoComentario('');
        setSelectedFiles([]);
        
        // Adicionar nome do usuário atual ao mapa
        setUserNames(prev => ({
          ...prev,
          [user.id]: user?.user_metadata?.full_name || user?.email
        }));

        // Notificação de sucesso
        notify.success('Comentário adicionado', 'Seu comentário foi publicado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      notify.error('Erro ao adicionar comentário', error.message || 'Ocorreu um erro inesperado');
    }
    setIsSubmitting(false);
  };

  const handleDeleteComentario = async (comentarioId) => {
    if (window.confirm('Tem certeza que deseja excluir este comentário?')) {
      try {
        const success = await Demanda.deleteComentario(comentarioId);
        if (success) {
          setComentarios(prev => prev.filter(c => c.id !== comentarioId));
        }
      } catch (error) {
        console.error('Erro ao excluir comentário:', error);
      }
    }
  };

  const handleEditComentario = (comentario) => {
    setEditingComment(comentario.id);
    setEditText(comentario.texto);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;

    try {
      const updatedComment = await Demanda.updateComentario(editingComment, { texto: editText.trim() });
      if (updatedComment) {
        setComentarios(prev => prev.map(c => 
          c.id === editingComment ? { ...c, texto: editText.trim() } : c
        ));
        setEditingComment(null);
        setEditText('');
      }
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const formatDateSafely = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  // Função para processar menções (@usuario)
  const processMentions = (text) => {
    if (!text) return text;
    
    // Regex para encontrar menções @usuario
    const mentionRegex = /@(\w+)/g;
    
    return text.split(mentionRegex).map((part, index) => {
      if (index % 2 === 1) {
        // Esta é uma menção
        return (
          <span key={index} className="bg-blue-100 text-blue-800 px-1 rounded text-xs font-medium">
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  // Função para gerenciar anexos
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files) => {
    const uploadedFiles = [];
    
    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `comentarios/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('anexos')
          .upload(filePath, file);
        
        if (uploadError) {
          console.error('Erro ao fazer upload:', uploadError);
          continue;
        }
        
        const { data } = supabase.storage
          .from('anexos')
          .getPublicUrl(filePath);
        
        uploadedFiles.push({
          name: file.name,
          url: data.publicUrl,
          size: file.size,
          type: file.type
        });
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
      }
    }
    
    return uploadedFiles;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comentários ({searchQuery ? filteredComentarios.length : comentarios.length})
          </CardTitle>
          <div className="w-64">
            <SearchInput
              placeholder="Buscar comentários..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulário para novo comentário */}
        <form onSubmit={handleSubmitComentario} className="space-y-3">
          <MentionInput
            placeholder="Adicione um comentário... Use @usuario para mencionar alguém ou Ctrl+V para colar imagens"
            value={novoComentario}
            onChange={setNovoComentario}
            users={availableUsers}
            onMention={handleMention}
            onPaste={handlePaste}
            className="min-h-[80px]"
            disabled={isSubmitting}
          />
          
          {/* Seção de anexos */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              />
              <label
                htmlFor="file-input"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
                Anexar arquivos
              </label>
            </div>
            
            {/* Lista de arquivos selecionados */}
            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedFiles.map((file, index) => (
                  <ImagePreview
                    key={index}
                    file={file}
                    onRemove={() => removeFile(index)}
                    className="w-full"
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="sm" 
              disabled={(!novoComentario.trim() && selectedFiles.length === 0) || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>

        {/* Lista de comentários */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array(2).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 rounded-lg h-20"></div>
                </div>
              ))}
            </div>
          ) : (searchQuery ? filteredComentarios : comentarios).length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>{searchQuery ? 'Nenhum comentário encontrado para sua busca.' : 'Nenhum comentário ainda. Seja o primeiro a comentar!'}</p>
            </div>
          ) : (
            <AnimatePresence>
              {(searchQuery ? filteredComentarios : comentarios).map((comentario) => (
                <motion.div
                  key={comentario.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {userNames[comentario.user_id] || 
                           (comentario.user_id === user?.id 
                             ? (user?.user_metadata?.full_name || user?.email || `Usuário ${comentario.user_id?.slice(0, 8)}...`)
                             : `Usuário ${comentario.user_id?.slice(0, 8)}...`)
                          }
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateSafely(comentario.created_at)}
                        </p>
                      </div>
                    </div>
                    {comentario.user_id === user?.id && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditComentario(comentario)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComentario(comentario.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {editingComment === comentario.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[80px] resize-none"
                        placeholder="Edite seu comentário..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={!editText.trim()}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {comentario.texto && (
                        <p className="text-slate-700 text-sm whitespace-pre-wrap">
                          {processMentions(comentario.texto)}
                        </p>
                      )}
                      
                      {/* Exibir anexos se existirem */}
                      {comentario.anexos && comentario.anexos.length > 0 && (
                        <div className="space-y-1">
                          {comentario.anexos.map((anexo, index) => (
                            <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded border">
                              <Paperclip className="w-4 h-4 text-slate-500" />
                              <span className="text-sm text-slate-700 truncate flex-1">
                                {anexo.name}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(anexo.url, '_blank')}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
