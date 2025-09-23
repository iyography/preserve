import React from "react";
import type { Persona } from "@shared/schema";
import { Save, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { UseMutationResult } from "@tanstack/react-query";

// Advanced Questionnaire Form Component Interfaces and Types
interface QuestionnaireResponse {
  questionId: string;
  question: string;
  answer: string;
  type: string;
}

interface AdvancedQuestionnaireFormProps {
  personaName: string;
  onSubmit: (responses: QuestionnaireResponse[]) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  onProgressChange: (progress: number) => void;
}

// Advanced Questionnaire Form Component
function AdvancedQuestionnaireForm({ personaName, onSubmit, onCancel, isSubmitting, onProgressChange }: AdvancedQuestionnaireFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [responses, setResponses] = React.useState<Record<string, string>>({});
  
  // Define the 20 questions across 3 types
  const questions = [
    // Multiple Choice Questions (7 questions)
    {
      id: 'q1',
      type: 'multiple_choice',
      category: 'Communication',
      question: `How did ${personaName} typically express affection?`,
      options: ['Words of affirmation', 'Physical touch', 'Acts of service', 'Quality time', 'Gift giving', 'Written notes/messages']
    },
    {
      id: 'q2',
      type: 'multiple_choice',
      category: 'Social',
      question: `What was ${personaName}'s preferred social setting?`,
      options: ['Large gatherings', 'Small intimate groups', 'One-on-one conversations', 'Family-only events', 'Community events', 'Quiet at home']
    },
    {
      id: 'q3',
      type: 'multiple_choice',
      category: 'Communication',
      question: `How did ${personaName} typically handle disagreements?`,
      options: ['Direct conversation', 'Needed time to think first', 'Avoided confrontation', 'Used humor to defuse', 'Sought compromise', 'Got passionate but fair']
    },
    {
      id: 'q4',
      type: 'multiple_choice',
      category: 'Personality',
      question: `What was ${personaName}'s approach to new experiences?`,
      options: ['Embraced adventure', 'Cautiously curious', 'Preferred familiar routines', 'Researched thoroughly first', 'Went with the flow', 'Needed encouragement']
    },
    {
      id: 'q5',
      type: 'multiple_choice',
      category: 'Values',
      question: `What motivated ${personaName} most in life?`,
      options: ['Family and relationships', 'Personal achievement', 'Helping others', 'Learning and growth', 'Security and stability', 'Creative expression']
    },
    {
      id: 'q6',
      type: 'multiple_choice',
      category: 'Lifestyle',
      question: `How did ${personaName} typically spend free time?`,
      options: ['Reading or learning', 'Physical activities', 'Social activities', 'Creative pursuits', 'Quiet reflection', 'Home projects']
    },
    {
      id: 'q7',
      type: 'multiple_choice',
      category: 'Communication',
      question: `What was ${personaName}'s communication style?`,
      options: ['Direct and straightforward', 'Gentle and diplomatic', 'Humorous and lighthearted', 'Deep and philosophical', 'Practical and solution-focused', 'Emotional and expressive']
    },
    
    // Rating Scale Questions (7 questions)
    {
      id: 'q8',
      type: 'rating_scale',
      category: 'Social',
      question: `On a scale of 1-10, how important was family time to ${personaName}?`,
      scale: { min: 1, max: 10, minLabel: 'Not important', maxLabel: 'Extremely important' }
    },
    {
      id: 'q9',
      type: 'rating_scale',
      category: 'Personality',
      question: `How spontaneous was ${personaName}? (1 = Very planned, 10 = Very spontaneous)`,
      scale: { min: 1, max: 10, minLabel: 'Very planned', maxLabel: 'Very spontaneous' }
    },
    {
      id: 'q10',
      type: 'rating_scale',
      category: 'Social',
      question: `How outgoing was ${personaName} in social situations? (1 = Very shy, 10 = Very outgoing)`,
      scale: { min: 1, max: 10, minLabel: 'Very shy', maxLabel: 'Very outgoing' }
    },
    {
      id: 'q11',
      type: 'rating_scale',
      category: 'Values',
      question: `How important was personal independence to ${personaName}? (1-10)`,
      scale: { min: 1, max: 10, minLabel: 'Not important', maxLabel: 'Extremely important' }
    },
    {
      id: 'q12',
      type: 'rating_scale',
      category: 'Emotion',
      question: `How emotionally expressive was ${personaName}? (1 = Very reserved, 10 = Very expressive)`,
      scale: { min: 1, max: 10, minLabel: 'Very reserved', maxLabel: 'Very expressive' }
    },
    {
      id: 'q13',
      type: 'rating_scale',
      category: 'Lifestyle',
      question: `How much did ${personaName} enjoy trying new things? (1-10)`,
      scale: { min: 1, max: 10, minLabel: 'Preferred routine', maxLabel: 'Loved novelty' }
    },
    {
      id: 'q14',
      type: 'rating_scale',
      category: 'Values',
      question: `How important was helping others to ${personaName}? (1-10)`,
      scale: { min: 1, max: 10, minLabel: 'Not a priority', maxLabel: 'Core value' }
    },
    
    // Open-ended Questions (6 questions)
    {
      id: 'q15',
      type: 'open_ended',
      category: 'Wisdom',
      question: `Describe ${personaName}'s approach to giving advice or solving problems.`
    },
    {
      id: 'q16',
      type: 'open_ended',
      category: 'Humor',
      question: `What was ${personaName}'s sense of humor like? Share an example if you can.`
    },
    {
      id: 'q17',
      type: 'open_ended',
      category: 'Relationships',
      question: `How did ${personaName} show they cared about someone? What were their unique ways of expressing love?`
    },
    {
      id: 'q18',
      type: 'open_ended',
      category: 'Fears',
      question: `What were ${personaName}'s biggest fears or concerns? How did they handle worry or anxiety?`
    },
    {
      id: 'q19',
      type: 'open_ended',
      category: 'Dreams',
      question: `What were ${personaName}'s dreams, aspirations, or things they were most proud of?`
    },
    {
      id: 'q20',
      type: 'open_ended',
      category: 'Legacy',
      question: `What would ${personaName} want to be remembered for? What was their lasting impact on others?`
    }
  ];

  const updateResponse = (questionId: string, answer: string) => {
    setResponses(prev => ({ ...prev, [questionId]: answer }));
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  React.useEffect(() => {
    onProgressChange(progress);
  }, [progress, onProgressChange]);

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const questionnaireResponses: QuestionnaireResponse[] = questions
      .filter(q => responses[q.id])
      .map(q => ({
        questionId: q.id,
        question: q.question,
        answer: responses[q.id],
        type: q.type
      }));

    onSubmit(questionnaireResponses);
  };

  const isCurrentAnswered = responses[currentQuestion.id]?.trim().length > 0;
  const totalAnswered = Object.keys(responses).filter(key => responses[key]?.trim()).length;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Question {currentStep + 1} of {questions.length}</span>
          <span>{totalAnswered}/{questions.length} answered</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {currentQuestion.category}
          </div>
          <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
        </div>

        {/* Answer Input Based on Question Type */}
        {currentQuestion.type === 'multiple_choice' && (
          <div className="space-y-2">
            {currentQuestion.options!.map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={responses[currentQuestion.id] === option}
                  onChange={(e) => updateResponse(currentQuestion.id, e.target.value)}
                  className="text-purple-600"
                  data-testid={`radio-${currentQuestion.id}-${option.replace(/\s+/g, '-').toLowerCase()}`}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}

        {currentQuestion.type === 'rating_scale' && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{currentQuestion.scale!.minLabel}</span>
              <span>{currentQuestion.scale!.maxLabel}</span>
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: currentQuestion.scale!.max }, (_, i) => i + 1).map((value) => (
                <label key={value} className="flex flex-col items-center space-y-1 cursor-pointer">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={value.toString()}
                    checked={responses[currentQuestion.id] === value.toString()}
                    onChange={(e) => updateResponse(currentQuestion.id, e.target.value)}
                    className="text-purple-600"
                    data-testid={`rating-${currentQuestion.id}-${value}`}
                  />
                  <span className="text-sm">{value}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {currentQuestion.type === 'open_ended' && (
          <Textarea
            placeholder="Share your thoughts..."
            value={responses[currentQuestion.id] || ''}
            onChange={(e) => updateResponse(currentQuestion.id, e.target.value)}
            rows={4}
            data-testid={`textarea-${currentQuestion.id}`}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
            data-testid="button-questionnaire-cancel"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            data-testid="button-questionnaire-previous"
          >
            Previous
          </Button>
        </div>
        
        <div className="flex space-x-2">
          {currentStep < questions.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isCurrentAnswered}
              data-testid="button-questionnaire-next"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || totalAnswered < 5} // Require at least 5 answers
              data-testid="button-questionnaire-submit"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Complete Questionnaire
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface EnhancePersonaDialogsProps {
  personas: Persona[];
  isLegacyDialogOpen: boolean;
  setIsLegacyDialogOpen: (open: boolean) => void;
  isQuestionnaireDialogOpen: boolean;
  setIsQuestionnaireDialogOpen: (open: boolean) => void;
  selectedEnhancementPersona: string | null;
  legacyUrl: string;
  setLegacyUrl: (url: string) => void;
  extractedContent: string;
  setExtractedContent: (content: string) => void;
  reviewedContent: string;
  setReviewedContent: (content: string) => void;
  isExtracting: boolean;
  setIsExtracting: (extracting: boolean) => void;
  questionnaireProgress: number;
  setQuestionnaireProgress: (progress: number) => void;
  legacyImportMutation: UseMutationResult<any, Error, { personaId: string; url?: string; reviewedContent?: string }, unknown>;
  questionnaireMutation: UseMutationResult<any, Error, { personaId: string; responses: QuestionnaireResponse[] }, unknown>;
}

export default function EnhancePersonaDialogs({
  personas,
  isLegacyDialogOpen,
  setIsLegacyDialogOpen,
  isQuestionnaireDialogOpen,
  setIsQuestionnaireDialogOpen,
  selectedEnhancementPersona,
  legacyUrl,
  setLegacyUrl,
  extractedContent,
  setExtractedContent,
  reviewedContent,
  setReviewedContent,
  isExtracting,
  setIsExtracting,
  questionnaireProgress,
  setQuestionnaireProgress,
  legacyImportMutation,
  questionnaireMutation,
}: EnhancePersonaDialogsProps) {
  const { toast } = useToast();

  return (
    <>
      {/* Legacy.com Integration Dialog */}
      <Dialog open={isLegacyDialogOpen} onOpenChange={setIsLegacyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import from Legacy.com</DialogTitle>
            <DialogDescription>
              Enter a Legacy.com obituary URL to extract and import content to enhance your persona's knowledge.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="legacy-url" className="text-sm font-medium">
                Legacy.com Obituary URL
              </label>
              <Input
                id="legacy-url"
                type="url"
                placeholder="https://www.legacy.com/us/obituaries/..."
                value={legacyUrl}
                onChange={(e) => setLegacyUrl(e.target.value)}
                disabled={isExtracting || legacyImportMutation.isPending}
                data-testid="input-legacy-url"
              />
            </div>
            
            {!extractedContent && (
              <Button
                onClick={() => {
                  if (!legacyUrl) {
                    toast({
                      title: "URL Required",
                      description: "Please enter a Legacy.com obituary URL",
                      variant: "destructive",
                    });
                    return;
                  }
                  setIsExtracting(true);
                  legacyImportMutation.mutate({
                    personaId: selectedEnhancementPersona!,
                    url: legacyUrl
                  });
                  setIsExtracting(false);
                }}
                disabled={!legacyUrl || isExtracting || legacyImportMutation.isPending}
                className="w-full"
                data-testid="button-extract-content"
              >
                {isExtracting || legacyImportMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Extracting Content...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Extract Content
                  </>
                )}
              </Button>
            )}
            
            {extractedContent && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="reviewed-content" className="text-sm font-medium">
                    Extracted Content (Review & Edit)
                  </label>
                  <Textarea
                    id="reviewed-content"
                    placeholder="Review and edit the extracted content before saving..."
                    value={reviewedContent}
                    onChange={(e) => setReviewedContent(e.target.value)}
                    rows={10}
                    className="text-sm"
                    data-testid="textarea-reviewed-content"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Please review the extracted content for accuracy before saving. You can edit it to add or remove information.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsLegacyDialogOpen(false);
                setLegacyUrl('');
                setExtractedContent('');
                setReviewedContent('');
              }}
              data-testid="button-cancel-legacy"
            >
              Cancel
            </Button>
            {extractedContent && (
              <Button
                onClick={() => {
                  if (!reviewedContent.trim()) {
                    toast({
                      title: "Content Required",
                      description: "Please review and approve the content before saving",
                      variant: "destructive",
                    });
                    return;
                  }
                  legacyImportMutation.mutate({
                    personaId: selectedEnhancementPersona!,
                    reviewedContent: reviewedContent
                  });
                }}
                disabled={!reviewedContent.trim() || legacyImportMutation.isPending}
                data-testid="button-save-legacy-content"
              >
                {legacyImportMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Content
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Questionnaire Dialog */}
      <Dialog open={isQuestionnaireDialogOpen} onOpenChange={setIsQuestionnaireDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Questionnaire</DialogTitle>
            <DialogDescription>
              Answer these questions to help us better understand your loved one's personality, preferences, and unique characteristics.
            </DialogDescription>
          </DialogHeader>
          
          <AdvancedQuestionnaireForm
            personaName={personas.find((p: Persona) => p.id === selectedEnhancementPersona)?.name || "your loved one"}
            onSubmit={(responses) => {
              questionnaireMutation.mutate({
                personaId: selectedEnhancementPersona!,
                responses
              });
            }}
            onCancel={() => setIsQuestionnaireDialogOpen(false)}
            isSubmitting={questionnaireMutation.isPending}
            onProgressChange={setQuestionnaireProgress}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}