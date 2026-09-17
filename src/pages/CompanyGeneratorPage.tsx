import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EnableAIStep } from "../features/company/EnableAIStep";
import { IdeaStep } from "../features/company/IdeaStep";
import { BlueprintReviewStep } from "../features/company/BlueprintReviewStep";
import { CreationAnimationStep } from "../features/company/CreationAnimationStep";
import { buildBlueprintFromIdea, useWorkspaceStore } from "../store/useWorkspaceStore";
import { isAIEnabled } from "../ai/resolveProvider";
import type { CompanyBlueprint } from "../data/companyGenerator";

type Step = "enable-ai" | "idea" | "review" | "creating";

export default function CompanyGeneratorPage() {
  const [step, setStep] = useState<Step>(isAIEnabled() ? "idea" : "enable-ai");
  const [idea, setIdea] = useState("");
  const [blueprint, setBlueprint] = useState<CompanyBlueprint | null>(null);
  const [creationPromise, setCreationPromise] = useState<Promise<void> | null>(null);
  const createCompany = useWorkspaceStore((s) => s.createCompany);
  const navigate = useNavigate();

  if (step === "enable-ai") {
    return <EnableAIStep onContinue={() => setStep("idea")} />;
  }

  if (step === "idea") {
    return (
      <IdeaStep
        onSubmit={(text) => {
          setIdea(text);
          setBlueprint(buildBlueprintFromIdea(text));
          setStep("review");
        }}
      />
    );
  }

  if (step === "review" && blueprint) {
    return (
      <BlueprintReviewStep
        initial={blueprint}
        onBack={() => setStep("idea")}
        onConfirm={(finalBlueprint, hiredKeys) => {
          setBlueprint(finalBlueprint);
          setCreationPromise(createCompany(finalBlueprint, idea, hiredKeys));
          setStep("creating");
        }}
      />
    );
  }

  return <CreationAnimationStep websiteReady={creationPromise} onComplete={() => navigate("/app")} />;
}
