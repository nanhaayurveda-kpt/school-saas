export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { students } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import EditStudentForm from "./EditStudentForm";

export default async function EditStudentPage({ params }) {
  const { id } = await params;

  const result = await db
    .select()
    .from(students)
    .where(eq(students.id, Number(id)));
  if (result.length === 0) notFound();
  const s = result[0];

  const classes = [
    "Nursery", "LKG", "UKG", "1", "2", "3", "4", "5",
    "6", "7", "8", "9", "10", "11", "12",
  ];

  return <EditStudentForm s={s} classes={classes} />;
}