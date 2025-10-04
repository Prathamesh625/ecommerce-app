const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient();

const randomFloat = (min: number, max: number) =>
    parseFloat((Math.random() * (max - min) + min).toFixed(2));
const randomBool = () => Math.random() < 0.5;
//ts-ignore
const pick = (arr: any) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
    console.log("🌱 Seeding started...");

    // ---------------- Users ----------------
    const users = await prisma.user.createMany({
        data: [
            { id: "u1", name: "Alice Johnson", email: "alice@example.com" },
            { id: "u2", name: "Bob Williams", email: "bob@example.com" },
            { id: "u3", name: "Charlie Brown", email: "charlie@example.com" },
        ],
        skipDuplicates: true,
    });
    console.log("✅ Users seeded");

    // ---------------- Categories ----------------
    const categoriesData = [
        { name: "Electronics", billboard: "https://picsum.photos/1200/300?1", title: "Smart Tech" },
        { name: "Fashion", billboard: "https://picsum.photos/1200/300?2", title: "Trending Styles" },
        { name: "Home & Kitchen", billboard: "https://picsum.photos/1200/300?3", title: "Comfort Living" },
    ];
    const categories = await Promise.all(
        categoriesData.map((data) => prisma.category.upsert({
            where: { name: data.name },
            update: {},
            create: data,
        }))
    );
    console.log("✅ Categories seeded");

    // ---------------- Colors ----------------
    const colorsData = [
        { name: "Red", color: "#FF0000" },
        { name: "Blue", color: "#0000FF" },
        { name: "Black", color: "#000000" },
        { name: "White", color: "#FFFFFF" },
        { name: "Green", color: "#00FF00" },
    ];
    const colors = await Promise.all(
        colorsData.map((data) => prisma.color.upsert({
            where: { name: data.name },
            update: {},
            create: data,
        }))
    );
    console.log("✅ Colors seeded");

    // ---------------- Sizes ----------------
    const sizesData = [
        { name: "Small", value: "S" },
        { name: "Medium", value: "M" },
        { name: "Large", value: "L" },
        { name: "Extra Large", value: "XL" },
    ];
    const sizes = await Promise.all(
        sizesData.map((data) => prisma.size.upsert({
            where: { name: data.name },
            update: {},
            create: data,
        }))
    );
    console.log("✅ Sizes seeded");

    // ---------------- Products + Images ----------------
    const sampleTitles = [
        "Wireless Headphones",
        "Smart Watch",
        "Casual T-Shirt",
        "Gaming Laptop",
        "Sneakers",
        "Coffee Maker",
        "LED Lamp",
        "Bluetooth Speaker",
        "Backpack",
        "Sofa Cushion",
    ];

    for (let i = 0; i < 10; i++) {
        const product = await prisma.product.create({
            data: {
                title: sampleTitles[i],
                price: randomFloat(20, 2000),
                isFeatured: randomBool(),
                isArchived: randomBool(),
                categoryId: pick(categories).id,
                colorId: pick(colors).id,
                sizeId: pick(sizes).id,
                images: {
                    create: [
                        { url: `https://picsum.photos/seed/${i}-1/600/400` },
                        { url: `https://picsum.photos/seed/${i}-2/600/400` },
                    ],
                },
            },
        });
    }
    console.log("✅ Products & Images seeded");

    // ---------------- Orders + OrderItems ----------------
    const allProducts = await prisma.product.findMany();
    for (let i = 0; i < 5; i++) {
        const order = await prisma.order.create({
            data: {
                amount: randomFloat(100, 5000),
                total: Math.floor(Math.random() * 10) + 1,
                isPaid: randomBool(),
            },
        });

        // Each order gets 2 random order items
        await prisma.orderItem.createMany({
            data: [
                {
                    amount: randomFloat(50, 1000),
                    total: Math.floor(Math.random() * 5) + 1,
                    orderId: order.id,
                    productId: pick(allProducts).id,
                },
                {
                    amount: randomFloat(50, 1000),
                    total: Math.floor(Math.random() * 5) + 1,
                    orderId: order.id,
                    productId: pick(allProducts).id,
                },
            ],
        });
    }
    console.log("✅ Orders & OrderItems seeded");

    console.log("🎉 Seeding completed successfully!");
}

main()
    .catch((err) => {
        console.error("❌ Seeding error:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

