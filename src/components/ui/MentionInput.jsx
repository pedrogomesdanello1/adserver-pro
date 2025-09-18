import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from './textarea';
import { motion, AnimatePresence } from 'framer-motion';

const MentionInput = ({ 
  value, 
  onChange, 
  placeholder = "Digite seu comentário...",
  users = [],
  onMention,
  onPaste,
  className = "",
  ...props 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mentionStart, setMentionStart] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Verificar se há uma menção sendo digitada
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(query) || 
        user.email?.toLowerCase().includes(query)
      );
      
      setSuggestions(filteredUsers);
      setShowSuggestions(filteredUsers.length > 0);
      setMentionStart(cursorPos - mentionMatch[0].length);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          insertMention(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const insertMention = (user) => {
    const mention = `@${user.name || user.email}`;
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(textareaRef.current.selectionStart);
    const newValue = beforeMention + mention + ' ' + afterMention;
    
    onChange(newValue);
    setShowSuggestions(false);
    
    // Focar no textarea após inserir menção
    setTimeout(() => {
      textareaRef.current.focus();
      const newCursorPos = beforeMention.length + mention.length + 1;
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    // Notificar sobre a menção
    if (onMention) {
      onMention(user);
    }
  };

  const handleClick = (user) => {
    insertMention(user);
  };

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={onPaste}
        placeholder={placeholder}
        className={`${className} resize-none`}
        {...props}
      />
      
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2 w-full max-w-xs bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
          >
            {suggestions.map((user, index) => (
              <div
                key={user.id}
                onClick={() => handleClick(user)}
                className={`px-3 py-2 cursor-pointer transition-colors ${
                  index === selectedIndex 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-600">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {user.name || user.email}
                    </p>
                    {user.name && user.email && (
                      <p className="text-xs text-slate-500">{user.email}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentionInput;
