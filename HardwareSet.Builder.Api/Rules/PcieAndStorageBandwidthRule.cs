using HardwareSet.Builder.Api.Models;

namespace HardwareSet.Builder.Api.Rules;

public class PcieAndStorageBandwidthRule : ICompatibilityRule
{
    public IEnumerable<CompatibilityIssue> Evaluate(IReadOnlyDictionary<string, BuildComponent> components)
    {
        if (!components.TryGetValue(HardwareCategory.Motherboard, out var motherboard))
        {
            yield break;
        }

        var mbPcieGen = HardwareSpecParser.ExtractPcieGeneration(motherboard);
        if (!mbPcieGen.HasValue)
        {
            yield break;
        }

        if (components.TryGetValue(HardwareCategory.Gpu, out var gpu))
        {
            var gpuPcieGen = HardwareSpecParser.ExtractPcieGeneration(gpu);
            if (gpuPcieGen.HasValue && gpuPcieGen.Value > mbPcieGen.Value)
            {
                yield return new CompatibilityIssue
                {
                    Code = "PCIE_GPU_GEN_BACKWARD_COMPAT",
                    Severity = CompatibilitySeverity.Info,
                    Title = $"Placa de vídeo PCIe {gpuPcieGen.Value}.0 em slot PCIe {mbPcieGen.Value}.0",
                    Description = $"A GPU '{gpu.Name}' (PCIe {gpuPcieGen.Value}.0) funcionará normalmente na placa-mãe '{motherboard.Name}' por retrocompatibilidade, operando na velocidade do barramento PCIe {mbPcieGen.Value}.0.",
                    AffectedCategories = [HardwareCategory.Gpu, HardwareCategory.Motherboard]
                };
            }
        }

        if (components.TryGetValue(HardwareCategory.Ssd, out var ssd))
        {
            var ssdPcieGen = HardwareSpecParser.ExtractPcieGeneration(ssd);
            if (ssdPcieGen.HasValue && ssdPcieGen.Value > mbPcieGen.Value)
            {
                yield return new CompatibilityIssue
                {
                    Code = "PCIE_SSD_GEN_BACKWARD_COMPAT",
                    Severity = CompatibilitySeverity.Info,
                    Title = $"SSD NVMe Gen{ssdPcieGen.Value} em barramento PCIe {mbPcieGen.Value}.0",
                    Description = $"O armazenamento '{ssd.Name}' é compatível com '{motherboard.Name}', mas sua taxa máxima ficará limitada à banda PCIe {mbPcieGen.Value}.0 da placa-mãe.",
                    AffectedCategories = [HardwareCategory.Ssd, HardwareCategory.Motherboard]
                };
            }
        }
    }
}
