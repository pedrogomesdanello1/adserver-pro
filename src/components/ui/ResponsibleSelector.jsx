import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResponsibleSelector = ({ 
  value, 
  onChange, 
  placeholder = "Selecione um responsável...",
  className = "",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, raw_user_meta_data')
        .order('raw_user_meta_data->name', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
      }
      
      const usersList = profiles.map(profile => ({
        id: profile.id,
        name: profile.raw_user_meta_data?.name || 'Usuário',
        email: profile.email,
        displayName: profile.raw_user_meta_data?.name || profile.email
      }));
      
      setUsers(usersList);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
    setIsLoading(false);
  };

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = users.find(user => user.id === value);

  const handleSelect = (user) => {
    console.log('ResponsibleSelector: Selecionando usuário', user);
    onChange(user.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onChange(null);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
            {selectedUser ? (
              <span className="text-sm font-medium text-slate-600">
                {selectedUser.displayName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {selectedUser ? (
              <div>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {selectedUser.displayName}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {selectedUser.email}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">{placeholder}</p>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden"
          >
            {/* Campo de busca */}
            <div className="p-2 border-b border-slate-100">
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Lista de usuários */}
            <div className="max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-slate-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-xs mt-1">Carregando usuários...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-3 text-center text-slate-500">
                  <p className="text-sm">Nenhum usuário encontrado</p>
                </div>
              ) : (
                <>
                  {/* Opção para limpar seleção */}
                  {selectedUser && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClear();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-sm text-slate-400">—</span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Remover responsável</p>
                      </div>
                    </button>
                  )}
                  
                  {/* Lista de usuários */}
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(user);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-colors ${
                        selectedUser?.id === user.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600">
                          {user.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      {selectedUser?.id === user.id && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResponsibleSelector;
