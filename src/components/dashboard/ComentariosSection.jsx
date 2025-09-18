import React, { useState, useEffect } from 'react';
import { Demanda } from '@/entities/Demanda';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function ComentariosSection({ demandaId }) {
  const { user } = useAuth();
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (demandaId) {
      loadComentarios();
    }
  }, [demandaId]);

  const loadComentarios = async () => {
    setIsLoading(true);
    try {
      const data = await Demanda.getComentarios(demandaId);
      setComentarios(data);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
    setIsLoading(false);
  };

  const handleSubmitComentario = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;

    console.log('Tentando enviar comentário:', {
      demandaId,
      texto: novoComentario.trim(),
      userId: user?.id,
      user: user
    });

    setIsSubmitting(true);
    try {
      const comentario = await Demanda.addComentario(demandaId, novoComentario.trim(), user.id);
      console.log('Comentário criado:', comentario);
      if (comentario) {
        setComentarios(prev => [...prev, comentario]);
        setNovoComentario('');
      }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      alert('Erro ao adicionar comentário: ' + error.message);
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

  const formatDateSafely = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comentários ({comentarios.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulário para novo comentário */}
        <form onSubmit={handleSubmitComentario} className="space-y-3">
          <Textarea
            placeholder="Adicione um comentário..."
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="sm" 
              disabled={!novoComentario.trim() || isSubmitting}
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
          ) : comentarios.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
            </div>
          ) : (
            <AnimatePresence>
              {comentarios.map((comentario) => (
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
                          {comentario.profile?.raw_user_meta_data?.full_name || 'Usuário'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDateSafely(comentario.created_at)}
                        </p>
                      </div>
                    </div>
                    {comentario.user_id === user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComentario(comentario.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">
                    {comentario.texto}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
