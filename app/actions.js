"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";
import { z } from "zod";
import { put } from "@vercel/blob";

// ─── Auth Helper ────────────────────────────────────────────────────────────

async function getAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");
  const session = await getSession(token);
  if (!session) redirect("/login");
  return session;
}

// ─── Students ────────────────────────────────────────────────────────────────

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  class: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  roll_number: z.string().optional(),
  father_name: z.string().optional(),
  phone: z.string().optional(),
  admission_no: z.string().optional(),
  admission_date: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  mother_name: z.string().optional(),
  address: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  aadhaar: z.string().optional(),
  academic_year: z.string().optional(),
});

export async function addStudent(formData) {
  await getAuth();

  const raw = {
    name: formData.get("name"),
    class: formData.get("class"),
    section: formData.get("section"),
    roll_number: formData.get("roll_number") || undefined,
    father_name: formData.get("father_name") || undefined,
    phone: formData.get("phone") || undefined,
    admission_no: formData.get("admission_no") || undefined,
    admission_date: formData.get("admission_date") || undefined,
    gender: formData.get("gender") || undefined,
    dob: formData.get("dob") || undefined,
    mother_name: formData.get("mother_name") || undefined,
    address: formData.get("address") || undefined,
    religion: formData.get("religion") || undefined,
    caste: formData.get("caste") || undefined,
    aadhaar: formData.get("aadhaar") || undefined,
    academic_year: formData.get("academic_year") || undefined,
  };

  const parsed = studentSchema.safeParse(raw);
  if (!parsed.success) {
    await setFlash(
      "error",
      "Invalid data: " + JSON.stringify(parsed.error.flatten().fieldErrors),
    );
    redirect("/students/add");
  }

  await db.insert(schema.students).values({
    ...parsed.data,
    admission_date: parsed.data.admission_date
      ? new Date(parsed.data.admission_date)
      : new Date(),
    fee_status: "pending",
  });

  await setFlash("success", "Student added successfully!");
  redirect("/students");
}

export async function updateStudent(formData) {
  await getAuth();

  const id = formData.get("id");
  const password = formData.get("password");

  const updateData = {
    name: formData.get("name"),
    class: formData.get("class"),
    section: formData.get("section"),
    roll_number: formData.get("roll_number"),
    father_name: formData.get("father_name") || undefined,
    phone: formData.get("phone") || undefined,
    fee_status: formData.get("fee_status"),
    admission_no: formData.get("admission_no") || null,
    gender: formData.get("gender") || null,
    dob: formData.get("dob") || null,
    mother_name: formData.get("mother_name") || null,
    address: formData.get("address") || null,
    religion: formData.get("religion") || null,
    caste: formData.get("caste") || null,
    aadhaar: formData.get("aadhaar") || null,
    academic_year: formData.get("academic_year") || null,
  };

  if (password && password.trim() !== "") {
    updateData.password = password.trim();
  }

  await db
    .update(schema.students)
    .set(updateData)
    .where(eq(schema.students.id, Number(id)));

  await setFlash("success", "Student updated successfully!");
  redirect(`/students/${id}`);
}

export async function importStudents(formData) {
  await getAuth();

  const csvText = formData.get("csv_data");
  if (!csvText) {
    await setFlash("error", "No data found.");
    redirect("/students/import");
  }

  const lines = csvText.trim().split("\n").filter(Boolean);
  const dataLines = lines[0]?.toLowerCase().includes("name")
    ? lines.slice(1)
    : lines;

  let count = 0;
  for (const line of dataLines) {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const [name, className, section, roll_number, father_name, phone] = cols;
    if (!name || !className) continue;
    try {
      await db.insert(schema.students).values({
        name,
        class: className,
        section: section || "",
        roll_number: roll_number || null,
        father_name: father_name || null,
        phone: phone || null,
        fee_status: "pending",
      });
      count++;
    } catch {
      // skip duplicate roll_number
    }
  }

  await setFlash("success", `${count} students imported!`);
  redirect("/students");
}

export async function promoteStudents(formData) {
  await getAuth();

  const from_class = formData.get("from_class");
  const to_class = formData.get("to_class");
  const new_academic_year = formData.get("new_academic_year");

  if (!from_class || !to_class || !new_academic_year) redirect("/promote");

  await db
    .update(schema.students)
    .set({
      class: to_class,
      academic_year: new_academic_year,
      fee_status: "pending",
    })
    .where(eq(schema.students.class, from_class));

  await setFlash(
    "success",
    `Class ${from_class} → Class ${to_class} promoted!`,
  );
  redirect("/promote");
}

// ─── Parent ───────────────────────────────────────────────────────────────────

export async function saveParent(formData) {
  await getAuth();

  const student_id = parseInt(formData.get("student_id"));
  const data = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const existing = await db
    .select()
    .from(schema.parents)
    .where(eq(schema.parents.student_id, student_id));

  if (existing.length > 0) {
    await db
      .update(schema.parents)
      .set(data)
      .where(eq(schema.parents.student_id, student_id));
    await setFlash("success", "Parent account updated successfully!");
  } else {
    await db.insert(schema.parents).values({ student_id, ...data });
    await setFlash("success", "Parent account created successfully!");
  }

  redirect("/students");
}

