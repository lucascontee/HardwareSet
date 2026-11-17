using HardwareSet.Builder.Api.Models;

namespace HardwareSet.Builder.Api.Rules;

public class MissingComponentsRule : ICompatibilityRule
{
    public IEnumerable<CompatibilityIssue> Evaluate(IReadOnlyDictionary<string, BuildComponent> components)
    {
        var missingCategories = HardwareCategory.RequiredCategories
            .Where(cat => !components.ContainsKey(cat))
            .ToList();

        if (missingCategories.Count == 0)
        {
            yield break;
        }

        var missingLabels = missingCategories.Select(HardwareCategory.GetDisplayName);

        yield return new CompatibilityIssue
        {
            Code = "INCOMPLETE_BUILD",
            Severity = CompatibilitySeverity.Warning,
            Title = "Configuração ainda incompleta",
            Description = $"Faltam componentes essenciais para concluir a montagem: {string.Join(", ", missingLabels)}.",
            AffectedCategories = missingCategories
        };
    }
}
