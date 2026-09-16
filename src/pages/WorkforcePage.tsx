import { SectionHeading } from "../components/ui";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { AvailableEmployeeCard, EmployeeCard } from "../features/workforce/EmployeeCard";

export default function WorkforcePage() {
  const employees = useWorkspaceStore((s) => s.employees);
  const activity = useWorkspaceStore((s) => s.activity);
  const hireEmployee = useWorkspaceStore((s) => s.hireEmployee);

  const hired = employees.filter((e) => e.isHired);
  const available = employees.filter((e) => !e.isHired);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Workforce"
        title="Your AI workforce"
        description="Mero recommends employees based on what your company needs. You decide who joins."
      />

      <div>
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">Hired ({hired.length})</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hired.map((e) => (
            <EmployeeCard key={e.id} employee={e} activityCount={activity.filter((a) => a.employeeId === e.id).length} />
          ))}
        </div>
      </div>

      {available.length > 0 && (
        <div>
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-faint">Available to hire ({available.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {available.map((e) => (
              <AvailableEmployeeCard key={e.id} roleKey={e.roleKey} onHire={() => hireEmployee(e.roleKey)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
