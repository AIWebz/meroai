import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EnableAIStep } from "../features/company/EnableAIStep";
import { IdeaStep } from "../features/company/IdeaStep";
import { DesigningCompanyStep } from "../features/company/DesigningCompanyStep";
import { BlueprintReviewStep } from "../features/company/BlueprintReviewStep";
import { CreationAnimationStep } from "../features/company/CreationAnimationStep";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { isAIEnabled } from "../ai/resolveProvider";
import type { CompanyBlueprint } from "../data/companyGenerator";
import type { ProductType } from "../types";

type Step = "enable-ai" | "idea" | "designing" | "review" | "creating";

export default function CompanyGeneratorPage() {
  const [step, setStep] = useState<Step>(isAIEnabled() ? "idea" : "enable-ai");
  const [idea, setIdea] = useState("");
  const [productType, setProductType] = useState<ProductType>("shop");
  const [blueprint, setBlueprint] = useState<CompanyBlueprint | null>(null);
  const createCompany = useWorkspaceStore((s) => s.createCompany);
  const navigate = useNavigate();

  if (step === "enable-ai") {
    return <EnableAIStep onContinue={() => setStep("idea")} />;
  }

  if (step === "idea") {
    return (
      <IdeaStep
        onSubmit={(text, type) => {
          setIdea(text);
          setProductType(type);
          setStep("designing");
        }}
      />
    );
  }

  if (step === "designing") {
    return (
      <DesigningCompanyStep
        idea={idea}
        productType={productType}
        onReady={(b) => {
          setBlueprint(b);
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
        onConfirm={(finalBlueprint) => {
          setBlueprint(finalBlueprint);
          createCompany(finalBlueprint, idea);
          setStep("creating");
        }}
      />
    );
  }

  return <CreationAnimationStep onComplete={() => navigate("/app")} />;
}
