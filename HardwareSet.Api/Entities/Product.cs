using System.Text.Json.Serialization;
using HardwareSet.Api.Converters;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HardwareSet.Api.Entities;

public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("price")]
    [BsonRepresentation(BsonType.Decimal128)]
    public decimal Price { get; set; }

    [BsonElement("price")]
    public string FotoUrl { get; set; }

    public DateTime PurchaseDate { get; set; }

    public Dictionary<string, string> Attributes { get; set; } = new();
}
