using HardwareSet.Builder.Api.Models;

namespace HardwareSet.Builder.Api.Rules;

public class CpuMotherboardSocketRule : ICompatibilityRule
{
    public IEnumerable<CompatibilityIssue> Evaluate(IReadOnlyDictionary<string, BuildComponent> components)
    {
        if (!components.TryGetValue(HardwareCategory.Cpu, out var cpu) ||
            !components.TryGetValue(HardwareCategory.Motherboard, out var motherboard))
        {
            yield break;
        }

        var cpuSocket = HardwareSpecParser.ExtractSocket(cpu);
        var mbSocket = HardwareSpecParser.ExtractSocket(motherboard);

        if (string.IsNullOrWhiteSpace(cpuSocket) || string.IsNullOrWhiteSpace(mbSocket))
        {
            yield return new CompatibilityIssue
            {
                Code = "SOCKET_UNVERIFIED",
                Severity = CompatibilitySeverity.Warning,
                Title = "Soquete não identificado automaticamente",
                Description = $"Não foi possível confirmar o soquete entre '{cpu.Name}' e '{motherboard.Name}'. Verifique o atributo 'socket' nas especificações.",
                AffectedCategories = [HardwareCategory.Cpu, HardwareCategory.Motherboard]
            };
            yield break;
        }

        if (!string.Equals(cpuSocket, mbSocket, StringComparison.OrdinalIgnoreCase))
        {
            yield return new CompatibilityIssue
            {
                Code = "SOCKET_MISMATCH",
                Severity = CompatibilitySeverity.Error,
                Title = "Incompatibilidade de soquete (CPU e Placa-Mãe)",
                Description = $"O processador '{cpu.Name}' utiliza o soquete {cpuSocket}, mas a placa-mãe '{motherboard.Name}' possui soquete {mbSocket}.",
                AffectedCategories = [HardwareCategory.Cpu, HardwareCategory.Motherboard]
            };
        }
    }
}
