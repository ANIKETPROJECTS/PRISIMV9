import { db } from "./db";
import { 
  companies, users, customers, customerContacts, projects, rooms, editors, 
  bookings, chalans, chalanItems, designations
} from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Clear existing data in reverse order of dependencies
  await db.delete(chalanItems);
  await db.delete(chalans);
  await db.delete(bookings);
  await db.delete(customerContacts);
  await db.delete(projects);
  await db.delete(customers);
  await db.delete(editors);
  await db.delete(rooms);
  await db.delete(designations);
  await db.delete(users);
  await db.delete(companies);

  // 1. Insert Companies
  const [prism, airavata] = await db.insert(companies).values([
    { name: "PRISM", address: "123 Film Street, Mumbai", gstNumber: "27AAACR1234A1ZA" },
    { name: "Airavata Studio", address: "456 Studio Lane, Pune", gstNumber: "27AABCA9876B1ZB" },
  ]).returning();

  console.log("Companies created:", prism.id, airavata.id);

  // 2. Insert Admin Users (password is hashed PIN for simplicity in demo)
  await db.insert(users).values([
    { 
      username: "admin", 
      password: "1234", 
      securityPin: "1234", 
      role: "admin", 
      companyId: prism.id,
      fullName: "PRISM Admin",
      email: "admin@prism.com",
      mobile: "9876543210"
    },
    { 
      username: "airavata_admin", 
      password: "1234", 
      securityPin: "1234", 
      role: "admin", 
      companyId: airavata.id,
      fullName: "Airavata Admin",
      email: "admin@airavata.com",
      mobile: "9876543211"
    },
  ]);

  console.log("Users created");

  // 3. Insert Designations (15)
  const designationNames = [
    "Producer", "Director", "Editor", "Sound Engineer", "VFX Artist",
    "Colorist", "DI Artist", "Music Composer", "Dubbing Artist", "Mixing Engineer",
    "Project Manager", "Creative Director", "Technical Director", "Associate Producer", "Line Producer"
  ];
  
  await db.insert(designations).values(
    designationNames.map(name => ({ name }))
  );

  console.log("Designations created");

  // 4. Insert Customers (15)
  const customerData = [
    { name: "Rajesh Kumar", companyName: "Dharma Productions", phone: "9000000001", email: "rajesh@dharma.com", gstNumber: "27AABCD1234E1ZA" },
    { name: "Priya Sharma", companyName: "Yash Raj Films", phone: "9000000002", email: "priya@yrf.com", gstNumber: "27AABCD1234E1ZB" },
    { name: "Amit Patel", companyName: "Red Chillies Entertainment", phone: "9000000003", email: "amit@redchillies.com", gstNumber: "27AABCD1234E1ZC" },
    { name: "Sunita Verma", companyName: "Excel Entertainment", phone: "9000000004", email: "sunita@excel.com", gstNumber: "27AABCD1234E1ZD" },
    { name: "Vikram Singh", companyName: "Phantom Films", phone: "9000000005", email: "vikram@phantom.com", gstNumber: "27AABCD1234E1ZE" },
    { name: "Neha Gupta", companyName: "Eros International", phone: "9000000006", email: "neha@eros.com", gstNumber: "27AABCD1234E1ZF" },
    { name: "Rahul Mehta", companyName: "Tips Industries", phone: "9000000007", email: "rahul@tips.com", gstNumber: "27AABCD1234E1ZG" },
    { name: "Kavita Joshi", companyName: "T-Series", phone: "9000000008", email: "kavita@tseries.com", gstNumber: "27AABCD1234E1ZH" },
    { name: "Sanjay Reddy", companyName: "UTV Motion Pictures", phone: "9000000009", email: "sanjay@utv.com", gstNumber: "27AABCD1234E1ZI" },
    { name: "Meera Nair", companyName: "Balaji Telefilms", phone: "9000000010", email: "meera@balaji.com", gstNumber: "27AABCD1234E1ZJ" },
    { name: "Arjun Kapoor", companyName: "Reliance Entertainment", phone: "9000000011", email: "arjun@reliance.com", gstNumber: "27AABCD1234E1ZK" },
    { name: "Pooja Shah", companyName: "Viacom18", phone: "9000000012", email: "pooja@viacom.com", gstNumber: "27AABCD1234E1ZL" },
    { name: "Deepak Jain", companyName: "Fox Star Studios", phone: "9000000013", email: "deepak@foxstar.com", gstNumber: "27AABCD1234E1ZM" },
    { name: "Anita Roy", companyName: "Zee Studios", phone: "9000000014", email: "anita@zee.com", gstNumber: "27AABCD1234E1ZN" },
    { name: "Karan Malhotra", companyName: "AA Films", phone: "9000000015", email: "karan@aafilms.com", gstNumber: "27AABCD1234E1ZO" },
  ];

  const insertedCustomers = await db.insert(customers).values(customerData).returning();
  console.log("Customers created:", insertedCustomers.length);

  // 5. Insert Customer Contacts (2 per customer = 30)
  const contactData = insertedCustomers.flatMap((customer, idx) => [
    { customerId: customer.id, name: `${customer.name} - Primary`, phone: `900000010${idx}`, email: `primary${idx}@contact.com`, designation: "Producer", isPrimary: true },
    { customerId: customer.id, name: `${customer.name} - Secondary`, phone: `900000020${idx}`, email: `secondary${idx}@contact.com`, designation: "Project Manager", isPrimary: false },
  ]);

  const insertedContacts = await db.insert(customerContacts).values(contactData).returning();
  console.log("Customer contacts created:", insertedContacts.length);

  // 6. Insert Projects (15) - linked to customers
  const projectTypes: ("movie" | "serial" | "web_series" | "ad" | "teaser" | "trilogy")[] = ["movie", "serial", "web_series", "ad", "teaser", "trilogy"];
  const projectData = [
    { name: "The Last Kingdom", customerId: insertedCustomers[0].id, projectType: projectTypes[0], description: "Epic historical drama" },
    { name: "City Lights", customerId: insertedCustomers[1].id, projectType: projectTypes[1], description: "Urban family drama series" },
    { name: "Digital Dreams", customerId: insertedCustomers[2].id, projectType: projectTypes[2], description: "Tech thriller web series" },
    { name: "Brand Campaign 2024", customerId: insertedCustomers[3].id, projectType: projectTypes[3], description: "Major brand advertisement" },
    { name: "Movie Teaser 1", customerId: insertedCustomers[4].id, projectType: projectTypes[4], description: "Upcoming movie teaser" },
    { name: "Space Odyssey", customerId: insertedCustomers[5].id, projectType: projectTypes[5], description: "Sci-fi trilogy" },
    { name: "Romance in Paris", customerId: insertedCustomers[6].id, projectType: projectTypes[0], description: "Romantic comedy" },
    { name: "Crime Scene", customerId: insertedCustomers[7].id, projectType: projectTypes[1], description: "Crime investigation series" },
    { name: "Startup Story", customerId: insertedCustomers[8].id, projectType: projectTypes[2], description: "Entrepreneur journey" },
    { name: "Cola Commercial", customerId: insertedCustomers[9].id, projectType: projectTypes[3], description: "Beverage advertisement" },
    { name: "Action Teaser", customerId: insertedCustomers[10].id, projectType: projectTypes[4], description: "Action movie teaser" },
    { name: "Horror Nights", customerId: insertedCustomers[11].id, projectType: projectTypes[0], description: "Horror film" },
    { name: "Comedy Central", customerId: insertedCustomers[12].id, projectType: projectTypes[1], description: "Comedy show" },
    { name: "Documentary Life", customerId: insertedCustomers[13].id, projectType: projectTypes[2], description: "Wildlife documentary" },
    { name: "Fashion Week", customerId: insertedCustomers[14].id, projectType: projectTypes[3], description: "Fashion brand campaign" },
  ];

  const insertedProjects = await db.insert(projects).values(projectData).returning();
  console.log("Projects created:", insertedProjects.length);

  // 7. Insert Rooms (15)
  const roomTypes: ("sound" | "music" | "vfx" | "client_office" | "editing" | "dubbing" | "mixing")[] = ["sound", "music", "vfx", "client_office", "editing", "dubbing", "mixing"];
  const roomData = [
    { name: "Sound Stage A", roomType: roomTypes[0], capacity: 10 },
    { name: "Sound Stage B", roomType: roomTypes[0], capacity: 8 },
    { name: "Music Studio 1", roomType: roomTypes[1], capacity: 6 },
    { name: "Music Studio 2", roomType: roomTypes[1], capacity: 4 },
    { name: "VFX Bay 1", roomType: roomTypes[2], capacity: 5 },
    { name: "VFX Bay 2", roomType: roomTypes[2], capacity: 5 },
    { name: "Client Lounge", roomType: roomTypes[3], capacity: 15 },
    { name: "Editing Suite 1", roomType: roomTypes[4], capacity: 3 },
    { name: "Editing Suite 2", roomType: roomTypes[4], capacity: 3 },
    { name: "Editing Suite 3", roomType: roomTypes[4], capacity: 3 },
    { name: "Dubbing Room 1", roomType: roomTypes[5], capacity: 4 },
    { name: "Dubbing Room 2", roomType: roomTypes[5], capacity: 4 },
    { name: "Mixing Theatre 1", roomType: roomTypes[6], capacity: 20 },
    { name: "Mixing Theatre 2", roomType: roomTypes[6], capacity: 15 },
    { name: "Preview Theatre", roomType: roomTypes[3], capacity: 50 },
  ];

  const insertedRooms = await db.insert(rooms).values(roomData).returning();
  console.log("Rooms created:", insertedRooms.length);

  // 8. Insert Editors (15)
  const editorTypes: ("video" | "audio" | "vfx" | "colorist" | "di")[] = ["video", "audio", "vfx", "colorist", "di"];
  const editorData = [
    { name: "Rahul Sharma", editorType: editorTypes[0], phone: "9100000001", email: "rahul.editor@email.com" },
    { name: "Priya Patel", editorType: editorTypes[0], phone: "9100000002", email: "priya.editor@email.com" },
    { name: "Amit Kumar", editorType: editorTypes[1], phone: "9100000003", email: "amit.audio@email.com" },
    { name: "Sunita Singh", editorType: editorTypes[1], phone: "9100000004", email: "sunita.audio@email.com" },
    { name: "Vikram Reddy", editorType: editorTypes[2], phone: "9100000005", email: "vikram.vfx@email.com" },
    { name: "Neha Gupta", editorType: editorTypes[2], phone: "9100000006", email: "neha.vfx@email.com" },
    { name: "Karan Mehta", editorType: editorTypes[2], phone: "9100000007", email: "karan.vfx@email.com" },
    { name: "Pooja Verma", editorType: editorTypes[3], phone: "9100000008", email: "pooja.colorist@email.com" },
    { name: "Deepak Joshi", editorType: editorTypes[3], phone: "9100000009", email: "deepak.colorist@email.com" },
    { name: "Anita Roy", editorType: editorTypes[4], phone: "9100000010", email: "anita.di@email.com" },
    { name: "Sanjay Kapoor", editorType: editorTypes[4], phone: "9100000011", email: "sanjay.di@email.com" },
    { name: "Meera Nair", editorType: editorTypes[0], phone: "9100000012", email: "meera.editor@email.com" },
    { name: "Arjun Das", editorType: editorTypes[1], phone: "9100000013", email: "arjun.audio@email.com" },
    { name: "Kavita Shah", editorType: editorTypes[2], phone: "9100000014", email: "kavita.vfx@email.com" },
    { name: "Ravi Teja", editorType: editorTypes[3], phone: "9100000015", email: "ravi.colorist@email.com" },
  ];

  const insertedEditors = await db.insert(editors).values(editorData).returning();
  console.log("Editors created:", insertedEditors.length);

  // 9. Insert Bookings (20+ with some conflicts for testing)
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  
  // Get dates for bookings
  const getDate = (daysFromNow: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysFromNow);
    return formatDate(d);
  };

  const bookingStatuses: ("planning" | "tentative" | "confirmed" | "cancelled")[] = ["planning", "tentative", "confirmed", "cancelled"];
  
  const bookingData = [
    // Today's bookings - 3 overlapping for conflict testing (same room, overlapping times)
    { roomId: insertedRooms[0].id, customerId: insertedCustomers[0].id, projectId: insertedProjects[0].id, contactId: insertedContacts[0].id, editorId: insertedEditors[0].id, bookingDate: getDate(0), fromTime: "09:00", toTime: "12:00", status: bookingStatuses[2] },
    { roomId: insertedRooms[0].id, customerId: insertedCustomers[1].id, projectId: insertedProjects[1].id, contactId: insertedContacts[2].id, editorId: insertedEditors[1].id, bookingDate: getDate(0), fromTime: "11:00", toTime: "14:00", status: bookingStatuses[2] }, // CONFLICT
    { roomId: insertedRooms[0].id, customerId: insertedCustomers[2].id, projectId: insertedProjects[2].id, contactId: insertedContacts[4].id, editorId: insertedEditors[2].id, bookingDate: getDate(0), fromTime: "13:00", toTime: "16:00", status: bookingStatuses[2] }, // CONFLICT
    
    // More bookings spread across different rooms and dates
    { roomId: insertedRooms[1].id, customerId: insertedCustomers[3].id, projectId: insertedProjects[3].id, contactId: insertedContacts[6].id, editorId: insertedEditors[3].id, bookingDate: getDate(0), fromTime: "10:00", toTime: "13:00", status: bookingStatuses[2] },
    { roomId: insertedRooms[2].id, customerId: insertedCustomers[4].id, projectId: insertedProjects[4].id, contactId: insertedContacts[8].id, editorId: insertedEditors[4].id, bookingDate: getDate(0), fromTime: "14:00", toTime: "17:00", status: bookingStatuses[1] },
    
    // Tomorrow's bookings
    { roomId: insertedRooms[0].id, customerId: insertedCustomers[5].id, projectId: insertedProjects[5].id, contactId: insertedContacts[10].id, editorId: insertedEditors[5].id, bookingDate: getDate(1), fromTime: "09:00", toTime: "12:00", status: bookingStatuses[0] },
    { roomId: insertedRooms[1].id, customerId: insertedCustomers[6].id, projectId: insertedProjects[6].id, contactId: insertedContacts[12].id, editorId: insertedEditors[6].id, bookingDate: getDate(1), fromTime: "10:00", toTime: "14:00", status: bookingStatuses[2] },
    { roomId: insertedRooms[3].id, customerId: insertedCustomers[7].id, projectId: insertedProjects[7].id, contactId: insertedContacts[14].id, editorId: insertedEditors[7].id, bookingDate: getDate(1), fromTime: "15:00", toTime: "18:00", status: bookingStatuses[1] },
    
    // Day after tomorrow
    { roomId: insertedRooms[4].id, customerId: insertedCustomers[8].id, projectId: insertedProjects[8].id, contactId: insertedContacts[16].id, editorId: insertedEditors[8].id, bookingDate: getDate(2), fromTime: "09:00", toTime: "11:00", status: bookingStatuses[2] },
    { roomId: insertedRooms[5].id, customerId: insertedCustomers[9].id, projectId: insertedProjects[9].id, contactId: insertedContacts[18].id, editorId: insertedEditors[9].id, bookingDate: getDate(2), fromTime: "11:00", toTime: "14:00", status: bookingStatuses[0] },
    
    // More future bookings
    { roomId: insertedRooms[6].id, customerId: insertedCustomers[10].id, projectId: insertedProjects[10].id, contactId: insertedContacts[20].id, editorId: insertedEditors[10].id, bookingDate: getDate(3), fromTime: "10:00", toTime: "13:00", status: bookingStatuses[2] },
    { roomId: insertedRooms[7].id, customerId: insertedCustomers[11].id, projectId: insertedProjects[11].id, contactId: insertedContacts[22].id, editorId: insertedEditors[11].id, bookingDate: getDate(3), fromTime: "14:00", toTime: "17:00", status: bookingStatuses[1] },
    { roomId: insertedRooms[8].id, customerId: insertedCustomers[12].id, projectId: insertedProjects[12].id, contactId: insertedContacts[24].id, editorId: insertedEditors[12].id, bookingDate: getDate(4), fromTime: "09:00", toTime: "12:00", status: bookingStatuses[2] },
    { roomId: insertedRooms[9].id, customerId: insertedCustomers[13].id, projectId: insertedProjects[13].id, contactId: insertedContacts[26].id, editorId: insertedEditors[13].id, bookingDate: getDate(4), fromTime: "13:00", toTime: "16:00", status: bookingStatuses[0] },
    { roomId: insertedRooms[10].id, customerId: insertedCustomers[14].id, projectId: insertedProjects[14].id, contactId: insertedContacts[28].id, editorId: insertedEditors[14].id, bookingDate: getDate(5), fromTime: "10:00", toTime: "14:00", status: bookingStatuses[2] },
  ];

  const insertedBookings = await db.insert(bookings).values(bookingData).returning();
  console.log("Bookings created:", insertedBookings.length);

  // 10. Insert Chalans (15) - linked to bookings, customers, projects
  const chalanData = insertedBookings.slice(0, 15).map((booking, idx) => ({
    chalanNumber: `CHN-2024-${String(idx + 1).padStart(4, '0')}`,
    customerId: booking.customerId,
    projectId: booking.projectId,
    bookingId: booking.id,
    chalanDate: booking.bookingDate,
    totalAmount: String((idx + 1) * 5000),
    notes: `Chalan for booking ${idx + 1}`,
  }));

  const insertedChalans = await db.insert(chalans).values(chalanData).returning();
  console.log("Chalans created:", insertedChalans.length);

  // 11. Insert Chalan Items (2-3 per chalan)
  const chalanItemData = insertedChalans.flatMap((chalan, idx) => [
    { chalanId: chalan.id, description: "Studio booking charges", quantity: String((idx % 3) + 1), rate: "2000", amount: String(((idx % 3) + 1) * 2000) },
    { chalanId: chalan.id, description: "Equipment rental", quantity: "1", rate: "1500", amount: "1500" },
    ...(idx % 2 === 0 ? [{ chalanId: chalan.id, description: "Additional services", quantity: "1", rate: "1000", amount: "1000" }] : []),
  ]);

  await db.insert(chalanItems).values(chalanItemData);
  console.log("Chalan items created:", chalanItemData.length);

  console.log("\nSeeding completed successfully!");
  console.log("\nLogin credentials:");
  console.log("- PRISM: admin / 1234");
  console.log("- Airavata Studio: airavata_admin / 1234");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
