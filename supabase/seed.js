const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "Supabase URL or Service Role Key is missing. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const categoriesData = [
  { name: "Quantum Mechanics" },
  { name: "Astrophysics" },
  { name: "Computational Physics" },
  { name: "Classical Mechanics" },
  { name: "Thermodynamics & Statistical Mechanics" },
  { name: "Electromagnetism" },
  { name: "Solid State Physics" },
];

async function clearData() {
  console.log("Clearing existing data (public schema tables)...");
  const tables = [
    "borrow_requests",
    "donations",
    "user_book_hearts",
    "books",
    "categories",
    "users",
  ];
  for (const table of tables) {
    // Delete all rows. Using a condition like `neq('id', ...)` is a common way to ensure it's a delete all.
    // For UUIDs, you could use a dummy UUID. This is safer than TRUNCATE if RLS is restrictive.
    const { error } = await supabase
      .from(table)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) console.error(`Error clearing ${table}:`, error.message);
    else console.log(`Cleared ${table}`);
  }
}

async function createAuthUsers(adminEmailFromPrompt) {
  console.log("Creating Auth users...");
  const createdAuthUsers = [];

  const seedUsersData = [
    {
      email: adminEmailFromPrompt,
      password: "password123",
      name: "Admin (You)",
      role: "admin",
    },
    {
      email: "librarian@example.com",
      password: "password123",
      name: "Librarian User",
      role: "librarian",
    },
    {
      email: "alice@example.com",
      password: "password123",
      name: "Alice Wonderland",
      role: "user",
    },
    {
      email: "bob@example.com",
      password: "password123",
      name: "Bob The Builder",
      role: "user",
    },
  ];

  for (const userData of seedUsersData) {
    // Check if user exists in auth.users and delete if so, to ensure a clean state for seeding
    const {
      data: { users: existingAuthUsers },
      error: listError,
    } = await supabase.auth.admin.listUsers({ email: userData.email });

    if (listError && listError.status !== 404) {
      // 404 means user not found, which is fine for creation
      console.error(
        `Error checking for auth user ${userData.email}: ${listError.message}`,
      );
    }

    if (existingAuthUsers && existingAuthUsers.length > 0) {
      const userId = existingAuthUsers[0].id;
      console.log(
        `Auth user ${userData.email} already exists with ID: ${userId}. Deleting...`,
      );
      const { error: deleteError } =
        await supabase.auth.admin.deleteUser(userId);
      if (deleteError) {
        console.error(
          `Failed to delete existing auth user ${userData.email}: ${deleteError.message}`,
        );
        // Optionally, decide if you want to continue or stop if deletion fails
      } else {
        console.log(`Deleted existing auth user ${userData.email}.`);
      }
    }

    // Create the auth user
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm email for seed users
      user_metadata: { name: userData.name },
    });

    if (createError) {
      console.error(
        `Error creating auth user ${userData.email}:`,
        createError.message,
      );
    } else if (data.user) {
      console.log(
        `Created auth user ${data.user.email} with ID: ${data.user.id}`,
      );
      createdAuthUsers.push({
        ...data.user,
        role: userData.role,
        name: userData.name,
      }); // Include role for public.users
    }
  }
  return createdAuthUsers;
}

async function seedPublicUsers(authUsers) {
  console.log("Seeding public.users profiles...");
  if (!authUsers || authUsers.length === 0) {
    console.log("No auth users to seed into public.users.");
    return [];
  }
  const userProfiles = authUsers.map((authUser) => ({
    id: authUser.id,
    email: authUser.email,
    name: authUser.user_metadata?.name || authUser.email.split("@")[0],
    role: authUser.role,
  }));

  const { data, error } = await supabase
    .from("users")
    .insert(userProfiles)
    .select();
  if (error) {
    console.error("Error seeding public.users:", error.message);
    return [];
  }
  console.log(`Seeded ${data.length} user profiles.`);
  return data; // Return the profiles from public.users table
}

