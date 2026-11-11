using System.Text.Json;
using System.Text.Json.Serialization;
using MongoDB.Bson;

namespace HardwareSet.Api.Converters;

public class BsonDocumentJsonConverter : JsonConverter<BsonDocument>
{
    public override BsonDocument? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return null;
        }

        using var jsonDocument = JsonDocument.ParseValue(ref reader);
        return BsonDocument.Parse(jsonDocument.RootElement.GetRawText());
    }

    public override void Write(Utf8JsonWriter writer, BsonDocument value, JsonSerializerOptions options)
    {
        if (value is null)
        {
            writer.WriteNullValue();
            return;
        }

        var dotNetValue = BsonTypeMapper.MapToDotNetValue(value);
        JsonSerializer.Serialize(writer, dotNetValue, options);
    }
}
