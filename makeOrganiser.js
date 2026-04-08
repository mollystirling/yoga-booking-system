import { initDb, usersDb } from "./models/_db.js";

await initDb();

await usersDb.update(
  { email: "molly@email.com" }, 
  { $set: { role: "organiser" } }
);

console.log("Updated to organiser");
process.exit();