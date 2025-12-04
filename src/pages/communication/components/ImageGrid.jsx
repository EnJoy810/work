import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const ImageGrid = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) return null;

  const getGridClass = (count) => {
    if (count === 1) return 'grid-cols-1 max-w-[60%]';
    if (count === 2) return 'grid-cols-2';
    if (count === 4) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  const getImageHeightClass = (count) => {
    if (count === 1) return 'aspect-auto max-h-[400px]';
    return 'aspect-square';
  };

  return (
    <>
      <div className={`grid gap-2 mt-3 ${getGridClass(images.length)}`}>
        {images.map((src, index) => (
          <div 
            key={index} 
            className="relative overflow-hidden rounded-lg cursor-pointer bg-gray-100 border border-gray-100 group"
            onClick={() => setSelectedImage(src)}
          >
            <img 
              src={src} 
              alt={`attachment-${index}`} 
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${getImageHeightClass(images.length)}`} 
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage} 
              className="max-w-full max-h-full rounded-md object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGrid;
