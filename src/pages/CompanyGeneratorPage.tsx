import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IdeaStep } from "../features/company/IdeaStep";
import { BlueprintReviewStep } from "../features/company/BlueprintReviewStep";
import { CreationAnimationStep } from "../features/company/CreationAnimationStep";
import { buildBlueprintFromIdea, useWorkspaceStore } from "../store/useWorkspaceStore";
import type { CompanyBlueprint } from "../data/companyGenerator";
import type { EmployeeRoleKey } from "../types";

type Step = "idea" | "review" | "creating";

export default function CompanyGeneratorPage() {
  const [step, setStep] = useState<Step>("idea");
  const [idea, setIdea] = useState("");
  const [blueprint, setBlueprint] = useState<CompanyBlueprint | null>(null);
  const [pendingHire, setPendingHire] = useState<EmployeeRoleKey[]>([]);
  const createCompany = useWorkspaceStore((s) => s.createCompany);
  const navigate = useNavigate();

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
          setPendingHire(hiredKeys);
          setStep("creating");
        }}
      />
    );
  }

  return (
    <CreationAnimationStep
      onComplete={() => {
        if (blueprint) createCompany(blueprint, idea, pendingHire);
        navigate("/app");
      }}
    />
  );
}
