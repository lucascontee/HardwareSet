using HardwareSet.Builder.Api.Models;

namespace HardwareSet.Builder.Api.Services;

public interface ICompatibilityService
{
    CompatibilityReport Evaluate(IReadOnlyDictionary<string, BuildComponent> components);
}
