import React, { useState } from 'react';
import { X, Download, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImagePreview = ({ file, onRemove, className = "" }) => {
  const [showFullSize, setShowFullSize] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = () => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`relative group bg-slate-50 border border-slate-200 rounded-lg overflow-hidden ${className}`}
      >
        <div className="aspect-video bg-slate-100 flex items-center justify-center">
          {!imageError ? (
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="text-slate-500 text-center p-4">
              <div className="text-2xl mb-2">📷</div>
              <p className="text-sm">Erro ao carregar imagem</p>
            </div>
          )}
        </div>
        
        {/* Overlay com ações */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFullSize(true)}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors"
              title="Ver em tamanho completo"
            >
              <Eye className="w-4 h-4 text-slate-700" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors"
              title="Baixar imagem"
            >
              <Download className="w-4 h-4 text-slate-700" />
            </button>
            <button
              onClick={onRemove}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
              title="Remover imagem"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
        
        {/* Informações do arquivo */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
          <p className="text-white text-sm font-medium truncate">{file.name}</p>
          <p className="text-white text-xs opacity-75">{formatFileSize(file.size)}</p>
        </div>
      </motion.div>

      {/* Modal de visualização em tamanho completo */}
      <AnimatePresence>
        {showFullSize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullSize(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setShowFullSize(false)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors"
              >
                <X className="w-6 h-6 text-slate-700" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImagePreview;
