using HardwareSet.Api.Entities;
using MongoDB.Driver;

namespace HardwareSet.Api.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(MongoDbContext context, bool forceReset = false, CancellationToken cancellationToken = default)
    {
        if (forceReset)
        {
            await context.Products.DeleteManyAsync(Builders<Product>.Filter.Empty, cancellationToken);
        }

        var existingCount = await context.Products.CountDocumentsAsync(
            Builders<Product>.Filter.Empty,
            cancellationToken: cancellationToken);

        if (existingCount > 0)
        {
            return;
        }

        var initialProducts = GetInitialProducts();
        await context.Products.InsertManyAsync(initialProducts, cancellationToken: cancellationToken);
    }

    public static List<Product> GetInitialProducts() =>
    [
        new Product
        {
            Name = "RX 9070",
            Category = "gpu",
            Price = 4590.00m,
            ImageUrl = "https://dlcdnwebimgs.asus.com/gain/9a412979-3657-437f-91c7-aa677c0bd9ba/w800",
            PurchaseDate = DateTime.UtcNow,
            Attributes = new Dictionary<string, string>
            {
                ["brand"] = "AMD Radeon / ASUS",
                ["tagline"] = "Arquitetura RDNA 4 · 16GB GDDR6 · Ray Tracing",
                ["vram"] = "16GB GDDR6",
                ["bus"] = "256-bit",
                ["interface"] = "PCIe 5.0 x16",
                ["tdp"] = "220W"
            }
        },
        new Product
        {
            Name = "RTX 5070",
            Category = "gpu",
            Price = 4890.00m,
            ImageUrl = "https://assets.nvidia.partners/images/png/5070-1000x1000.png",
            PurchaseDate = DateTime.UtcNow,
            Attributes = new Dictionary<string, string>
            {
                ["brand"] = "NVIDIA GeForce",
                ["tagline"] = "Arquitetura Blackwell · 12GB GDDR7 · DLSS 4",
                ["vram"] = "12GB GDDR7",
                ["bus"] = "192-bit",
                ["interface"] = "PCIe 5.0 x16",
                ["tdp"] = "250W"
            }
        },
        new Product
        {
            Name = "Ryzen 7 5700X",
            Category = "cpu",
            Price = 1290.00m,
            ImageUrl = "https://i0.wp.com/esgaming.co.ke/wp-content/uploads/2023/02/Ryzen-7-5700X-Processor.png?fit=1000%2C1000&ssl=1",
            PurchaseDate = DateTime.UtcNow,
            Attributes = new Dictionary<string, string>
            {
                ["brand"] = "AMD Ryzen",
                ["tagline"] = "8 Núcleos · 16 Threads · Boost até 4.6 GHz · AM4",
                ["cores"] = "8C / 16T",
                ["boostClock"] = "4.6 GHz",
                ["cache"] = "36MB (L2+L3)",
                ["tdp"] = "65W"
            }
        },
        new Product
        {
            Name = "B550M Aorus Elite",
            Category = "motherboard",
            Price = 890.00m,
            ImageUrl = "https://static.gigabyte.com/StaticFile/Image/Global/1b1da8c384156857305f63d8986c98ec/Product/40296",
            PurchaseDate = DateTime.UtcNow,
            Attributes = new Dictionary<string, string>
            {
                ["brand"] = "Gigabyte Aorus",
                ["tagline"] = "Micro-ATX · Chipset AMD B550 · PCIe 4.0 · Dual M.2",
                ["socket"] = "AM4",
                ["formFactor"] = "Micro-ATX",
                ["memory"] = "4x DDR4 até 128GB",
                ["pcie"] = "PCIe 4.0 x16"
            }
        },
        new Product
        {
            Name = "ROG Strix",
            Category = "motherboard",
            Price = 1490.00m,
            ImageUrl = "https://dlcdnwebimgs.asus.com/gain/38460501-ED11-4ADB-B4DD-6C9FE5BE2684/w717/h525",
            PurchaseDate = DateTime.UtcNow,
            Attributes = new Dictionary<string, string>
            {
                ["brand"] = "ASUS Republic of Gamers",
                ["tagline"] = "ATX · VRM 12+2 Fases · Áudio SupremeFX · 2.5Gb LAN",
                ["socket"] = "AM4",
                ["formFactor"] = "ATX",
                ["vrm"] = "12+2 Power Stages",
                ["networking"] = "Intel 2.5Gb Ethernet"
            }
        },
        new Product
        {
            Name = "Memoria Ram Redragon 8gb DDR4",
            Category = "ram",
            Price = 260.00m,
            ImageUrl = "https://static.wixstatic.com/media/71a6c2_eb197edd01894282b64fc7948b595025~mv2.png/v1/fill/w_889,h_311,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/02.png",
            PurchaseDate = DateTime.UtcNow,
            Attributes = new Dictionary<string, string>
            {
                ["brand"] = "Redragon",
                ["tagline"] = "8GB DDR4 · 3200MHz · Dissipador em Alumínio",
                ["capacity"] = "8GB DDR4",
                ["frequency"] = "3200 MT/s",
                ["latency"] = "CL16",
                ["voltage"] = "1.35V XMP 2.0"
            }
        },
        new Product
        {
            Name = "Fonte 650w Corsair",
            Category = "psu",
            Price = 460.00m,
            ImageUrl = "https://img.terabyteshop.com.br/produto/g/fonte-corsair-cx650-cp-9020122-ww-650w-atxeps-23-pfc-ativo_41301.png",
            PurchaseDate = DateTime.UtcNow,
            Attributes = new Dictionary<string, string>
            {
                ["brand"] = "Corsair CX650",
                ["tagline"] = "650W · Certificação 80 Plus Bronze · PFC Ativo",
                ["wattage"] = "650W Reais",
                ["efficiency"] = "80 Plus Bronze",
                ["pfc"] = "PFC Ativo",
                ["cooling"] = "Fan 120mm Low-Noise"
            }
        },
        new Product
        {
            Name = "SSD Sandisk 1tb",
            Category = "ssd",
            Price = 680.00m,
            ImageUrl = "https://www.sandisk.com/content/dam/sandisk/en-us/assets/products/internal-storage/wd-black-sn7100-nvme-internal-ssd/gallery/wd-black-sn7100-nvme-internal-ssd-1tb-left.png.wdthumb.1280.1280.png",
            PurchaseDate = DateTime.UtcNow,
            Attributes = new Dictionary<string, string>
            {
                ["brand"] = "SanDisk / WD Black",
                ["tagline"] = "1TB M.2 2280 · PCIe Gen4 x4 · Leitura até 7.250 MB/s",
                ["capacity"] = "1TB NVMe",
                ["seqRead"] = "7.250 MB/s",
                ["seqWrite"] = "6.900 MB/s",
                ["interface"] = "M.2 PCIe Gen4 x4"
            }
        }
    ];
}
