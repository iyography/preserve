import React from "react";
import type { Persona } from "@shared/schema";
import { Save, LinkIcon, FileText } from "lucide-react";
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
  personaId: string;
  personaName: string;
  onSubmit: (responses: QuestionnaireResponse[]) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  onProgressChange: (progress: number) => void;
}

// Advanced Questionnaire Form Component
function AdvancedQuestionnaireForm({ personaId, personaName, onSubmit, onCancel, isSubmitting, onProgressChange }: AdvancedQuestionnaireFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [responses, setResponses] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Define the 30 relationship-focused questions
  const questions = [
    // Communication & Language Patterns
    {
      id: 'q1',
      type: 'open_ended',
      category: 'Communication',
      question: `How did ${personaName} typically greet you? Include their specific phrases, whether they used pet names for you, and if their greeting changed based on time of day or how long since they'd seen you.`
    },
    {
      id: 'q2',
      type: 'open_ended',
      category: 'Communication',
      question: `What phrases or expressions did ${personaName} use specifically with you? Include inside jokes, references only you two understood, or things they'd say that became "your thing."`
    },
    {
      id: 'q3',
      type: 'open_ended',
      category: 'Communication',
      question: `How did ${personaName} tell stories to you? When sharing experiences with you, did they assume you knew context, repeat favorite stories, or tell them differently than to others?`
    },
    {
      id: 'q4',
      type: 'open_ended',
      category: 'Communication',
      question: `What subjects did ${personaName} avoid discussing with you? Were there topics they'd deflect when you brought them up, or things they'd never share with you specifically?`
    },
    
    // Emotional Expression & Reactions
    {
      id: 'q5',
      type: 'open_ended',
      category: 'Emotion',
      question: `How did ${personaName} show affection toward you? Were they physically affectionate with you, express love verbally, or show it through specific actions unique to your relationship?`
    },
    {
      id: 'q6',
      type: 'open_ended',
      category: 'Emotion',
      question: `What could you do or say that would make ${personaName} laugh? What inside jokes did you share, and how did they respond to your sense of humor?`
    },
    {
      id: 'q7',
      type: 'open_ended',
      category: 'Emotion',
      question: `How did ${personaName} handle disagreements with you? When you two had conflict, what was their pattern - did they need space, want to talk it out immediately, or have specific ways of making up?`
    },
    {
      id: 'q8',
      type: 'open_ended',
      category: 'Emotion',
      question: `What about you triggered strong reactions in ${personaName}? What could you do that would make them especially proud, worried, upset, or joyful?`
    },
    
    // Life Philosophy & Values
    {
      id: 'q9',
      type: 'open_ended',
      category: 'Values',
      question: `What advice did ${personaName} repeatedly give you? What wisdom did they share specifically about your life choices, challenges, or situations?`
    },
    {
      id: 'q10',
      type: 'open_ended',
      category: 'Values',
      question: `What did ${personaName} always want you to understand or believe? What principles or values did they try hardest to instill in you?`
    },
    {
      id: 'q11',
      type: 'open_ended',
      category: 'Values',
      question: `How did ${personaName} respond to your successes and failures? What would they say when you achieved something or when you fell short?`
    },
    {
      id: 'q12',
      type: 'open_ended',
      category: 'Values',
      question: `What did ${personaName} tell you about death, loss, or their own mortality? Did they share fears, wishes, or beliefs about death specifically with you?`
    },
    
    // Daily Life & Preferences
    {
      id: 'q13',
      type: 'open_ended',
      category: 'Daily Life',
      question: `How did your presence fit into ${personaName}'s daily routine? When did they prefer to see/talk to you, and how did you affect their typical day?`
    },
    {
      id: 'q14',
      type: 'open_ended',
      category: 'Daily Life',
      question: `What did ${personaName} do when they needed comfort from you? How did they seek support from you when stressed or sad, and what comfort could only you provide?`
    },
    {
      id: 'q15',
      type: 'open_ended',
      category: 'Daily Life',
      question: `How did ${personaName} involve you in their decisions? Did they seek your opinion, tell you after deciding, or have specific types of decisions they'd always run by you?`
    },
    {
      id: 'q16',
      type: 'open_ended',
      category: 'Daily Life',
      question: `What quirky habits did ${personaName} have around you? Any specific rituals when you visited, things they'd only do with you, or habits you noticed that others didn't?`
    },
    
    // Relationships & Social Patterns
    {
      id: 'q17',
      type: 'open_ended',
      category: 'Relationships',
      question: `How did ${personaName} support you during your hard times? What would they specifically say or do when you were struggling, grieving, or in pain?`
    },
    {
      id: 'q18',
      type: 'open_ended',
      category: 'Relationships',
      question: `How did ${personaName} celebrate your achievements? How did they react to your good news, and what would they do to mark your special moments?`
    },
    {
      id: 'q19',
      type: 'open_ended',
      category: 'Relationships',
      question: `What role did ${personaName} play in your life? Were they your protector, cheerleader, teacher, confidant, or another specific role unique to your relationship?`
    },
    {
      id: 'q20',
      type: 'open_ended',
      category: 'Relationships',
      question: `How did ${personaName} act when you introduced them to people important to you? How did they behave when meeting your friends, partners, or other significant people?`
    },
    
    // Interests & Expertise
    {
      id: 'q21',
      type: 'open_ended',
      category: 'Interests',
      question: `What topics did ${personaName} love discussing with you? What subjects would they eagerly explore with you, and how did they teach or share their knowledge with you?`
    },
    {
      id: 'q22',
      type: 'open_ended',
      category: 'Interests',
      question: `What did ${personaName} try to teach you? What skills, knowledge, or capabilities did they specifically want to pass on to you?`
    },
    {
      id: 'q23',
      type: 'open_ended',
      category: 'Interests',
      question: `What did ${personaName} share with you - books, shows, music? What content did they recommend or insist you experience together?`
    },
    
    // Memory & Storytelling
    {
      id: 'q24',
      type: 'open_ended',
      category: 'Memory',
      question: `What stories about you did ${personaName} tell most often? How did they describe you to others, and what moments from your shared history did they love recounting?`
    },
    {
      id: 'q25',
      type: 'open_ended',
      category: 'Memory',
      question: `What did ${personaName} tell you about their life before you? What stories from their past did they share specifically with you, and why those particular ones?`
    },
    {
      id: 'q26',
      type: 'open_ended',
      category: 'Memory',
      question: `What moments with you did ${personaName} say changed them? What impact did they say you had on their life, and what did your relationship mean to them?`
    },
    
    // Problem-Solving & Opinions
    {
      id: 'q27',
      type: 'open_ended',
      category: 'Problem-Solving',
      question: `How did ${personaName} respond when you needed help? When you came to them with problems, what was their approach to helping you specifically?`
    },
    {
      id: 'q28',
      type: 'open_ended',
      category: 'Problem-Solving',
      question: `What opinions did ${personaName} express most strongly to you? What beliefs or views did they particularly want you to understand or adopt?`
    },
    {
      id: 'q29',
      type: 'open_ended',
      category: 'Problem-Solving',
      question: `How did ${personaName} give you feedback or criticism? When they needed to correct you or disagreed with your choices, how did they approach it?`
    },
    
    // Legacy & Self-Perception
    {
      id: 'q30',
      type: 'open_ended',
      category: 'Legacy',
      question: `What did ${personaName} explicitly want you to remember about them? What did they say they hoped you'd carry forward, and how did they want to live on in your life?`
    }
  ];

  // Load saved progress on mount
  React.useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await fetch(`/api/personas/${personaId}/questionnaire/progress`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.responses && Object.keys(data.responses).length > 0) {
            setResponses(data.responses);
            setCurrentStep(data.currentStep || 0);
            toast({
              title: "Progress Loaded",
              description: "Your previously saved progress has been restored.",
            });
          }
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProgress();
  }, [personaId, toast]);

  const updateResponse = (questionId: string, answer: string) => {
    setResponses(prev => ({ ...prev, [questionId]: answer }));
  };

  const saveProgress = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/personas/${personaId}/questionnaire/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentStep,
          responses,
          isCompleted: false
        })
      });

      if (response.ok) {
        toast({
          title: "Progress Saved",
          description: "You can continue this questionnaire later from where you left off.",
        });
        onCancel(); // Close the dialog after saving
      } else {
        throw new Error('Failed to save progress');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save your progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading your progress...</span>
      </div>
    );
  }

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

        {/* Answer Input - All questions are now open-ended */}
        <Textarea
          placeholder="Share your thoughts and memories..."
          value={responses[currentQuestion.id] || ''}
          onChange={(e) => updateResponse(currentQuestion.id, e.target.value)}
          rows={6}
          className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
          data-testid={`textarea-${currentQuestion.id}`}
        />
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
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              data-testid="button-questionnaire-previous"
            >
              Previous
            </Button>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={saveProgress}
            disabled={isSaving || totalAnswered === 0}
            data-testid="button-questionnaire-save"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save & Continue Later
              </>
            )}
          </Button>
          
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
              disabled={isSubmitting || totalAnswered < 10} // Require at least 10 answers
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
            
            {!extractedContent && !reviewedContent && (
              <div className="space-y-3">
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
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">or</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReviewedContent("Paste the obituary text here...\n\nOf [Name], peacefully... [Add full obituary content]");
                    }}
                    className="w-full"
                    data-testid="button-manual-input"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Paste Content Manually
                  </Button>
                  <p className="text-xs text-gray-400 mt-1">
                    If automatic extraction fails, copy the obituary text from Legacy.com and paste it here
                  </p>
                </div>
              </div>
            )}
            
            {(extractedContent || reviewedContent) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="reviewed-content" className="text-sm font-medium">
                    {extractedContent ? 'Extracted Content (Review & Edit)' : 'Obituary Content'}
                  </label>
                  <Textarea
                    id="reviewed-content"
                    placeholder="Paste the obituary text here..."
                    value={reviewedContent}
                    onChange={(e) => setReviewedContent(e.target.value)}
                    rows={10}
                    className="text-sm"
                    data-testid="textarea-reviewed-content"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {extractedContent 
                    ? 'Please review the extracted content for accuracy before saving. You can edit it to add or remove information.'
                    : 'Copy the obituary text from Legacy.com and paste it here. Include details like relationships, personality, interests, and life events.'
                  }
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
            {(extractedContent || reviewedContent) && (
              <Button
                onClick={() => {
                  if (!reviewedContent.trim()) {
                    toast({
                      title: "Content Required",
                      description: "Please add obituary content before saving",
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
            personaId={selectedEnhancementPersona!}
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