// ─── Teachers ─────────────────────────────────────────────────────────────────

export async function addTeacher(formData) {
  await getAuth();

  await db.insert(schema.teachers).values({
    name: formData.get("name"),
    qualification: formData.get("qualification"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  });

  await setFlash("success", "Teacher added successfully!");
  redirect("/teachers");
}

// ─── Fees ─────────────────────────────────────────────────────────────────────

const paymentSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  amount: z.string().min(1, "Amount is required"),
  due_date: z.string().min(1, "Due date is required"),
  fee_type: z.string().optional(),
  academic_year: z.string().optional(),
  month: z.string().optional(),
  receipt_no: z.string().optional(),
  paid_date: z.string().optional(),
});

export async function addPayment(formData) {
  await getAuth();

  const raw = {
    student_id: formData.get("student_id"),
    amount: formData.get("amount"),
    due_date: formData.get("due_date"),
    fee_type: formData.get("fee_type") || undefined,
    academic_year: formData.get("academic_year") || undefined,
    month: formData.get("month") || undefined,
    receipt_no: formData.get("receipt_no") || undefined,
    paid_date: formData.get("paid_date") || undefined,
  };

  const parsed = paymentSchema.safeParse(raw);
  if (!parsed.success) {
    await setFlash(
      "error",
      "Invalid data: " + JSON.stringify(parsed.error.flatten().fieldErrors),
    );
    redirect("/fees/add");
  }

  const paidDate = parsed.data.paid_date || null;

  await db.insert(schema.fees).values({
    student_id: parseInt(parsed.data.student_id),
    amount: parseFloat(parsed.data.amount),
    due_date: new Date(parsed.data.due_date),
    paid_date: paidDate ? new Date(paidDate) : null,
    status: paidDate ? "paid" : "pending",
    fee_type: parsed.data.fee_type || "tuition",
    academic_year: parsed.data.academic_year || null,
    month: parsed.data.month || null,
    receipt_no: parsed.data.receipt_no || null,
  });

  await setFlash("success", "Fee record saved successfully!");
  redirect("/fees");
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export async function saveAttendance(formData) {
  await getAuth();

  const date = formData.get("date");
  const studentIds = formData.getAll("student_id");
  const presentIds = formData.getAll("present");

  for (const id of studentIds) {
    const status = presentIds.includes(id) ? "present" : "absent";
    const existing = await db
      .select()
      .from(schema.attendance)
      .where(
        and(
          eq(schema.attendance.student_id, parseInt(id)),
          eq(schema.attendance.date, date),
        ),
      );

    if (existing.length > 0) {
      await db
        .update(schema.attendance)
        .set({ status })
        .where(
          and(
            eq(schema.attendance.student_id, parseInt(id)),
            eq(schema.attendance.date, date),
          ),
        );
    } else {
      await db
        .insert(schema.attendance)
        .values({ student_id: parseInt(id), date, status });
    }
  }

  await setFlash("success", "Attendance saved!");
  redirect("/attendance");
}

// ─── Exams ────────────────────────────────────────────────────────────────────

export async function createExam(formData) {
  await getAuth();

  await db.insert(schema.exams).values({
    name: formData.get("name"),
    class: formData.get("class"),
    subject: formData.get("subject"),
    exam_date: formData.get("exam_date"),
    max_marks: parseInt(formData.get("max_marks")),
    passing_marks: parseInt(formData.get("passing_marks")),
  });

  await setFlash("success", "Exam scheduled successfully!");
  redirect("/exams");
}

export async function saveResults(formData) {
  await getAuth();

  const exam_id = parseInt(formData.get("exam_id"));
  const studentIds = formData.getAll("student_id");

  for (const sid of studentIds) {
    const marks = formData.get(`marks_${sid}`);
    if (marks === "" || marks === null) continue;

    const marksNum = parseFloat(marks);
    const remarks = formData.get(`remarks_${sid}`) || "";

    let grade = "F";
    if (marksNum >= 90) grade = "A+";
    else if (marksNum >= 75) grade = "A";
    else if (marksNum >= 60) grade = "B";
    else if (marksNum >= 45) grade = "C";
    else if (marksNum >= 33) grade = "D";

    const existing = await db
      .select()
      .from(schema.results)
      .where(
        and(
          eq(schema.results.exam_id, exam_id),
          eq(schema.results.student_id, parseInt(sid)),
        ),
      );

    if (existing.length > 0) {
      await db
        .update(schema.results)
        .set({ marks_obtained: marksNum, grade, remarks })
        .where(
          and(
            eq(schema.results.exam_id, exam_id),
            eq(schema.results.student_id, parseInt(sid)),
          ),
        );
    } else {
      await db.insert(schema.results).values({
        exam_id,
        student_id: parseInt(sid),
        marks_obtained: marksNum,
        grade,
        remarks,
      });
    }
  }

  await setFlash("success", "Marks saved successfully!");
  redirect("/exams");
}

// ─── Notices ──────────────────────────────────────────────────────────────────

export async function createNotice(formData) {
  await getAuth();

  await db.insert(schema.notices).values({
    title: formData.get("title"),
    content: formData.get("content"),
    category: formData.get("category"),
    priority: formData.get("priority"),
  });

  await setFlash("success", "Notice posted successfully!");
  redirect("/notices");
}

// ─── Timetable ────────────────────────────────────────────────────────────────

export async function addPeriod(formData) {
  await getAuth();

  const className = formData.get("class");

  await db.insert(schema.timetable).values({
    class: className,
    day: formData.get("day"),
    period: parseInt(formData.get("period")),
    subject: formData.get("subject"),
    teacher_name: formData.get("teacher_name"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
  });

  await setFlash("success", "Period added successfully!");
  redirect(`/timetable?class=${className}`);
}

// ─── Transport ────────────────────────────────────────────────────────────────

export async function addRoute(formData) {
  await getAuth();

  await db.insert(schema.transport).values({
    route_name: formData.get("route_name"),
    stop_name: formData.get("stop_name"),
    monthly_fee: parseFloat(formData.get("monthly_fee")) || 0,
    driver_name: formData.get("driver_name") || null,
    vehicle_no: formData.get("vehicle_no") || null,
  });

  await setFlash("success", "Route added successfully!");
  redirect("/transport");
}

export async function assignStudent(formData) {
  await getAuth();

  const student_id = parseInt(formData.get("student_id"));
  const transport_id = parseInt(formData.get("transport_id"));

  if (!student_id || !transport_id) redirect("/transport");

  await db.insert(schema.student_transport).values({
    student_id,
    transport_id,
    academic_year: formData.get("academic_year") || null,
    joined_date: formData.get("joined_date") || null,
  });

  await setFlash("success", "Student assigned to transport successfully!");
  redirect("/transport");
}

// ─── Certificates ─────────────────────────────────────────────────────────────

export async function issueCertificate(formData) {
  await getAuth();

  await db.insert(schema.certificates).values({
    student_id: parseInt(formData.get("student_id")),
    cert_type: formData.get("cert_type"),
    issue_date: formData.get("issue_date"),
    serial_no: formData.get("serial_no") || null,
    reason: formData.get("reason") || null,
    last_class: formData.get("last_class") || null,
    last_exam_passed: formData.get("last_exam_passed") || null,
    conduct: formData.get("conduct") || "Good",
    custom_content: formData.get("custom_content") || null,
  });

  await setFlash("success", "Certificate issued successfully!");
  redirect("/certificates");
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const settingsSchema = z.object({
  school_name: z.string().min(1, "School name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  principal_name: z.string().optional(),
  affiliation_no: z.string().optional(),
  school_code: z.string().optional(),
  logo_url: z.string().optional(),
});
export async function saveSettings(formData) {
  const session = await getAuth();

  const userResult = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, session.email));
  const user = userResult[0];
  if (!user) redirect("/login");

  const existing = await db
    .select()
    .from(schema.school_settings)
    .where(eq(schema.school_settings.user_id, user.id));
  const current = existing[0] || {};

  let logo_url = current.logo_url || null;
  const logoFile = formData.get("logo");
  if (logoFile && logoFile.size > 0) {
    const blob = await put(`logos/${user.id}/${logoFile.name}`, logoFile, {
      access: "public",
      allowOverwrite: true,
    });
    logo_url = blob.url;
  }

  const raw = {
    school_name: formData.get("school_name"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    principal_name: formData.get("principal_name") || undefined,
    affiliation_no: formData.get("affiliation_no") || undefined,
    school_code: formData.get("school_code") || undefined,
  };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    await setFlash(
      "error",
      "Invalid data: " + JSON.stringify(parsed.error.flatten().fieldErrors),
    );
    redirect("/settings");
  }

  const data = {
    user_id: user.id,
    ...parsed.data,
    logo_url,
    updated_at: new Date(),
  };

  if (existing.length > 0) {
    await db
      .update(schema.school_settings)
      .set(data)
      .where(eq(schema.school_settings.user_id, user.id));
  } else {
    await db.insert(schema.school_settings).values(data);
  }

  await setFlash("success", "Settings saved successfully!");
  redirect("/settings");
}

// ─── Teacher Subjects ─────────────────────────────────────────────────────────

export async function addTeacherSubject(formData) {
  await getAuth();

  const teacher_id = parseInt(formData.get("teacher_id"));
  const subject = formData.get("subject");
  const className = formData.get("class");

  if (!teacher_id || !subject || !className)
    redirect(`/teachers/${teacher_id}`);

  await db.insert(schema.teacher_subjects).values({
    teacher_id,
    subject,
    class: className,
  });

  await setFlash("success", "Subject assigned successfully!");
  redirect(`/teachers/${teacher_id}`);
}

// ─── Delete Student ───────────────────────────────────────────────────────────

export async function deleteStudent(formData) {
  await getAuth();
  const id = parseInt(formData.get("id"));
  await db.delete(schema.students).where(eq(schema.students.id, id));
  await setFlash("success", "Student deleted successfully!");
  redirect("/students");
}
