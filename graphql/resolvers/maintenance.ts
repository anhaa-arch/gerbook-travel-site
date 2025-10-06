import type { ApolloContext } from '../../server';

async function seedCategoriesAndProducts(prisma: ApolloContext['prisma']) {
  const ensureCategory = async (name: string) => {
    const existing = await prisma.category.findFirst({ where: { name } });
    if (existing) return existing.id;
    const created = await prisma.category.create({ data: { name } });
    return created.id;
  };

  const dairyId = await ensureCategory('Dairy');
  const handicraftsId = await ensureCategory('Handicrafts');
  const meatId = await ensureCategory('Meat');

  const products = [
    { name: 'Айраг', description: 'Traditional airag.', price: 25, images: '', categoryId: dairyId },
    { name: 'Гар нэхмэл хивс', description: 'Handwoven carpet.', price: 150, images: '', categoryId: handicraftsId },
    { name: 'Хатаасан мах', description: 'Dried meat.', price: 45, images: '', categoryId: meatId },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          description: p.description,
          price: p.price,
          images: p.images,
          categoryId: p.categoryId,
        },
      });
    } else {
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          stock: 100,
          images: p.images,
          categoryId: p.categoryId,
        },
      });
    }
  }
}

async function seedYurts(prisma: ApolloContext['prisma']) {
  const yurts = [
    {
      name: 'Найман нуур эко гэр бааз',
      description: 'Eco ger camp at Naiman Nuur.',
      location: 'Архангай',
      pricePerNight: 120,
      capacity: 4,
      amenities: 'WiFi,Хоол,Морь унах',
      images: '/placeholder.svg?height=200&width=300&text=Traditional+Ger+Camp',
    },
    {
      name: 'Хөвсгөл нуурын тансаг бааз',
      description: 'Luxury camp on Khuvsgul Lake.',
      location: 'Хөвсгөл',
      pricePerNight: 250,
      capacity: 6,
      amenities: 'Спа,Тансаг хоол,Нуурын үйл ажиллагаа',
      images: '/placeholder.svg?height=200&width=300&text=Lake+Ger+Camp',
    },
    {
      name: 'Уулын үзэмжит гэр бааз',
      description: 'Scenic mountain camp.',
      location: 'Архангай',
      pricePerNight: 180,
      capacity: 4,
      amenities: 'Guided hikes,Restaurant',
      images: '/placeholder.svg?height=200&width=300&text=Mountain+Camp',
    },
  ];

  for (const y of yurts) {
    const existing = await prisma.yurt.findFirst({ where: { name: y.name } });
    if (existing) {
      await prisma.yurt.update({
        where: { id: existing.id },
        data: {
          description: y.description,
          location: y.location,
          pricePerNight: y.pricePerNight,
          capacity: y.capacity,
          amenities: y.amenities,
          images: y.images,
        },
      });
    } else {
      await prisma.yurt.create({
        data: {
          name: y.name,
          description: y.description,
          location: y.location,
          pricePerNight: y.pricePerNight,
          capacity: y.capacity,
          amenities: y.amenities,
          images: y.images,
        },
      });
    }
  }
}

export default {
  Mutation: {
    seedMockData: async (_: unknown, __: unknown, { prisma }: ApolloContext) => {
      await seedCategoriesAndProducts(prisma);
      await seedYurts(prisma);
      return true;
    },
    clearMockData: async (_: unknown, __: unknown, { prisma }: ApolloContext) => {
      // Order of deletion to satisfy FKs
      await prisma.orderItem.deleteMany({});
      await prisma.order.deleteMany({});
      await prisma.booking.deleteMany({});
      await prisma.travelBooking.deleteMany({});
      await prisma.product.deleteMany({});
      await prisma.category.deleteMany({});
      await prisma.yurt.deleteMany({});
      await prisma.travel.deleteMany({});
      // Do not clear users by default
      return true;
    },
  },
};


