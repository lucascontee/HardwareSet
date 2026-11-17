using HardwareSet.Order.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HardwareSet.Order.Api.Data;

public class OrderDbContext : DbContext
{
    public OrderDbContext(DbContextOptions<OrderDbContext> options) : base(options)
    {
    }

    public DbSet<Entities.Order> Orders => Set<Entities.Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Entities.Order>(entity =>
        {
            entity.ToTable("orders");
            entity.HasKey(x => x.Id);

            entity.Property(x => x.CustomerName).HasMaxLength(160);
            entity.Property(x => x.PaymentMethod).HasMaxLength(40);
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(40);
            entity.Property(x => x.StatusMessage).HasMaxLength(500);
            entity.Property(x => x.TransactionId).HasMaxLength(80);
            entity.Property(x => x.TotalAmount).HasPrecision(18, 2);

            entity.HasMany(x => x.Items)
                .WithOne()
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.ToTable("order_items");
            entity.HasKey(x => x.Id);

            entity.Property(x => x.ProductId).IsRequired().HasMaxLength(64);
            entity.Property(x => x.ProductName).IsRequired().HasMaxLength(200);
            entity.Property(x => x.Category).HasMaxLength(64);
            entity.Property(x => x.UnitPrice).HasPrecision(18, 2);
        });
    }
}
