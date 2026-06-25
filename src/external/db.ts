import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("Connection string not found");
}

const sql = postgres(connectionString);

export default sql;
