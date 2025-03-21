'use client';

import { Category, Question, Answer } from './api-types';
import { getApiUrl } from './simpleApi'; // Import the helper function

// Helper to normalize category data for frontend consumption
const normalizeCategory = (category: any): Category => ({
  id: category.id,
  title: category.title || '', // Backend uses title
  slug: category.slug
});

// Helper to normalize question data for frontend consumption
const normalizeQuestion = (question: any): Question => ({
  id: question.id,
  question: question.question || '', // Backend uses question
  categoryId: question.categoryId,
  category: question.category ? normalizeCategory(question.category) : undefined,
  answers: Array.isArray(question.answers) 
    ? question.answers.map(normalizeAnswer)
    : []
});

// Helper to normalize answer data
const normalizeAnswer = (answer: any): Answer => ({
  id: answer.id,
  answer: answer.answer || '', // Backend uses answer
  correct: answer.correct || false,
  questionId: answer.questionId
});

export async function getCategories(): Promise<Category[]> {
  console.log("Fetching categories from client component");
  
  // Use our proxy helper function
  const endpoint = '/categories';
  const url = getApiUrl(endpoint);
  console.log("Using URL:", url);
  
  try {
    const response = await fetch(url, { cache: "no-store" });
    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error fetching categories. Status:", response.status, "Body:", errorBody);
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    const data = await response.json();
    console.log("Categories data received:", data);
    return data.data ? data.data : data;
  } catch (error) {
    console.error("Exception in getCategories:", error);
    throw error; // rethrow so the UI can catch it as well
  }
}

export async function getCategory(slug: string): Promise<Category> {
  // Use our proxy helper function
  const endpoint = `/categories/${slug}`;
  const url = getApiUrl(endpoint);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch category: ${response.status}`);
  }
  
  const result = await response.json();
  return normalizeCategory(result);
}

export async function getQuestionsByCategory(slug: string): Promise<Question[]> {
  console.log(`Fetching questions for category: ${slug}`);
  
  // Use our proxy helper function
  const endpoint = `/questions/category/${slug}`;
  const url = getApiUrl(endpoint);
  console.log("Using URL:", url);
  
  try {
    const response = await fetch(url);
    console.log("Response status (questions):", response.status);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error fetching questions. Status:", response.status, "Body:", errorBody);
      throw new Error(`Failed to fetch questions: ${response.status}`);
    }
    const result = await response.json();
    console.log("Questions data received:", result);
    const questionsData = result.data ? result.data : result;
    return Array.isArray(questionsData) 
      ? questionsData.map(normalizeQuestion) 
      : [];
  } catch (error) {
    console.error("Exception in getQuestionsByCategory:", error);
    throw error;
  }
}
