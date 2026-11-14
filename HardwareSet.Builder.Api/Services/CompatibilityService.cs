using HardwareSet.Builder.Api.Models;
using HardwareSet.Builder.Api.Rules;

namespace HardwareSet.Builder.Api.Services;

public class CompatibilityService : ICompatibilityService
{
    private readonly IEnumerable<ICompatibilityRule> _rules;

    public CompatibilityService(IEnumerable<ICompatibilityRule> rules)
    {
        _rules = rules;
    }

    public CompatibilityReport Evaluate(IReadOnlyDictionary<string, BuildComponent> components)
    {
        var issues = _rules
            .SelectMany(rule => rule.Evaluate(components))
            .OrderByDescending(issue => issue.Severity)
            .ToList();

        var (estimatedTdp, recommendedWatts, providedPsuWatts) =
            HardwareSpecParser.CalculatePowerProfile(components);

        var isComplete = HardwareCategory.RequiredCategories
            .All(category => components.ContainsKey(category));

        var hasBlockingErrors = issues.Any(issue => issue.Severity == CompatibilitySeverity.Error);

        return new CompatibilityReport
        {
            IsCompatible = !hasBlockingErrors,
            IsComplete = isComplete,
            EstimatedTdpWatts = estimatedTdp,
            RecommendedPsuWatts = recommendedWatts,
            ProvidedPsuWatts = providedPsuWatts,
            Issues = issues
        };
    }
}
