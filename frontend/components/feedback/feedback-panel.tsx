"use client";

import { FC, useState } from "react";
import { Star, CheckCircle2, AlertCircle, XCircle, Ruler, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { submitFeedback } from "@/lib/feedback-service";
import { useAuth } from "@/context/auth-context";

interface FeedbackPanelProps {
  chatId: string;
  messageId?: string;
  onSubmitted?: (messageId?: string) => void;
  initialSubmitted?: boolean;
}

export const FeedbackPanel: FC<FeedbackPanelProps> = ({ chatId, messageId, onSubmitted, initialSubmitted = false }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [correctness, setCorrectness] = useState<string>("");
  const [lengthType, setLengthType] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(initialSubmitted);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if initialSubmitted changes
  if (initialSubmitted && !isSubmitted) {
    setIsSubmitted(true);
  }

  const fourScaleRatings = [
    { value: 1, label: "1 - Poor / inaccurate" },
    { value: 2, label: "2 - Needs improvement" },
    { value: 3, label: "3 - Accurate & helpful" },
    { value: 4, label: "4 - Exceptional" },
  ];

  const handleSubmit = async () => {
    if (rating === 0 || !correctness || !lengthType) {
      toast.error("Please select a rating, correctness, and length type before submitting.");
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
        message_id: messageId,
        rating,
        correctness,
        length_type: lengthType,
      });
      setIsSubmitted(true);
      toast.success("Feedback submitted! Chat input unlocked.");
      if (onSubmitted) {
        onSubmitted(messageId);
      }
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to submit feedback: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="my-6 relative rounded-xl border border-[#f5a623]/30 bg-[#f5a623]/10 p-5 text-center text-foreground animate-in fade-in zoom-in duration-300">
        <div className="mb-2 flex justify-center">
          <CheckCircle2 className="h-7 w-7 text-[#f5a623]" />
        </div>
        <h3 className="text-base font-medium">Evaluation submitted successfully</h3>
        <p className="text-xs text-muted-foreground mt-1">Thank you. Your feedback has been recorded and chat input is now unlocked.</p>
      </div>
    );
  }

  return (
    <div className="my-6 relative overflow-hidden rounded-xl border-2 border-[#f5a623]/40 bg-[#f5a623]/5 dark:bg-[#f5a623]/10 shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Mandatory Lock Header - NO SKIP or CLOSE BUTTONS */}
      <div className="bg-[#f5a623]/15 px-6 py-3 border-b border-[#f5a623]/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[#f5a623]" />
          <h3 className="text-sm font-medium text-foreground">
            Mandatory evaluation (required after each response)
          </h3>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#f5a623] text-[#0f1117] uppercase tracking-wider">
          Required to unlock chat
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* 1-4 Scale Rating */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Star className="h-4 w-4 text-[#f5a623]" />
            1. Overall response rating (1–4 scale) *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {fourScaleRatings.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setRating(item.value)}
                className={`px-3 py-2.5 rounded-lg border text-xs transition-all text-center ${
                  rating === item.value
                    ? "border-[#f5a623] bg-[#f5a623] text-[#0f1117] font-medium shadow-sm ring-2 ring-[#f5a623]/30"
                    : "border-border bg-background hover:bg-muted text-foreground font-normal"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Correctness (PDF Specs: Correct / Partial / Incorrect) */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#f5a623]" />
              2. Response correctness *
            </label>
            <div className="flex flex-col gap-2">
              {[
                { id: "correct", label: "Correct", icon: CheckCircle2, color: "text-[#f5a623]" },
                { id: "partial", label: "Partial", icon: AlertCircle, color: "text-[#f5a623]/80" },
                { id: "incorrect", label: "Incorrect", icon: XCircle, color: "text-muted-foreground" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCorrectness(item.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-xs transition-all ${
                    correctness === item.id
                      ? "border-[#f5a623] bg-[#f5a623]/10 font-medium text-foreground ring-1 ring-[#f5a623]/40"
                      : "border-border bg-background hover:bg-muted font-normal text-muted-foreground"
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Length Type (PDF Specs: Short / To the Point / Lengthy) */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Ruler className="h-4 w-4 text-[#f5a623]" />
              3. Response length type *
            </label>
            <div className="flex flex-col gap-2">
              {[
                { id: "short", label: "Short" },
                { id: "to_the_point", label: "To the point" },
                { id: "lengthy", label: "Lengthy" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLengthType(item.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-xs transition-all ${
                    lengthType === item.id
                      ? "border-[#f5a623] bg-[#f5a623]/10 font-medium text-foreground ring-1 ring-[#f5a623]/40"
                      : "border-border bg-background hover:bg-muted font-normal text-muted-foreground"
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${
                    lengthType === item.id ? "bg-[#f5a623]" : "bg-muted-foreground/30"
                  }`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Action Only - No Skip / Cancel Options */}
        <div className="pt-2">
          <Button 
            type="button"
            className="w-full h-11 text-sm font-medium bg-[#f5a623] hover:bg-[#e09612] text-[#0f1117] shadow-md transition-all hover:scale-[1.005] active:scale-[0.995] disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || !correctness || !lengthType}
          >
            {isSubmitting ? "Submitting evaluation..." : "Submit mandatory evaluation & unlock chat"}
          </Button>
        </div>
      </div>
    </div>
  );
};