async function seedCategories() {
  console.log("Seeding categories...");
  const { data, error } = await supabase
    .from("categories")
    .insert(categoriesData)
    .select();
  if (error) {
    console.error("Error seeding categories:", error.message);
    return [];
  }
  console.log(`Seeded ${data.length} categories.`);
  return data;
}

async function seedBooks(categories, users) {
  console.log("Seeding books...");
  if (!categories || !categories.length || !users || !users.length) {
    console.log("Cannot seed books: missing categories or users.");
    return [];
  }

  const dynamicBooksData = [
    {
      title: "Principles of Quantum Mechanics",
      author: "R. Shankar",
      isbn: "978-0306447907",
      category_name: "Quantum Mechanics",
      status: "available",
      publication_year: 1994,
      publisher: "Plenum Press",
      pages: 676,
      location: "QA-101",
      image_url: "https://picsum.photos/seed/qm/300/400",
    },
    {
      title: "Introduction to Electrodynamics",
      author: "David J. Griffiths",
      isbn: "978-0321856562",
      category_name: "Electromagnetism",
      status: "borrowed",
      publication_year: 2013,
      publisher: "Pearson",
      pages: 624,
      location: "EM-205",
      image_url: "https://picsum.photos/seed/ed/300/400",
    },
    {
      title: "Cosmos",
      author: "Carl Sagan",
      isbn: "978-0345539434",
      category_name: "Astrophysics",
      status: "available",
      publication_year: 2013,
      publisher: "Ballantine Books",
      pages: 432,
      location: "AP-300",
      image_url: "https://picsum.photos/seed/cosmos/300/400",
    },
    {
      title: "Statistical Mechanics",
      author: "Kerson Huang",
      isbn: "978-0471815181",
      category_name: "Thermodynamics & Statistical Mechanics",
      status: "maintenance",
      publication_year: 1987,
      publisher: "Wiley",
      pages: 512,
      location: "SM-050",
      image_url: "https://picsum.photos/seed/statmech/300/400",
    },
    {
      title: "Classical Mechanics",
      author: "Herbert Goldstein",
      isbn: "978-0201657029",
      category_name: "Classical Mechanics",
      status: "available",
      publication_year: 2001,
      publisher: "Addison Wesley",
      pages: 638,
      location: "CM-110",
      image_url: "https://picsum.photos/seed/classicmech/300/400",
    },
    {
      title: "The Feynman Lectures on Physics, Vol. 1",
      author: "Richard P. Feynman",
      isbn: "978-0465024933",
      category_name: "Classical Mechanics",
      status: "available",
      publication_year: 2011,
      publisher: "Basic Books",
      pages: 560,
      location: "FL-001",
      image_url: "https://picsum.photos/seed/feynman1/300/400",
    },
    {
      title: "Numerical Recipes in C",
      author: "Press, Teukolsky, Vetterling, Flannery",
      isbn: "978-0521431088",
      category_name: "Computational Physics",
      status: "borrowed",
      publication_year: 1992,
      publisher: "Cambridge University Press",
      pages: 994,
      location: "CP-501",
      image_url: "https://picsum.photos/seed/numerical/300/400",
    },
    {
      title: "Solid State Physics",
      author: "Ashcroft & Mermin",
      isbn: "978-0030839931",
      category_name: "Solid State Physics",
      status: "available",
      publication_year: 1976,
      publisher: "Brooks Cole",
      pages: 848,
      location: "SSP-220",
      image_url: "https://picsum.photos/seed/ssp/300/400",
    },
    {
      title: "A Brief History of Time",
      author: "Stephen Hawking",
      isbn: "978-0553380163",
      category_name: "Astrophysics",
      status: "available",
      publication_year: 1998,
      publisher: "Bantam",
      pages: 212,
      location: "AP-301",
      image_url: "https://picsum.photos/seed/hawking/300/400",
    },
    {
      title: "Quantum Computation and Quantum Information",
      author: "Nielsen & Chuang",
      isbn: "978-1107002173",
      category_name: "Quantum Mechanics",
      status: "available",
      publication_year: 2010,
      publisher: "Cambridge University Press",
      pages: 702,
      location: "QA-102",
      image_url: "https://picsum.photos/seed/qcomp/300/400",
    },
  ];

  const booksToInsert = dynamicBooksData.map((book) => {
    const category = categories.find((c) => c.name === book.category_name);
    return {
      ...book,
      category_id: category ? category.id : null,
      description: `A foundational text on ${book.title.toLowerCase()} by ${book.author}. Essential reading for students and researchers in physics.`,
    };
  });

  const { data, error } = await supabase
    .from("books")
    .insert(booksToInsert)
    .select();
  if (error) {
    console.error("Error seeding books:", error.message);
    return [];
  }
  console.log(`Seeded ${data.length} books.`);
  return data;
}

