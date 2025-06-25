"use client";

import React, { useState, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput = ({ value: tags, onChange, placeholder }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const editTag = (index: number) => {
    setIsEditing(index);
    setEditingText(tags[index]);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingText(e.target.value);
  };

  const handleEditConfirm = (index: number) => {
    const newTags = [...tags];
    newTags[index] = editingText.trim();
    onChange(newTags.filter(Boolean)); // Remove empty tags
    setIsEditing(null);
    setEditingText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div 
      className="flex flex-wrap items-center gap-2 p-2 border rounded-lg bg-background"
      onClick={() => inputRef.current?.focus()}
    >
      <AnimatePresence>
        {tags.map((tag, index) => (
          <motion.div
            key={tag}
            layout
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex items-center"
          >
            {isEditing === index ? (
              <input
                type="text"
                value={editingText}
                onChange={handleEditChange}
                onBlur={() => handleEditConfirm(index)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditConfirm(index)}
                className="px-2 py-1 text-sm bg-transparent border-b border-accent focus:outline-none"
                autoFocus
              />
            ) : (
              <div 
                onDoubleClick={() => editTag(index)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-main bg-accent/20 rounded-full cursor-pointer"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-main">
                  <X size={14} />
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-grow p-1.5 text-sm bg-transparent focus:outline-none"
        placeholder={tags.length === 0 ? placeholder : ''}
      />
    </div>
  );
}; 