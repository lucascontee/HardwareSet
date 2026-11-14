using System.Text.RegularExpressions;
using HardwareSet.Builder.Api.Models;

namespace HardwareSet.Builder.Api.Rules;

public static partial class HardwareSpecParser
{
    private static readonly string[] KnownSockets =
    [
        "AM5",
        "AM4",
        "LGA1851",
        "LGA1700",
        "LGA1200",
        "LGA1151",
        "STR5",
        "TR4"
    ];

    public static string? ExtractSocket(BuildComponent component)
    {
        if (TryGetAttribute(component, out var explicitSocket, "socket", "soquete"))
        {
            var normalized = NormalizeSocket(explicitSocket);
            if (!string.IsNullOrWhiteSpace(normalized))
            {
                return normalized;
            }
        }

        foreach (var text in EnumerateSearchableText(component))
        {
            foreach (var socket in KnownSockets)
            {
                if (Regex.IsMatch(text, $@"\b{Regex.Escape(socket)}\b", RegexOptions.IgnoreCase))
                {
                    return socket.ToUpperInvariant();
                }
            }
        }

        return null;
    }

    public static string? ExtractMemoryGeneration(BuildComponent component)
    {
        if (TryGetAttribute(component, out var memAttr, "ramType", "memoryType", "memory", "capacity", "memoria"))
        {
            var match = DdrRegex().Match(memAttr);
            if (match.Success)
            {
                return match.Value.ToUpperInvariant();
            }
        }

        foreach (var text in EnumerateSearchableText(component))
        {
            var match = DdrRegex().Match(text);
            if (match.Success)
            {
                return match.Value.ToUpperInvariant();
            }
        }

        return null;
    }

    public static int? ExtractWatts(BuildComponent component, params string[] preferredKeys)
    {
        foreach (var key in preferredKeys)
        {
            if (component.Attributes.TryGetValue(key, out var rawValue) && !string.IsNullOrWhiteSpace(rawValue))
            {
                var parsed = ParseWattsFromText(rawValue);
                if (parsed.HasValue)
                {
                    return parsed.Value;
                }
            }
        }

        foreach (var text in EnumerateSearchableText(component))
        {
            var match = WattsRegex().Match(text);
            if (match.Success && int.TryParse(match.Groups[1].Value, out var watts))
            {
                return watts;
            }
        }

        return null;
    }

    public static int? ExtractPcieGeneration(BuildComponent component)
    {
        foreach (var text in EnumerateSearchableText(component))
        {
            var match = PcieGenRegex().Match(text);
            if (match.Success && int.TryParse(match.Groups[1].Value, out var gen))
            {
                return gen;
            }
        }

        return null;
    }

    public static (int EstimatedTdpWatts, int RecommendedPsuWatts, int? ProvidedPsuWatts) CalculatePowerProfile(
        IReadOnlyDictionary<string, BuildComponent> components)
    {
        const int basePlatformWatts = 50; // Placa-mãe, NVMe, memórias e ventoinhas
        var totalTdp = basePlatformWatts;

        if (components.TryGetValue(HardwareCategory.Cpu, out var cpu))
        {
            var cpuTdp = ExtractWatts(cpu, "tdp", "power", "consumo") ?? 95;
            totalTdp += cpuTdp;
        }

        if (components.TryGetValue(HardwareCategory.Gpu, out var gpu))
        {
            var gpuTdp = ExtractWatts(gpu, "tdp", "power", "consumo") ?? 200;
            totalTdp += gpuTdp;
        }

        // Margem de segurança de 25% para picos transientes, arredondada para múltiplos de 50W
        var rawRecommended = Math.Max(450, (int)Math.Ceiling(totalTdp * 1.25 / 50.0) * 50);

        int? providedPsuWatts = null;
        if (components.TryGetValue(HardwareCategory.Psu, out var psu))
        {
            providedPsuWatts = ExtractWatts(psu, "wattage", "potencia", "power", "tdp");
        }

        return (totalTdp, rawRecommended, providedPsuWatts);
    }

    private static int? ParseWattsFromText(string text)
    {
        var match = WattsRegex().Match(text);
        if (match.Success && int.TryParse(match.Groups[1].Value, out var watts))
        {
            return watts;
        }

        if (int.TryParse(text.Trim(), out var pureNumber) && pureNumber is >= 15 and <= 2500)
        {
            return pureNumber;
        }

        return null;
    }

    private static string NormalizeSocket(string raw)
    {
        var cleaned = raw.Trim().ToUpperInvariant().Replace(" ", "").Replace("-", "");
        return cleaned;
    }

    private static bool TryGetAttribute(BuildComponent component, out string value, params string[] keys)
    {
        foreach (var key in keys)
        {
            if (component.Attributes.TryGetValue(key, out var found) && !string.IsNullOrWhiteSpace(found))
            {
                value = found;
                return true;
            }
        }

        value = string.Empty;
        return false;
    }

    private static IEnumerable<string> EnumerateSearchableText(BuildComponent component)
    {
        if (!string.IsNullOrWhiteSpace(component.Name))
        {
            yield return component.Name;
        }

        foreach (var (_, attrValue) in component.Attributes)
        {
            if (!string.IsNullOrWhiteSpace(attrValue))
            {
                yield return attrValue;
            }
        }
    }

    [GeneratedRegex(@"\b(DDR[345])\b", RegexOptions.IgnoreCase)]
    private static partial Regex DdrRegex();

    [GeneratedRegex(@"\b(\d{2,4})\s*W\b", RegexOptions.IgnoreCase)]
    private static partial Regex WattsRegex();

    [GeneratedRegex(@"PCIe\s*(?:Gen\s*)?([345])(?:\.0)?", RegexOptions.IgnoreCase)]
    private static partial Regex PcieGenRegex();
}
