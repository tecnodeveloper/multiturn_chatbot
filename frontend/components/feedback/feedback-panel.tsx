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
  onSubmitted?: () => void;
}

export const FeedbackPanel: FC<FeedbackPanelProps> = ({ chatId, messageId, onSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [correctness, setCorrectness] = useState<string>("");
  const [lengthType, setLengthType] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fourScaleRatings = [
    { value: 1, label: "1 - Poor / Inaccurate" },
    { value: 2, label: "2 - Needs Improvement" },
    { value: 3, label: "3 - Accurate & Helpful" },
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
        onSubmitted();
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
      <div className="my-6 relative rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center text-green-700 dark:text-green-300 animate-in fade-in zoom-in duration-300">
        <div className="mb-2 flex justify-center">
          <CheckCircle2 className="h-7 w-7 text-green-500" />
        </div>
        <h3 className="text-base font-semibold">Evaluation Submitted Successfully</h3>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">Thank you. Your feedback has been recorded and chat input is now unlocked.</p>
      </div>
    );
  }

  return (
    <div className="my-6 relative overflow-hidden rounded-xl border-2 border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20 shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Mandatory Lock Header - NO SKIP or CLOSE BUTTONS */}
      <div className="bg-amber-500/15 px-6 py-3 border-b border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
            Mandatory Evaluation (Required Every 2 Turns)
          </h3>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500 text-white uppercase tracking-wider">
          Required to unlock chat
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* 1-4 Scale Rating */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            1. Overall Response Rating (1–4 Scale) *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {fourScaleRatings.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setRating(item.value)}
                className={`px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all text-center ${
                  rating === item.value
                    ? "border-amber-500 bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/40"
                    : "border-border bg-background hover:bg-muted text-foreground"
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
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              2. Response Correctness *
            </label>
            <div className="flex flex-col gap-2">
              {[
                { id: "correct", label: "Correct", icon: CheckCircle2, color: "text-green-500" },
                { id: "partial", label: "Partial", icon: AlertCircle, color: "text-amber-500" },
                { id: "incorrect", label: "Incorrect", icon: XCircle, color: "text-red-500" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCorrectness(item.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                    correctness === item.id
                      ? "border-blue-500 bg-blue-500/10 font-semibold ring-1 ring-blue-500"
                      : "border-border bg-background hover:bg-muted"
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
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Ruler className="h-4 w-4 text-purple-500" />
              3. Response Length Type *
            </label>
            <div className="flex flex-col gap-2">
              {[
                { id: "short", label: "Short" },
                { id: "to_the_point", label: "To the Point" },
                { id: "lengthy", label: "Lengthy" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLengthType(item.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                    lengthType === item.id
                      ? "border-purple-500 bg-purple-500/10 font-semibold ring-1 ring-purple-500"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${
                    lengthType === item.id ? "bg-purple-500" : "bg-gray-300 dark:bg-gray-600"
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
            className="w-full h-11 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || !correctness || !lengthType}
          >
            {isSubmitting ? "Submitting Evaluation..." : "Submit Mandatory Evaluation & Unlock Chat"}
          </Button>
        </div>
      </div>
    </div>
  );
};

