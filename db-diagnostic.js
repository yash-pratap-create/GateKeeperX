import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function checkDatabase() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║         DATABASE SCHEMA DIAGNOSTIC & REPAIR              ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  try {
    // Check if Booking_Log table exists
    console.log("📋 Checking for Booking_Log table...");
    const [tables] = await pool.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Booking_Log'",
      [process.env.DB_NAME]
    );

    if (tables.length === 0) {
      console.log("❌ Booking_Log table NOT FOUND - Creating it...\n");
      
      // Create the Booking_Log table
      await pool.execute(`
        CREATE TABLE Booking_Log (
          log_id INT AUTO_INCREMENT PRIMARY KEY,
          booking_id INT NOT NULL,
          user_id INT,
          resource_id INT,
          start_time DATETIME,
          end_time DATETIME,
          status VARCHAR(20),
          action VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE
        )
      `);
      console.log("✓ Booking_Log table created successfully\n");
    } else {
      console.log("✓ Booking_Log table EXISTS\n");
    }

    // List all tables
    console.log("📊 Database Tables:");
    const [allTables] = await pool.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
      [process.env.DB_NAME]
    );

    allTables.forEach((table) => {
      console.log(`   ✓ ${table.TABLE_NAME}`);
    });

    // Check for booking table structure
    console.log("\n📋 Booking Table Structure:");
    const [columns] = await pool.execute(
      "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'booking'",
      [process.env.DB_NAME]
    );

    columns.forEach((col) => {
      const nullable = col.IS_NULLABLE === "YES" ? "NULL" : "NOT NULL";
      const key = col.COLUMN_KEY ? `[${col.COLUMN_KEY}]` : "";
      console.log(`   ✓ ${col.COLUMN_NAME} | ${col.COLUMN_TYPE} | ${nullable} ${key}`);
    });

    // Check for triggers
    console.log("\n📋 Checking Triggers:");
    const [triggers] = await pool.execute(
      "SELECT TRIGGER_NAME FROM INFORMATION_SCHEMA.TRIGGERS WHERE TRIGGER_SCHEMA = ?",
      [process.env.DB_NAME]
    );

    if (triggers.length === 0) {
      console.log("   ℹ️  No triggers found");
    } else {
      triggers.forEach((trigger) => {
        console.log(`   ✓ ${trigger.TRIGGER_NAME}`);
      });
    }

    // Check for any stored procedures
    console.log("\n📋 Checking Stored Procedures:");
    const [procedures] = await pool.execute(
      "SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'",
      [process.env.DB_NAME]
    );

    if (procedures.length === 0) {
      console.log("   ℹ️  No stored procedures found");
    } else {
      procedures.forEach((proc) => {
        console.log(`   ✓ ${proc.ROUTINE_NAME}`);
      });
    }

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║         DIAGNOSIS COMPLETE - Database is Ready!          ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

  } catch (error) {
    console.error("❌ Error during diagnosis:", error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkDatabase().catch((error) => {
  console.error("Fatal Error:", error.message);
  process.exit(1);
});
