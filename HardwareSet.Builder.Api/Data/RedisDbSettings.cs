namespace HardwareSet.Builder.Api.Data;

public class RedisDbSettings
{
    public const string SectionName = "Redis";

    public string ConnectionString { get; set; } = string.Empty;
    public string InstanceName { get; set; } = "HardwareSet_Builder_";
    public int DefaultTtlMinutes { get; set; } = 120;
}
