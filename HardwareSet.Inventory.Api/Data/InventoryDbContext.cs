using HardwareSet.Inventory.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HardwareSet.Inventory.Api.Data;

public class InventoryDbContext : DbContext
{
    public InventoryDbContext(DbContextOptions<InventoryDbContext> options) : base(options)
    {
    }

    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<InventoryItem>(entity =>
        {
            entity.ToTable("inventory_items");

            entity.HasKey(x => x.Id);

            entity.HasIndex(x => x.ProductId)
                .IsUnique();

            entity.Property(x => x.ProductId)
                .IsRequired()
                .HasMaxLength(64);

            entity.Property(x => x.ProductName)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(x => x.Category)
                .HasMaxLength(64);

            entity.Property(x => x.Version)
                .IsRowVersion();
        });
    }
}