async function seedUserBookHearts(users, books) {
  console.log("Seeding user book hearts...");
  if (!users || !users.length || !books || !books.length) {
    console.log("Cannot seed hearts: missing users or books.");
    return;
  }

  // Use a placeholder for admin user if it's not in the hardcoded list
  const adminUserFromPrompt = users.find((u) => u.role === "admin");
  const hearts = [
    {
      user_email: "alice@example.com",
      book_title: "Principles of Quantum Mechanics",
    },
    { user_email: "alice@example.com", book_title: "Cosmos" },
    {
      user_email: "bob@example.com",
      book_title: "Introduction to Electrodynamics",
    },
    { user_email: "bob@example.com", book_title: "Classical Mechanics" },
  ];
  if (adminUserFromPrompt) {
    hearts.push({
      user_email: adminUserFromPrompt.email,
      book_title: "The Feynman Lectures on Physics, Vol. 1",
    });
  }

  const heartsToInsert = hearts
    .map((heart) => {
      const user = users.find((u) => u.email === heart.user_email);
      const book = books.find((b) => b.title === heart.book_title);
      if (user && book) return { user_id: user.id, book_id: book.id };
      return null;
    })
    .filter((h) => h !== null);

  if (heartsToInsert.length > 0) {
    const { error } = await supabase
      .from("user_book_hearts")
      .insert(heartsToInsert);
    if (error) console.error("Error seeding user_book_hearts:", error.message);
    else
      console.log(
        `Seeded ${heartsToInsert.length} user_book_hearts relations.`,
      );
  } else {
    console.log("No valid user_book_hearts to seed.");
  }
}

async function seedDonations(users) {
  console.log("Seeding donations...");
  if (!users || !users.length) {
    console.log("Cannot seed donations: missing users.");
    return;
  }

  const adminUserFromPrompt = users.find((u) => u.role === "admin");
  const donationsData = [
    {
      user_email: "alice@example.com",
      amount: 50,
      description: "Support for new acquisitions",
    },
    {
      user_email: "bob@example.com",
      amount: 100,
      description: "General library fund",
    },
  ];
  if (adminUserFromPrompt) {
    donationsData.push({
      user_email: adminUserFromPrompt.email,
      amount: 250,
      description: "For digital resources expansion",
    });
  }
  donationsData.push({
    user_email: "alice@example.com",
    amount: 25,
    description: "Annual contribution",
  });

  const donationsToInsert = donationsData
    .map((donation) => {
      const user = users.find((u) => u.email === donation.user_email);
      if (user)
        return {
          user_id: user.id,
          amount: donation.amount,
          description: donation.description,
        };
      return null;
    })
    .filter((d) => d !== null);

  if (donationsToInsert.length > 0) {
    const { error } = await supabase
      .from("donations")
      .insert(donationsToInsert);
    if (error) console.error("Error seeding donations:", error.message);
    else
      console.log(
        `Seeded ${donationsToInsert.length} donations. User total_donations will be updated by trigger.`,
      );
  } else {
    console.log("No valid donations to seed.");
  }
}

