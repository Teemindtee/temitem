import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { finderLevels } from "../shared/schema.js";

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const defaultFinderLevels = [
  {
    name: "Novice",
    description: "New finders just starting their journey on FinderMeister",
    minEarnedAmount: "0.00",
    minJobsCompleted: 0,
    minReviewPercentage: 0,
    icon: "User",
    color: "#6b7280",
    order: 1,
    isActive: true
  },
  {
    name: "Pathfinder", 
    description: "Experienced finders who have completed multiple successful finds",
    minEarnedAmount: "5000.00",
    minJobsCompleted: 5,
    minReviewPercentage: 80,
    icon: "Navigation",
    color: "#10b981",
    order: 2,
    isActive: true
  },
  {
    name: "Seeker",
    description: "Skilled finders with a proven track record of quality work",
    minEarnedAmount: "15000.00", 
    minJobsCompleted: 15,
    minReviewPercentage: 85,
    icon: "Search",
    color: "#3b82f6",
    order: 3,
    isActive: true
  },
  {
    name: "Meister",
    description: "Expert finders with exceptional performance and client satisfaction",
    minEarnedAmount: "50000.00",
    minJobsCompleted: 50,
    minReviewPercentage: 90,
    icon: "Award",
    color: "#8b5cf6", 
    order: 4,
    isActive: true
  },
  {
    name: "Grandmeister",
    description: "Elite finders at the pinnacle of expertise and achievement",
    minEarnedAmount: "100000.00",
    minJobsCompleted: 100,
    minReviewPercentage: 95,
    icon: "Crown",
    color: "#f59e0b",
    order: 5,
    isActive: true
  }
];

async function seedFinderLevels() {
  try {
    console.log("Seeding finder levels...");
    
    // Check if levels already exist
    const existingLevels = await db.select().from(finderLevels);
    
    if (existingLevels.length > 0) {
      console.log("Finder levels already exist, skipping seed...");
      return;
    }
    
    // Insert default levels
    await db.insert(finderLevels).values(defaultFinderLevels);
    
    console.log(`Successfully seeded ${defaultFinderLevels.length} finder levels`);
    
    // Display the seeded levels
    const seededLevels = await db.select().from(finderLevels);
    seededLevels.forEach(level => {
      console.log(`- ${level.name}: Min ₦${level.minEarnedAmount}, ${level.minJobsCompleted} jobs, ${level.minReviewPercentage}% score`);
    });
    
  } catch (error) {
    console.error("Error seeding finder levels:", error);
    process.exit(1);
  }
}

seedFinderLevels();