using HardwareSet.Builder.Api.Models;

namespace HardwareSet.Builder.Api.Rules;

public interface ICompatibilityRule
{
    IEnumerable<CompatibilityIssue> Evaluate(IReadOnlyDictionary<string, BuildComponent> components);
}
