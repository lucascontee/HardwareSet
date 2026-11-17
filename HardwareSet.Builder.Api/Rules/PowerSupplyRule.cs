using HardwareSet.Builder.Api.Models;

namespace HardwareSet.Builder.Api.Rules;

public class PowerSupplyRule : ICompatibilityRule
{
    public IEnumerable<CompatibilityIssue> Evaluate(IReadOnlyDictionary<string, BuildComponent> components)
    {
        var hasPowerHungryParts =
            components.ContainsKey(HardwareCategory.Cpu) ||
            components.ContainsKey(HardwareCategory.Gpu);

        if (!hasPowerHungryParts && !components.ContainsKey(HardwareCategory.Psu))
        {
            yield break;
        }

        var (estimatedTdp, recommendedWatts, providedPsuWatts) =
            HardwareSpecParser.CalculatePowerProfile(components);

        if (!components.TryGetValue(HardwareCategory.Psu, out var psu))
        {
            yield return new CompatibilityIssue
            {
                Code = "PSU_RECOMMENDATION",
                Severity = CompatibilitySeverity.Info,
                Title = $"Fonte recomendada: mínimo de {recommendedWatts}W",
                Description = $"O consumo estimado das peças atuais é de {estimatedTdp}W. Recomendamos uma fonte de pelo menos {recommendedWatts}W para operar com folga energética.",
                AffectedCategories = [HardwareCategory.Psu]
            };
            yield break;
        }

        if (!providedPsuWatts.HasValue)
        {
            yield return new CompatibilityIssue
            {
                Code = "PSU_WATTAGE_UNKNOWN",
                Severity = CompatibilitySeverity.Warning,
                Title = "Potência da fonte não identificada",
                Description = $"Não foi possível identificar a potência em Watts da fonte '{psu.Name}'. Certifique-se de que ela possui ao menos {recommendedWatts}W.",
                AffectedCategories = [HardwareCategory.Psu]
            };
            yield break;
        }

        if (providedPsuWatts.Value < estimatedTdp)
        {
            yield return new CompatibilityIssue
            {
                Code = "PSU_INSUFFICIENT_POWER",
                Severity = CompatibilitySeverity.Error,
                Title = "Potência da fonte insuficiente para o setup",
                Description = $"A fonte '{psu.Name}' ({providedPsuWatts.Value}W) é inferior ao consumo estimado do sistema ({estimatedTdp}W). Escolha uma fonte de pelo menos {recommendedWatts}W.",
                AffectedCategories = [HardwareCategory.Psu, HardwareCategory.Gpu, HardwareCategory.Cpu]
            };
        }
        else if (providedPsuWatts.Value < recommendedWatts)
        {
            yield return new CompatibilityIssue
            {
                Code = "PSU_LOW_HEADROOM",
                Severity = CompatibilitySeverity.Warning,
                Title = "Margem de potência da fonte reduzida",
                Description = $"A fonte '{psu.Name}' ({providedPsuWatts.Value}W) cobre o consumo estimado ({estimatedTdp}W), mas fica abaixo da margem recomendada de {recommendedWatts}W para picos de carga.",
                AffectedCategories = [HardwareCategory.Psu, HardwareCategory.Gpu]
            };
        }
    }
}
