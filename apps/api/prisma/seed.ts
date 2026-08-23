import { PrismaClient, AdminRole, AuthorityType, IntegrationType, Priority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ============================================================
  // CATEGORIES & SUBCATEGORIES
  // ============================================================
  const categories = [
    {
      name: 'Waste Management',
      slug: 'waste_management',
      icon: 'trash',
      displayOrder: 1,
      subcategories: [
        { name: 'Garbage Accumulation', slug: 'garbage_accumulation', displayOrder: 1 },
        { name: 'Overflowing Bin', slug: 'overflowing_bin', displayOrder: 2 },
        { name: 'Illegal Dumping', slug: 'illegal_dumping', displayOrder: 3 },
        { name: 'Construction Waste', slug: 'construction_waste', displayOrder: 4 },
      ],
    },
    {
      name: 'Roads',
      slug: 'roads',
      icon: 'road',
      displayOrder: 2,
      subcategories: [
        { name: 'Pothole', slug: 'pothole', displayOrder: 1 },
        { name: 'Damaged Road', slug: 'damaged_road', displayOrder: 2 },
        { name: 'Broken Pavement', slug: 'broken_pavement', displayOrder: 3 },
        { name: 'Road Obstruction', slug: 'road_obstruction', displayOrder: 4 },
      ],
    },
    {
      name: 'Traffic',
      slug: 'traffic',
      icon: 'traffic-light',
      displayOrder: 3,
      subcategories: [
        { name: 'Broken Traffic Signal', slug: 'broken_traffic_signal', displayOrder: 1 },
        { name: 'Signal Malfunction', slug: 'signal_malfunction', displayOrder: 2 },
        { name: 'Missing Road Sign', slug: 'missing_road_sign', displayOrder: 3 },
        { name: 'Traffic Obstruction', slug: 'traffic_obstruction', displayOrder: 4 },
      ],
    },
    {
      name: 'Water',
      slug: 'water',
      icon: 'droplet',
      displayOrder: 4,
      subcategories: [
        { name: 'Water Pipeline Leak', slug: 'water_pipeline_leak', displayOrder: 1 },
        { name: 'No Water Supply', slug: 'no_water_supply', displayOrder: 2 },
        { name: 'Contaminated Water', slug: 'contaminated_water', displayOrder: 3 },
        { name: 'Waterlogging', slug: 'waterlogging', displayOrder: 4 },
      ],
    },
    {
      name: 'Sewerage',
      slug: 'sewerage',
      icon: 'waves',
      displayOrder: 5,
      subcategories: [
        { name: 'Sewage Leakage', slug: 'sewage_leakage', displayOrder: 1 },
        { name: 'Blocked Drain', slug: 'blocked_drain', displayOrder: 2 },
        { name: 'Open Sewer', slug: 'open_sewer', displayOrder: 3 },
        { name: 'Overflowing Drainage', slug: 'overflowing_drainage', displayOrder: 4 },
      ],
    },
    {
      name: 'Street Lighting',
      slug: 'street_lighting',
      icon: 'lightbulb',
      displayOrder: 6,
      subcategories: [
        { name: 'Streetlight Not Working', slug: 'streetlight_not_working', displayOrder: 1 },
        { name: 'Damaged Streetlight', slug: 'damaged_streetlight', displayOrder: 2 },
      ],
    },
    {
      name: 'Public Infrastructure',
      slug: 'public_infrastructure',
      icon: 'building',
      displayOrder: 7,
      subcategories: [
        { name: 'Broken Public Property', slug: 'broken_public_property', displayOrder: 1 },
        { name: 'Damaged Bus Stop', slug: 'damaged_bus_stop', displayOrder: 2 },
        { name: 'Damaged Public Toilet', slug: 'damaged_public_toilet', displayOrder: 3 },
      ],
    },
    {
      name: 'Environment',
      slug: 'environment',
      icon: 'tree',
      displayOrder: 8,
      subcategories: [
        { name: 'Illegal Dumping', slug: 'env_illegal_dumping', displayOrder: 1 },
        { name: 'Fallen Tree', slug: 'fallen_tree', displayOrder: 2 },
        { name: 'Pollution', slug: 'pollution', displayOrder: 3 },
      ],
    },
    {
      name: 'Other',
      slug: 'other',
      icon: 'more-horizontal',
      displayOrder: 9,
      subcategories: [
        { name: 'Other Issue', slug: 'other_issue', displayOrder: 1 },
      ],
    },
  ];

  for (const cat of categories) {
    const { subcategories, ...categoryData } = cat;
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: categoryData,
    });

    for (const sub of subcategories) {
      await prisma.subcategory.upsert({
        where: {
          categoryId_slug: {
            categoryId: category.id,
            slug: sub.slug,
          },
        },
        update: { ...sub, categoryId: category.id },
        create: { ...sub, categoryId: category.id },
      });
    }
  }

  console.log('Categories and subcategories seeded.');

  // ============================================================
  // DEMO AUTHORITY (clearly marked as demo)
  // ============================================================
  const authority = await prisma.authority.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Demo Municipal Corporation',
      type: AuthorityType.MUNICIPAL_CORPORATION,
      state: 'Maharashtra',
      district: 'Pune',
      city: 'Demo City',
      website: 'https://demo.example.com',
      contactEmail: 'demo@example.com',
      integrationType: IntegrationType.MANUAL,
      isActive: true,
    },
  });

  console.log('Demo authority seeded.');

  // ============================================================
  // DEPARTMENTS
  // ============================================================
  const departments = [
    { name: 'Solid Waste Management', slug: 'solid_waste_management', escalationHours: 48 },
    { name: 'Roads Department', slug: 'roads_department', escalationHours: 72 },
    { name: 'Traffic Management', slug: 'traffic_management', escalationHours: 24 },
    { name: 'Water Supply Department', slug: 'water_supply', escalationHours: 24 },
    { name: 'Sewerage Department', slug: 'sewerage', escalationHours: 24 },
    { name: 'Street Lighting Department', slug: 'street_lighting', escalationHours: 48 },
    { name: 'Public Works Department', slug: 'public_works', escalationHours: 72 },
  ];

  const createdDepartments: Record<string, string> = {};

  for (const dept of departments) {
    const department = await prisma.department.upsert({
      where: {
        authorityId_slug: {
          authorityId: authority.id,
          slug: dept.slug,
        },
      },
      update: dept,
      create: { ...dept, authorityId: authority.id },
    });
    createdDepartments[dept.slug] = department.id;
  }

  console.log('Departments seeded.');

  // ============================================================
  // ROUTING RULES
  // ============================================================
  const allCategories = await prisma.category.findMany();
  const categoryMap: Record<string, string> = {};
  for (const c of allCategories) {
    categoryMap[c.slug] = c.id;
  }

  const routingMap: Record<string, string> = {
    waste_management: 'solid_waste_management',
    roads: 'roads_department',
    traffic: 'traffic_management',
    water: 'water_supply',
    sewerage: 'sewerage',
    street_lighting: 'street_lighting',
    public_infrastructure: 'public_works',
    environment: 'solid_waste_management',
    other: 'public_works',
  };

  for (const [catSlug, deptSlug] of Object.entries(routingMap)) {
    if (categoryMap[catSlug] && createdDepartments[deptSlug]) {
      // Check if a routing rule already exists for this category
      const existing = await prisma.routingRule.findFirst({
        where: {
          authorityId: authority.id,
          categoryId: categoryMap[catSlug],
        },
      });
      if (!existing) {
        await prisma.routingRule.create({
          data: {
            authorityId: authority.id,
            categoryId: categoryMap[catSlug],
            departmentId: createdDepartments[deptSlug],
            priority: Priority.MEDIUM,
          },
        });
      }
    }
  }

  console.log('Routing rules seeded.');

  // ============================================================
  // SLA RULES
  // ============================================================
  const slaDefaults: Record<string, number> = {
    waste_management: 48,
    roads: 72,
    traffic: 24,
    water: 24,
    sewerage: 24,
    street_lighting: 48,
    public_infrastructure: 72,
    environment: 72,
    other: 72,
  };

  for (const [catSlug, hours] of Object.entries(slaDefaults)) {
    if (categoryMap[catSlug]) {
      await prisma.slaRule.create({
        data: {
          authorityId: authority.id,
          categoryId: categoryMap[catSlug],
          resolutionHours: hours,
          escalationHours: Math.floor(hours * 0.75),
        },
      }).catch(() => {
        // Skip if already exists
      });
    }
  }

  console.log('SLA rules seeded.');

  // ============================================================
  // ADMIN USERS (development only)
  // ============================================================
  const passwordHash = await bcrypt.hash('admin123', 10);

  const adminUsers = [
    // Super & Authority admins
    {
      name: 'Super Admin (DEV)',
      email: 'superadmin@dev.civicconnect.in',
      role: AdminRole.SUPER_ADMIN,
      authorityId: null,
      departmentId: null,
    },
    {
      name: 'Authority Admin (DEV)',
      email: 'authorityadmin@dev.civicconnect.in',
      role: AdminRole.AUTHORITY_ADMIN,
      authorityId: authority.id,
      departmentId: null,
    },
    // Department Admins — one per department
    {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@dev.civicconnect.in',
      role: AdminRole.DEPARTMENT_ADMIN,
      authorityId: authority.id,
      departmentId: createdDepartments['solid_waste_management'],
    },
    {
      name: 'Priya Singh',
      email: 'priya.singh@dev.civicconnect.in',
      role: AdminRole.DEPARTMENT_ADMIN,
      authorityId: authority.id,
      departmentId: createdDepartments['roads_department'],
    },
    {
      name: 'Amit Patel',
      email: 'amit.patel@dev.civicconnect.in',
      role: AdminRole.DEPARTMENT_ADMIN,
      authorityId: authority.id,
      departmentId: createdDepartments['traffic_management'],
    },
    {
      name: 'Sneha Reddy',
      email: 'sneha.reddy@dev.civicconnect.in',
      role: AdminRole.DEPARTMENT_ADMIN,
      authorityId: authority.id,
      departmentId: createdDepartments['water_supply'],
    },
    {
      name: 'Vikram Sharma',
      email: 'vikram.sharma@dev.civicconnect.in',
      role: AdminRole.DEPARTMENT_ADMIN,
      authorityId: authority.id,
      departmentId: createdDepartments['sewerage'],
    },
    {
      name: 'Anita Deshmukh',
      email: 'anita.deshmukh@dev.civicconnect.in',
      role: AdminRole.DEPARTMENT_ADMIN,
      authorityId: authority.id,
      departmentId: createdDepartments['street_lighting'],
    },
    {
      name: 'Suresh Jadhav',
      email: 'suresh.jadhav@dev.civicconnect.in',
      role: AdminRole.DEPARTMENT_ADMIN,
      authorityId: authority.id,
      departmentId: createdDepartments['public_works'],
    },
    // Officers — two per department
    {
      name: 'Manoj Kulkarni',
      email: 'manoj.kulkarni@dev.civicconnect.in',
      role: AdminRole.OFFICER,
      authorityId: authority.id,
      departmentId: createdDepartments['solid_waste_management'],
    },
    {
      name: 'Pooja Bhosale',
      email: 'pooja.bhosale@dev.civicconnect.in',
      role: AdminRole.OFFICER,
      authorityId: authority.id,
      departmentId: createdDepartments['solid_waste_management'],
    },
    {
      name: 'Rohit Patil',
      email: 'rohit.patil@dev.civicconnect.in',
      role: AdminRole.OFFICER,
      authorityId: authority.id,
      departmentId: createdDepartments['roads_department'],
    },
    {
      name: 'Kavita Joshi',
      email: 'kavita.joshi@dev.civicconnect.in',
      role: AdminRole.OFFICER,
      authorityId: authority.id,
      departmentId: createdDepartments['roads_department'],
    },
    {
      name: 'Deepak Gaikwad',
      email: 'deepak.gaikwad@dev.civicconnect.in',
      role: AdminRole.OFFICER,
      authorityId: authority.id,
      departmentId: createdDepartments['traffic_management'],
    },
    {
      name: 'Nisha Thakur',
      email: 'nisha.thakur@dev.civicconnect.in',
      role: AdminRole.OFFICER,
      authorityId: authority.id,
      departmentId: createdDepartments['traffic_management'],
    },
    {
      name: 'Sanjay More',
      email: 'sanjay.more@dev.civicconnect.in',
      role: AdminRole.OFFICER,
      authorityId: authority.id,
      departmentId: createdDepartments['water_supply'],
    },
    {
      name: 'Meena Shinde',
      email: 'meena.shinde@dev.civicconnect.in',
      role: AdminRole.OFFICER,
      authorityId: authority.id,
      departmentId: createdDepartments['water_supply'],
    },
    {
      name: 'Arun Kale',
      email: 'arun.kale@dev.civicconnect.in',
      role: AdminRole.OFFICER,
      authorityId: authority.id,
      departmentId: createdDepartments['sewerage'],
    },
    {
      name: 'Sunita Pawar',
      email: 'sunita.pawar@dev.civicconnect.in',
      role: AdminRole.OFFICER,
      authorityId: authority.id,
      departmentId: createdDepartments['sewerage'],
    },
    {
      name: 'Ganesh Mane',
      email: 'ganesh.mane@dev.civicconnect.in',
      role: AdminRole.OFFICER,
      authorityId: authority.id,
      departmentId: createdDepartments['street_lighting'],
    },
    {
      name: 'Rashmi Deshpande',
      email: 'rashmi.deshpande@dev.civicconnect.in',
      role: AdminRole.OFFICER,
      authorityId: authority.id,
      departmentId: createdDepartments['street_lighting'],
    },
    {
      name: 'Prakash Sawant',
      email: 'prakash.sawant@dev.civicconnect.in',
      role: AdminRole.OFFICER,
      authorityId: authority.id,
      departmentId: createdDepartments['public_works'],
    },
    {
      name: 'Aarti Kamble',
      email: 'aarti.kamble@dev.civicconnect.in',
      role: AdminRole.OFFICER,
      authorityId: authority.id,
      departmentId: createdDepartments['public_works'],
    },
  ];

  for (const admin of adminUsers) {
    await prisma.adminUser.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        ...admin,
        passwordHash,
      },
    });
  }

  console.log('Admin users seeded (DEV credentials: password=admin123).');

  // ============================================================
  // DEMO CITIZEN USER
  // ============================================================
  const citizenPasswordHash = await bcrypt.hash('citizen123', 10);
  await prisma.user.upsert({
    where: { email: 'citizen@dev.civicconnect.in' },
    update: {},
    create: {
      name: 'Demo Citizen (DEV)',
      email: 'citizen@dev.civicconnect.in',
      passwordHash: citizenPasswordHash,
      emailVerified: true,
      preferredLanguage: 'en',
    },
  });

  console.log('Demo citizen user seeded (DEV credentials: citizen@dev.civicconnect.in / citizen123).');

  // ============================================================
  // INTEGRATION CONFIG (Mock)
  // ============================================================
  await prisma.integrationConfig.create({
    data: {
      authorityId: authority.id,
      type: IntegrationType.MANUAL,
      config: {
        name: 'Mock Municipality Integration',
        description: 'Development-only mock integration. NOT a real government system.',
        mockDelay: 2000,
        mockSuccessRate: 0.95,
      },
    },
  }).catch(() => {
    // Skip if already exists
  });

  console.log('Integration config seeded.');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
