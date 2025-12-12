import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
    const apiKey = process.env.API_KEY; 
    if (!apiKey) {
        console.warn("API_KEY is missing from environment variables.");
    }
    return new GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });
};

// Helper to safely parse JSON from AI response
const safeJSONParse = (text: string, fallback: any) => {
    try {
        // 1. Try to find a JSON code block
        const jsonBlock = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonBlock && jsonBlock[1]) {
            return JSON.parse(jsonBlock[1]);
        }
        
        // 2. Try to find the first { and last } if no block structure
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            return JSON.parse(text.substring(start, end + 1));
        }

        // 3. Try raw parse
        return JSON.parse(text);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return fallback;
    }
};

export interface FileData {
    mimeType: string;
    data: string; // Base64 encoded string
}

export interface QAConfig {
    mcq: number;
    fillInBlanks: number;
    short2: number;
    short5: number;
    long10: number;
    long15: number;
}

export const GeminiService = {
  // New Generic Structured Output Method
  generateStructuredJSON: async (prompt: string, schema: any, file?: FileData): Promise<any> => {
      try {
          const ai = getAI();
          const parts: any[] = [];
          if (file) {
              parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
          }
          parts.push({ text: prompt });

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts },
              config: {
                  responseMimeType: 'application/json',
                  responseSchema: schema
              }
          });
          return safeJSONParse(response.text || '{}', {});
      } catch (e) {
          console.error("Structured JSON Generation Error:", e);
          throw new Error("Failed to generate structured data.");
      }
  },

  summarize: async (text: string, file?: FileData): Promise<string> => {
    try {
        const ai = getAI();
        const parts: any[] = [];
        if (file) {
            parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
        }
        parts.push({ text: `Summarize the following content concisely for a student study aid.\n\nAdditional Context/Prompt: ${text}` });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
        });
        return response.text || "Could not generate summary.";
    } catch (e) {
        console.error("Gemini Summarize Error:", e);
        throw new Error("Failed to generate summary. Please check your connection.");
    }
  },

  chat: async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
      try {
          const ai = getAI();
          const chat = ai.chats.create({
              model: 'gemini-2.5-flash',
              history: history,
              config: {
                  systemInstruction: "You are a helpful and professional AI assistant."
              }
          });
          
          const response = await chat.sendMessage({ message });
          return response.text || "No response generated.";
      } catch (e) {
          console.error("Chat Error:", e);
          throw new Error("Chat service unavailable.");
      }
  },

  corporateSummarize: async (text: string, file: FileData | undefined, mode: 'EXEC' | 'ACTION' | 'ELI5'): Promise<string> => {
     try {
        const ai = getAI();
        const parts: any[] = [];
        if (file) {
            parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
        }
        
        let prompt = "";
        if (mode === 'EXEC') {
            prompt = "Provide an Executive Summary of this document. Limit to 3 key bullet points. Be concise, action-oriented, and non-academic.";
        } else if (mode === 'ACTION') {
            prompt = "Extract assigned tasks and Action Items from this document. If names are present, associate tasks with them. Format as a checklist.";
        } else {
            prompt = "Explain this concept like I'm 5 (ELI5) for a client explanation. Tone should be persuasive but simple. Avoid jargon.";
        }
        
        parts.push({ text: `${prompt}\n\nContext/Text: ${text}` });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts }
        });
        return response.text || "Could not generate analysis.";
     } catch (e) {
         console.error("Corporate Summarize Error:", e);
         throw new Error("Analysis failed.");
     }
  },

  codeReview: async (code: string, mode: 'REVIEW' | 'REFACTOR'): Promise<string> => {
      try {
        const ai = getAI();
        const prompt = mode === 'REVIEW' 
            ? "Act as a Senior Staff Engineer. Review the following code. Flag anti-patterns, detect security vulnerabilities, and suggest clean code alternatives. Be strict but constructive."
            : "Refactor the following code to reduce cyclomatic complexity and improve memory usage. Explain your changes briefly.";
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${prompt}\n\nCode:\n${code}`
        });
        return response.text || "No feedback generated.";
      } catch (e) {
          console.error("Code Review Error:", e);
          throw new Error("Code review failed.");
      }
  },

  polishEmail: async (content: string, tone: 'DIPLOMATIC' | 'ASSERTIVE' | 'LEADERSHIP'): Promise<string> => {
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Rewrite the following draft email/text to be ${tone.toLowerCase()}.
            
            Context:
            ${content}`
        });
        return response.text || "Could not polish text.";
      } catch (e) {
          console.error("Email Polish Error:", e);
          throw new Error("Text polishing failed.");
      }
  },

  analyzeBusinessStrategy: async (topic: string, framework: 'SWOT' | 'PESTLE'): Promise<any> => {
      try {
          const ai = getAI();
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `Perform a ${framework} analysis for the following business concept or company: "${topic}".
              
              Return the result strictly as a JSON object with keys corresponding to the framework categories.
              For SWOT: { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] }
              For PESTLE: { "political": [], "economic": [], "social": [], "technological": [], "legal": [], "environmental": [] }
              Each value must be an array of strings (bullet points).`,
              config: { responseMimeType: 'application/json' }
          });
          return safeJSONParse(response.text || '{}', {});
      } catch (e) {
          console.error("Business Analysis Error:", e);
          throw new Error("Analysis failed.");
      }
  },

  generatePitchDeck: async (idea: string): Promise<any[]> => {
      try {
          const ai = getAI();
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `Create a 5-slide pitch deck outline for this business idea: "${idea}".
              
              Return strictly a JSON array of objects:
              [
                  { "title": "Slide Title", "content": "Bulleted content for the slide", "visual": "Description of suggested image/chart" }
              ]`,
              config: { 
                  responseMimeType: 'application/json',
                  responseSchema: {
                      type: Type.ARRAY,
                      items: {
                          type: Type.OBJECT,
                          properties: {
                              title: { type: Type.STRING },
                              content: { type: Type.STRING },
                              visual: { type: Type.STRING }
                          }
                      }
                  }
               }
          });
          return safeJSONParse(response.text || '[]', []);
      } catch (e) {
          console.error("Pitch Deck Error:", e);
          throw new Error("Failed to generate pitch deck.");
      }
  },

  generateQuizByTopic: async (topic: string): Promise<any[]> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a 5-question multiple choice quiz on the topic: "${topic}". 
            Include a mix of difficult and moderate questions suitable for competitive exams.
            
            Return ONLY a JSON array with this structure:
            [
                {
                    "question": "The question text",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": "The exact text of the correct option",
                    "explanation": "A brief explanation of why this is correct"
                }
            ]`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.STRING },
                            explanation: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return safeJSONParse(response.text || '[]', []);
    } catch (e) {
        console.error("Quiz Gen Error:", e);
        throw new Error("Failed to generate quiz.");
    }
  },

  generateCurrentAffairs: async (): Promise<any[]> => {
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Perform a Google Search for the latest current affairs news (from today and yesterday) relevant for Indian competitive exams (UPSC/SSC).
            Focus on: International Relations, National Policy, Science/Space, and Economics.
            
            After searching, format the results strictly as a JSON object inside a code block.
            Ensure you include the source URL for each item.

            Required Structure:
            \`\`\`json
            {
                "newsItems": [
                    {
                        "title": "Headline",
                        "category": "Politics/Science/Economy/World",
                        "summary": "2-3 sentence summary",
                        "importance": "High/Medium",
                        "source": "Name of source",
                        "url": "URL of source"
                    }
                ]
            }
            \`\`\`
            `,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        
        const text = response.text || '{}';
        const parsed = safeJSONParse(text, {});
        return parsed.newsItems || []; 
      } catch (e) {
          console.error("News Fetch Error:", e);
          return [];
      }
  },

  generateFlashcards: async (content: string, file?: FileData): Promise<any[]> => {
    try {
        const ai = getAI();
        const parts: any[] = [];
        if (file) {
            parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
        }
        parts.push({ text: `Create 5 study flashcards from the provided content. Return valid JSON.\n\nContext: ${content}` });

        const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING },
                },
                required: ['front', 'back']
            },
            },
        },
        });
        return safeJSONParse(response.text || '[]', []);
    } catch (e) {
        console.error("Gemini Flashcard Error:", e);
        throw new Error("Failed to generate flashcards.");
    }
  },

  generateQA: async (content: string, file?: FileData, config?: QAConfig): Promise<any> => {
    try {
        const ai = getAI();
        const parts: any[] = [];
        if (file) {
            parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
        }

        // Default config if not provided
        const qty = config || {
            mcq: 5,
            fillInBlanks: 5,
            short2: 5,
            short5: 3,
            long10: 2,
            long15: 1
        };

        let prompt = `Generate a comprehensive Question & Answer set from this content strictly following this structure based on the requested counts:\n`;
        if (qty.fillInBlanks > 0) prompt += `- ${qty.fillInBlanks} Fill in the Blanks questions.\n`;
        if (qty.mcq > 0) prompt += `- ${qty.mcq} Multiple Choice Questions (MCQs).\n`;
        if (qty.short2 > 0) prompt += `- ${qty.short2} Short Answer Questions (2 Marks each).\n`;
        if (qty.short5 > 0) prompt += `- ${qty.short5} Short Answer Questions (5 Marks each).\n`;
        if (qty.long10 > 0) prompt += `- ${qty.long10} Long Answer Questions (10 Marks each).\n`;
        if (qty.long15 > 0) prompt += `- ${qty.long15} Long Answer Questions (15 Marks each).\n`;

        prompt += `\nEnsure the questions cover the uploaded material thoroughly.\nContext: ${content}`;

        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    fillInTheBlanks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING, description: "Sentence with a blank represented by underscores" },
                                answer: { type: Type.STRING }
                            }
                        }
                    },
                    mcq: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING }},
                                correctAnswer: { type: Type.STRING }
                            }
                        }
                    },
                    questions2Marks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                answer: { type: Type.STRING }
                            }
                        }
                    },
                    questions5Marks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                answer: { type: Type.STRING }
                            }
                        }
                    },
                    questions10Marks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                answer: { type: Type.STRING }
                            }
                        }
                    },
                    questions15Marks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                answer: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
        });
        return safeJSONParse(response.text || '{}', {});
    } catch (e) {
         console.error("Gemini QA Error:", e);
         throw new Error("Failed to generate Q&A.");
    }
  },

  generateMindMap: async (content: string, file?: FileData): Promise<string> => {
    try {
        const ai = getAI();
        const parts: any[] = [];
        if (file) {
            parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
        }
        parts.push({ text: `Generate a Mermaid.js mindmap based on the content below.
            
            STRICT RULES:
            1. Start strictly with "mindmap".
            2. Use indentation (2 or 4 spaces) to define hierarchy.
            3. Do NOT use brackets () [] {} inside node text unless they are wrapped in quotes.
            4. Keep node text short (2-5 words max).
            5. Do not output markdown code fences (no \`\`\`).
            6. Return ONLY the mermaid code.

            Context:
            ${content}` });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts }
        });
        let text = response.text || '';
        text = text.replace(/^```(mermaid)?/gm, '').replace(/```$/gm, '').trim();
        return text;
    } catch (e) {
         console.error("Gemini Mindmap Error:", e);
         throw new Error("Failed to generate Mind Map.");
    }
  },

  runCode: async (code: string, language: string): Promise<string> => {
     try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Act as a code execution engine. Simulate the output of the following ${language} code. 
            If there is an error, describe it. Only provide the output, no conversational filler.
            
            Code:
            ${code}`
        });
        return response.text || "No output.";
     } catch (e) {
         console.error("Gemini Code Run Error:", e);
         return "Error executing code via AI simulation.";
     }
  },

  generatePaper: async (topic: string, grade: string, file?: FileData, config?: QAConfig): Promise<any> => {
     try {
        const ai = getAI();
        const parts: any[] = [];
        if (file) {
             parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
        }
        
        let prompt = `Create a formal examination question paper for Grade ${grade} on the topic: ${topic}.`;

        if (config) {
            prompt += `\nStructure the paper EXACTLY with the following question counts:`;
            if (config.fillInBlanks > 0) prompt += `\n- ${config.fillInBlanks} Fill in the Blanks`;
            if (config.mcq > 0) prompt += `\n- ${config.mcq} Multiple Choice Questions`;
            if (config.short2 > 0) prompt += `\n- ${config.short2} Short Answer (2 marks)`;
            if (config.short5 > 0) prompt += `\n- ${config.short5} Short Answer (5 marks)`;
            if (config.long10 > 0) prompt += `\n- ${config.long10} Long Answer (10 marks)`;
            if (config.long15 > 0) prompt += `\n- ${config.long15} Essay/Long Answer (15 marks)`;
        } else {
             prompt += `\nInclude a mix of MCQs, Short Answers, and Long Answers.`;
        }
        
        prompt += `\nProvide the output in structured JSON.`;

        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        maxMarks: { type: Type.NUMBER },
                        instructions: { type: Type.ARRAY, items: { type: Type.STRING }},
                        sections: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    marksPerQuestion: { type: Type.NUMBER },
                                    questions: { 
                                        type: Type.ARRAY,
                                        items: { 
                                            type: Type.OBJECT,
                                            properties: {
                                                question: { type: Type.STRING },
                                                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Only for MCQs" }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return safeJSONParse(response.text || '{}', null);
     } catch (e) {
         console.error("Gemini Paper Gen Error:", e);
         throw new Error("Failed to generate question paper.");
     }
  },

  evaluateExam: async (examData: { question: string, type: string, maxMarks: number, originalAnswer: string, userAnswer: string }[]): Promise<any> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Evaluate the following student answers based on the questions and reference answers provided.
            
            Strict Rules for Evaluation:
            1. For Objective questions (MCQ, Fill in blanks), marks should only be awarded for exact or synonymous correctness.
            2. For Subjective/Long questions, evaluate based on Factual Accuracy and Semantic Meaning. 
               - Do NOT penalize if the wording is different from the reference answer as long as the core concept is correct.
               - If the answer is partially correct, award partial marks.
            
            Input Data:
            ${JSON.stringify(examData)}
            
            Return a JSON object with:
            - totalScore (number)
            - maxScore (number)
            - feedback (general summary string)
            - results (array of objects: { questionIndex: number, marksAwarded: number, isCorrect: boolean, feedback: string })
            `,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        totalScore: { type: Type.NUMBER },
                        maxScore: { type: Type.NUMBER },
                        feedback: { type: Type.STRING },
                        results: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    questionIndex: { type: Type.NUMBER },
                                    marksAwarded: { type: Type.NUMBER },
                                    isCorrect: { type: Type.BOOLEAN },
                                    feedback: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        return safeJSONParse(response.text || '{}', {});
    } catch (e) {
        console.error("Gemini Evaluation Error:", e);
        throw new Error("Failed to evaluate exam.");
    }
  },

  getImprovementAreas: async (): Promise<any[]> => {
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Analyze a hypothetical student's recent poor performance in Calculus (Derivatives) and Physics (Kinematics). Suggest 3 specific areas for improvement.",
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            topic: { type: Type.STRING },
                            suggestion: { type: Type.STRING },
                            priority: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return safeJSONParse(response.text || '[]', []);
      } catch (e) {
          console.error("Gemini Improvement Areas Error:", e);
          return []; // Return empty array gracefully on dashboard load failure
      }
  },

  search: async (query: string): Promise<any> => {
      try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview', // Only this model supports googleSearch tool for now in some contexts, defaulting safe model
            contents: `Search for information on: "${query}". Return a concise summary.`,
            config: { tools: [{ googleSearch: {} }] }
        });
        return response.text;
      } catch (e) {
        console.error("Search Error:", e);
        // Fallback to basic generation if search tool fails or model mismatch
        try {
            const ai = getAI();
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: query
            });
            return response.text;
        } catch (innerE) {
             return "Search unavailable.";
        }
      }
  }
};