async function seedBorrowRequests(users, books) {
  console.log("Seeding borrow requests...");
  if (!users || !users.length || !books || !books.length) {
    console.log("Cannot seed borrow requests: missing users or books.");
    return;
  }
  const librarian = users.find((u) => u.role === "librarian");
  const requestsData = [
    {
      user_email: "alice@example.com",
      book_title: "Introduction to Electrodynamics",
      status: "approved",
      notes: "Need for upcoming exam.",
      due_offset_days: 14,
    },
    {
      user_email: "bob@example.com",
      book_title: "Numerical Recipes in C",
      status: "pending",
      notes: "Urgent for research project.",
    },
    {
      user_email: "alice@example.com",
      book_title: "Statistical Mechanics",
      status: "rejected",
      notes: "Previous book overdue.",
    },
  ];

  const requestsToInsert = requestsData
    .map((req) => {
      const user = users.find((u) => u.email === req.user_email);
      const book = books.find((b) => b.title === req.book_title);
      if (!user || !book) return null;

      const request_date = new Date();
      let approved_date = null;
      let due_date = null;

      if (req.status === "approved") {
        approved_date = new Date();
        if (req.due_offset_days) {
          due_date = new Date();
          due_date.setDate(due_date.getDate() + req.due_offset_days);
        }
      }

      return {
        user_id: user.id,
        book_id: book.id,
        status: req.status,
        notes: req.notes,
        request_date: request_date.toISOString(),
        librarian_id:
          (req.status === "approved" || req.status === "rejected") && librarian
            ? librarian.id
            : null,
        approved_date: approved_date ? approved_date.toISOString() : null,
        due_date: due_date ? due_date.toISOString() : null,
      };
    })
    .filter((r) => r !== null);

  if (requestsToInsert.length > 0) {
    const { error } = await supabase
      .from("borrow_requests")
      .insert(requestsToInsert);
    if (error) console.error("Error seeding borrow_requests:", error.message);
    else console.log(`Seeded ${requestsToInsert.length} borrow_requests.`);
  } else {
    console.log("No valid borrow_requests to seed.");
  }
}

async function main() {
  console.log("Starting seed script...");

  const rl = readline.createInterface({ input, output });
  const adminEmail = await rl.question(
    'Enter your email address to be made an admin (default password "password123"): ',
  );
  rl.close();

  if (!adminEmail || !adminEmail.includes("@")) {
    console.error("Invalid email address provided. Exiting.");
    process.exit(1);
  }
  console.log(`Will create admin user with email: ${adminEmail}`);

  // Clear existing data from public tables
  await clearData();

  // Create Auth users (in auth.users schema), including the one from prompt
  const createdAuthUsers = await createAuthUsers(adminEmail);

  // Seed public.users (using IDs from created Auth users)
  const seededPublicUsers = await seedPublicUsers(createdAuthUsers);

  // Seed Categories
  const seededCategories = await seedCategories();

  // Seed Books
  const seededBooks = await seedBooks(seededCategories, seededPublicUsers);

  // Seed relations
  await seedUserBookHearts(seededPublicUsers, seededBooks);
  await seedDonations(seededPublicUsers);
  await seedBorrowRequests(seededPublicUsers, seededBooks);

  console.log("\nSeed script finished successfully!");
  console.log("---");
  console.log('Sample user credentials (password for all is "password123"):');
  console.log(`  Admin Email (You): ${adminEmail}, Role: admin`);
  console.log(`  Librarian Email: librarian@example.com, Role: librarian`);
  console.log(`  User Email: alice@example.com, Role: user`);
  console.log(`  User Email: bob@example.com, Role: user`);
  console.log("---");
}

main().catch((e) => {
  console.error("Seed script failed:");
  console.error(e);
  process.exit(1);
});
