using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HardwareSet.Api.Entities;

[BsonIgnoreExtraElements]
public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("category")]
    public string Category { get; set; } = string.Empty;

    [BsonElement("price")]
    [BsonRepresentation(BsonType.Decimal128)]
    public decimal Price { get; set; }

    [BsonElement("imageUrl")]
    public string ImageUrl { get; set; } = string.Empty;

    [BsonElement("purchaseDate")]
    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;

    [BsonElement("attributes")]
    public Dictionary<string, string> Attributes { get; set; } = new();
}
