'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/simpleApi';
import { Category, Question } from '@/services/api-types';
import { QuestionModal } from './QuestionModal';

export function QuestionManager({ categorySlug }: { categorySlug: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<number>(0);

  useEffect(() => {
    async function loadCategories() {
      try {
        console.log('Loading categories...');
        const categoriesData = await api.categories.getAll();
        setCategories(categoriesData);
        const category = categoriesData.find((c: Category) => c.slug === categorySlug);
        if (category) {
          console.log(`Found category with ID ${category.id} for slug ${categorySlug}`);
          setCategoryId(category.id);
        } else {
          console.error(`No category found with slug ${categorySlug}`);
        }
      } catch (err) {
        setError('Failed to load categories');
        console.error(err);
      }
    }
    loadCategories();
    if (categorySlug) {
      loadQuestions(categorySlug);
    }
  }, [categorySlug]);

  async function loadQuestions(slug: string) {
    setLoading(true);
    setError(null);
    try {
      console.log(`📋 Loading questions for category: ${slug}`);
      const questionsData = await api.questions.getByCategory(slug);
      console.log(`✅ Successfully loaded ${questionsData.length} questions`);
      setQuestions(questionsData);
    } catch (err) {
      console.error(`❌ Failed to load questions for ${slug}:`, err);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }

  // Open modal for new question
  const createQuestion = () => {
    setSelectedQuestion(null);
    setIsModalOpen(true);
  };

  // Open modal with existing question data
  const editQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
  };

  const saveQuestion = async (formData: any) => {
    try {
      if (selectedQuestion) {
        console.log(`✏️ Updating question ID: ${selectedQuestion.id}`, formData);
        
        // Simplify: Just map the form answers to the API format
        const formattedAnswers = formData.answers.map((a: any) => ({
          answer: a.text,
          correct: a.correct,
          questionId: selectedQuestion.id,
          id: a.id // Include ID if it exists
        }));
        
        console.log('Formatted answers for update:', formattedAnswers);
        
        // Update the question - no need to track deletions
        await api.questions.update(
          selectedQuestion.id,
          formData.question,
          formData.categoryId,
          formattedAnswers
        );
        
        console.log(`✅ Question updated successfully`);
      } else {
        // Create new question
        console.log(`➕ Creating new question:`, formData);
        
        const formattedAnswers = formData.answers.map((a: any) => ({
          answer: a.text,
          correct: a.correct
        }));
        
        console.log('Formatted answers for create:', formattedAnswers);
        
        await api.questions.create(
          formData.categoryId,
          formData.question,
          formattedAnswers
        );
        
        console.log(`✅ Question created successfully`);
      }
      
      // Reload questions to get the latest data
      await loadQuestions(categorySlug);
    } catch (err) {
      console.error(`❌ Failed to save question:`, err);
      throw err; // Let the modal handle the error display
    }
  };

  const deleteQuestion = async (question: Question) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log(`🗑️ Attempting to delete question ID: ${question.id}`);
      
      // First update the UI immediately to provide feedback
      setQuestions(prev => prev.filter(q => q.id !== question.id));
      
      // Then perform the actual deletion
      await api.questions.delete(question.id);
      console.log(`✅ Successfully deleted question ID: ${question.id}`);
    } catch (err) {
      console.error(`❌ Failed to delete question ID: ${question.id}:`, err);
      setError('Failed to delete question, please try again');
      // Refresh questions to restore the UI to the correct state
      await loadQuestions(categorySlug);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse p-4">Loading questions...</div>;
  }

  return (
    <div className="space-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Questions in this category</h2>
        <button 
          onClick={createQuestion}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Add New Question
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Question list */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <p>No questions yet.</p>
        ) : (
          questions.map(q => (
            <div key={q.id} className="bg-white text-black p-4 rounded shadow-md">
              <p className="font-semibold">{q.question}</p>
              <ul className="mt-2 pl-5 list-disc">
                {q.answers.map(a => (
                  <li key={a.id} className={a.correct ? 'text-green-700 font-bold' : ''}>
                    {a.answer} {a.correct && '(Correct)'}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex space-x-2">
                <button 
                  className="bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600"
                  onClick={() => editQuestion(q)}
                >
                  Edit
                </button>
                <button 
                  className="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
                  onClick={() => deleteQuestion(q)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for creating/editing questions */}
      <QuestionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={saveQuestion}
        question={selectedQuestion}
        categoryId={categoryId}
      />
    </div>
  );
}