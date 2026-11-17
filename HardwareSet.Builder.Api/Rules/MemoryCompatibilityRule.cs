using HardwareSet.Builder.Api.Models;

namespace HardwareSet.Builder.Api.Rules;

public class MemoryCompatibilityRule : ICompatibilityRule
{
    public IEnumerable<CompatibilityIssue> Evaluate(IReadOnlyDictionary<string, BuildComponent> components)
    {
        if (!components.TryGetValue(HardwareCategory.Ram, out var ram))
        {
            yield break;
        }

        var ramGen = HardwareSpecParser.ExtractMemoryGeneration(ram);
        if (string.IsNullOrWhiteSpace(ramGen))
        {
            yield break;
        }

        if (components.TryGetValue(HardwareCategory.Motherboard, out var motherboard))
        {
            var mbRamGen = HardwareSpecParser.ExtractMemoryGeneration(motherboard);
            if (!string.IsNullOrWhiteSpace(mbRamGen) &&
                !string.Equals(ramGen, mbRamGen, StringComparison.OrdinalIgnoreCase))
            {
                yield return new CompatibilityIssue
                {
                    Code = "RAM_MOTHERBOARD_MISMATCH",
                    Severity = CompatibilitySeverity.Error,
                    Title = "Padrão de memória RAM incompatível com a Placa-Mãe",
                    Description = $"A memória '{ram.Name}' é do padrão {ramGen}, enquanto a placa-mãe '{motherboard.Name}' suporta {mbRamGen}.",
                    AffectedCategories = [HardwareCategory.Ram, HardwareCategory.Motherboard]
                };
            }
        }

        if (components.TryGetValue(HardwareCategory.Cpu, out var cpu))
        {
            var cpuSocket = HardwareSpecParser.ExtractSocket(cpu);
            if (string.Equals(cpuSocket, "AM4", StringComparison.OrdinalIgnoreCase) &&
                string.Equals(ramGen, "DDR5", StringComparison.OrdinalIgnoreCase))
            {
                yield return new CompatibilityIssue
                {
                    Code = "RAM_CPU_SOCKET_MISMATCH",
                    Severity = CompatibilitySeverity.Error,
                    Title = "Processador AM4 incompatível com memória DDR5",
                    Description = $"O processador '{cpu.Name}' (plataforma AM4) possui controlador de memória exclusivo para DDR4.",
                    AffectedCategories = [HardwareCategory.Cpu, HardwareCategory.Ram]
                };
            }
            else if (string.Equals(cpuSocket, "AM5", StringComparison.OrdinalIgnoreCase) &&
                     string.Equals(ramGen, "DDR4", StringComparison.OrdinalIgnoreCase))
            {
                yield return new CompatibilityIssue
                {
                    Code = "RAM_CPU_SOCKET_MISMATCH",
                    Severity = CompatibilitySeverity.Error,
                    Title = "Processador AM5 incompatível com memória DDR4",
                    Description = $"O processador '{cpu.Name}' (plataforma AM5) exige memórias do padrão DDR5.",
                    AffectedCategories = [HardwareCategory.Cpu, HardwareCategory.Ram]
                };
            }
        }
    }
}
