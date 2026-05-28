import * as dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

import { db } from "./lib/db.js";
import { transport } from "./lib/schema.js";

const stops = [
  { stop_name: "PUARI KHURD",       monthly_fee: 550 },
  { stop_name: "PUARI KALA",        monthly_fee: 550 },
  { stop_name: "JODHA PUR",         monthly_fee: 550 },
  { stop_name: "GAHARPUR",          monthly_fee: 600 },
  { stop_name: "TIWARIPUR",         monthly_fee: 650 },
  { stop_name: "PALIYA",            monthly_fee: 650 },
  { stop_name: "PAYAGPUR",          monthly_fee: 650 },
  { stop_name: "GAHANI",            monthly_fee: 650 },
  { stop_name: "AYAR",              monthly_fee: 650 },
  { stop_name: "HARIDASPUR",        monthly_fee: 550 },
  { stop_name: "HARISHANKARPUR",    monthly_fee: 750 },
  { stop_name: "BHATAULI",          monthly_fee: 1000 },
  { stop_name: "BEDI",              monthly_fee: 650 },
  { stop_name: "KHANPATTI",         monthly_fee: 650 },
  { stop_name: "AHARAK",            monthly_fee: 600 },
  { stop_name: "TINGHARWAN",        monthly_fee: 600 },
  { stop_name: "GAHURA",            monthly_fee: 750 },
  { stop_name: "SEMARI",            monthly_fee: 500 },
  { stop_name: "BHOPAPUR",          monthly_fee: 650 },
  { stop_name: "MAHADEPUR",         monthly_fee: 550 },
  { stop_name: "MAHADEPUR MADAIYA", monthly_fee: 500 },
  { stop_name: "GOSAIPUR",          monthly_fee: 750 },
  { stop_name: "GOSAIPUR CHAURAHA", monthly_fee: 1000 },
];

const rows = stops.map((s) => ({
  route_name:  "Route",
  stop_name:   s.stop_name,
  monthly_fee: s.monthly_fee,
  discount:    0,
  user_id:     2,
}));

await db.insert(transport).values(rows);
console.log(`✅ ${rows.length} stops inserted!`);