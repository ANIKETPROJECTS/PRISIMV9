import { db } from "./db";
import { companies, users } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Check if companies already exist
  const existingCompanies = await db.select().from(companies);
  
  if (existingCompanies.length === 0) {
    // Create the two companies
    const [prismCompany] = await db.insert(companies).values({
      name: "PRISM",
      address: "Mumbai, India",
      gstNumber: "27AABCP1234A1Z5",
    }).returning();

    const [airavataCompany] = await db.insert(companies).values({
      name: "Airavata Studio",
      address: "Mumbai, India",
      gstNumber: "27AABCA5678B2Z9",
    }).returning();

    console.log("Created companies:", prismCompany.name, airavataCompany.name);

    // Create default admin users for each company
    await db.insert(users).values({
      username: "admin",
      password: "admin123",
      securityPin: "1234",
      role: "admin",
      companyId: prismCompany.id,
      isActive: true,
    });

    await db.insert(users).values({
      username: "airavata_admin",
      password: "admin123",
      securityPin: "1234",
      role: "admin",
      companyId: airavataCompany.id,
      isActive: true,
    });

    console.log("Created default admin users for both companies");
  } else {
    console.log("Companies already exist, skipping seed");
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
