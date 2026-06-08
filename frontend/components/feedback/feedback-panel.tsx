"use client";

import { FC, useState } from "react";
import { Star, CheckCircle2, AlertCircle, XCircle, Ruler, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { submitFeedback } from "@/lib/feedback-service";
import { useAuth } from "@/context/auth-context";

interface FeedbackPanelProps {
  chatId: string;
}

export const FeedbackPanel: FC<FeedbackPanelProps> = ({ chatId }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [correctness, setCorrectness] = useState<string>("");
  const [lengthType, setLengthType] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleRating = (value: number) => setRating(value);

  const handleSubmit = async () => {
    if (rating === 0 || !correctness || !lengthType) {
      toast.error("Please fill in all feedback fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to submit feedback");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        chat_id: chatId,
        user_id: user.id,
        rating,
        correctness,
        length_type: lengthType,
      });
      setIsSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to submit feedback: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDismissed) return null;

  if (isSubmitted) {
    return (
      <div className="my-6 relative rounded-xl border border-green-200 bg-green-50/50 p-6 text-center dark:border-green-900/30 dark:bg-green-900/10">
        <button 
          onClick={() => setIsDismissed(true)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mb-2 flex justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Feedback Submitted!</h3>
        <p className="text-sm text-green-600 dark:text-green-400">Your input helps us improve MultiTurn AI.</p>
      </div>
    );
  }

  return (
    <div className="my-6 relative overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => setIsDismissed(true)}
        className="absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors"
        title="Dismiss feedback"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="bg-primary/5 px-6 py-3 border-b border-border flex items-center gap-2">
        <Info className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-primary">Help us Improve</h3>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Rating */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Overall Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className={`transition-all hover:scale-110 ${
                  star <= rating ? "text-amber-500" : "text-gray-300 dark:text-gray-600"
                }`}
              >
                <Star className="h-8 w-8" fill={star <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Correctness */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              Correctness
            </label>
            <div className="flex flex-col gap-2">
              {[
                { id: "correct", label: "Correct", icon: CheckCircle2, color: "text-green-500" },
                { id: "partial", label: "Partially Correct", icon: AlertCircle, color: "text-amber-500" },
                { id: "incorrect", label: "Incorrect", icon: XCircle, color: "text-red-500" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCorrectness(item.id)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg border text-sm transition-all ${
                    correctness === item.id
                      ? "border-primary bg-primary/5 font-medium ring-1 ring-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Length Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Ruler className="h-4 w-4 text-purple-500" />
              Response Length
            </label>
            <div className="flex flex-col gap-2">
              {[
                { id: "short", label: "Too Short" },
                { id: "perfect", label: "Just Right" },
                { id: "long", label: "Too Long" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLengthType(item.id)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg border text-sm transition-all ${
                    lengthType === item.id
                      ? "border-primary bg-primary/5 font-medium ring-1 ring-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${
                    lengthType === item.id ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  }`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline"
            className="flex-1 h-11 text-sm font-semibold"
            onClick={() => setIsDismissed(true)}
            disabled={isSubmitting}
          >
            Maybe Later
          </Button>
          <Button 
            className="flex-[2] h-11 text-sm font-semibold shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </div>
    </div>
  );
};
