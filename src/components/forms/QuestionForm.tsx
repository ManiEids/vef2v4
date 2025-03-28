"use client";

import React, { useState } from 'react';
import { Answer, Category } from '@/services/api';


interface AnswerFormData {
  id?: number;
  text: string;  
  correct: boolean;
}

interface QuestionFormProps {
  onSubmit: (categoryId: number, text: string, answers: AnswerFormData[]) => Promise<void>;
  categories: Category[];
  selectedCategoryId?: number;
  initialText?: string;
  initialAnswers?: AnswerFormData[];
}

export function QuestionForm({ 
  onSubmit, 
  categories, 
  selectedCategoryId,
  initialText = '', 
  initialAnswers = [
    { text: '', correct: true },
    { text: '', correct: false },
    { text: '', correct: false },
    { text: '', correct: false }
  ]
}: QuestionFormProps) {
  const [categoryId, setCategoryId] = useState<number | undefined>(selectedCategoryId);
  const [text, setText] = useState(initialText);
  const [answers, setAnswers] = useState<AnswerFormData[]>(initialAnswers);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnswerChange = (index: number, field: keyof AnswerFormData, value: string | boolean) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = { ...updatedAnswers[index], [field]: value };

    // ef rétt, fjarlægja önnur rétt
    if (field === 'correct' && value === true) {
      updatedAnswers.forEach((answer, i) => {
        if (i !== index) {
          updatedAnswers[i] = { ...answer, correct: false };
        }
      });
    }

    setAnswers(updatedAnswers);
  };

  const addAnswer = () => {
    setAnswers([...answers, { text: '', correct: false }]);
  };

  const removeAnswer = (index: number) => {
    // min 2svör
    if (answers.length <= 2) {
      return;
    }
    
    const updatedAnswers = answers.filter((_, i) => i !== index);
    
    // fyrsta sett sem rétt ef rétt er removað
    if (answers[index].correct) {
      updatedAnswers[0] = { ...updatedAnswers[0], correct: true };
    }
    
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // validate
    if (text.trim() === '') {
      setError('Question cannot be empty'); 
    }
    
    if (answers.some(answer => answer.text.trim() === '')) {
      setError('Answers cannot be empty'); 
      return;
    }
    
    if (!answers.some(answer => answer.correct)) {
      setError('There must be at least one correct answer'); 
      return;
    }
    
    if (!selectedCategoryId && !categoryId) {
      setError('Please select a category for the question'); 
      return;
    }

    setLoading(true);

    try {
      const activeCategoryId = selectedCategoryId || categoryId;
      if (!activeCategoryId) {
        throw new Error('Category ID is required'); // Vantar ID
      }
      
      await onSubmit(activeCategoryId, text, answers);
      
      // ef ný - hreinsa
      if (!initialText) {
        setText('');
        setAnswers([
          { text: '', correct: true },
          { text: '', correct: false },
          { text: '', correct: false },
          { text: '', correct: false }
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded">
          {error}
        </div>
      )}
      
      {!selectedCategoryId && (
        <div>
          <label htmlFor="category" className="block mb-1 font-medium">
            Category
          </label>
          <select
            id="category"
            value={categoryId || ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title} {/* breytt */}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div>
        <label htmlFor="question" className="block mb-1 font-medium">
          Spurning
        </label>
        <input
          id="question"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Slá inn spurningu"
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      
      <div className="space-y-4">
        <label className="block font-medium">Svör</label>
        
        {answers.map((answer, index) => (
          <div key={index} className="flex items-center space-x-2 p-3 border rounded">
            <input
              type="checkbox"
              checked={answer.correct}
              onChange={(e) => handleAnswerChange(index, 'correct', e.target.checked)}
              className="mr-2"
            />
            <input
              type="text"
              value={answer.text}
              onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
              placeholder={`Svar ${index + 1}`}
              className="flex-grow px-3 py-2 border rounded"
              required
            />
            <button
              type="button"
              onClick={() => removeAnswer(index)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
              disabled={answers.length <= 2}
            >
              Eyða
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addAnswer}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Bæta við svari
        </button>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
        {loading ? 'Vista...' : initialText ? 'Uppfæra spurningu' : 'Búa til spurningu'} // Vista/Uppfæra/Nýtt
      </button>
    </form>
  );
}
