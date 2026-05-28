"use client";

import { useState, useMemo } from "react";

const MONTHS = [
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March",
];

const REGULAR_FEE_TYPES = [
  { value: "monthly", label: "Monthly Fee" },
  { value: "transport", label: "Transport Fee" },
  { value: "misc", label: "Miscellaneous" },
];

const OCCASIONAL_FEE_TYPES = [
  { value: "exam", label: "Exam Fee" },
  { value: "admission", label: "Admission Fee" },
];

// ── Student selector (defined OUTSIDE main component to keep input focus) ──
function StudentSelector({
  nameAttr = "student_id",
  classOptions,
  sectionOptions,
  filteredStudents,
  selectedClass,
  selectedSection,
  selectedStudentId,
  onClassChange,
  onSectionChange,
  onStudentChange,
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedClass}
            onChange={onClassChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select class...</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={onSectionChange}
            disabled={!selectedClass}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">All</option>
            {sectionOptions.map((s) => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Student <span className="text-red-500">*</span>
        </label>
        <select
          name={nameAttr}
          required
          value={selectedStudentId}
          onChange={onStudentChange}
          disabled={!selectedClass}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">
            {selectedClass ? "Select student..." : "Select class first"}
          </option>
          {filteredStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — Class {s.class} {s.section || ""}
            </option>
          ))}
        </select>
        {selectedClass && filteredStudents.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">No students found.</p>
        )}
      </div>
    </>
  );
}

// ── Payment fields (defined OUTSIDE main component) ──
function PaymentFields({ defaultAcYear = true, currentAcademicYear, today }) {
  return (
    <>
      {defaultAcYear && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year
          </label>
          <input
            type="text"
            name="academic_year"
            defaultValue={currentAcademicYear}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="due_date"
            required
            defaultValue={today}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid Date{" "}
            <span className="text-gray-400 font-normal text-xs">(empty = pending)</span>
          </label>
          <input
            type="date"
            name="paid_date"
            defaultValue={today}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Mode{" "}
          <span className="text-gray-400 font-normal text-xs">(if paid)</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {["cash", "online", "upi", "cheque"].map((mode) => (
            <label
              key={mode}
              className="flex items-center justify-center border border-gray-300 rounded-lg px-2 py-2 text-xs font-medium cursor-pointer has-[:checked]:bg-indigo-600 has-[:checked]:text-white has-[:checked]:border-indigo-600"
            >
              <input
                type="radio"
                name="payment_mode"
                value={mode}
                defaultChecked={mode === "cash"}
                className="sr-only"
              />
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </label>
          ))}
        </div>
      </div>
    </>
  );
}

export default function FeeAddForm({
  allStudents,
  feeStructures,
  concessions,
  today,
  currentMonth,
  currentAcademicYear,
}) {
  const [tab, setTab] = useState("single");

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [selectedFeeType, setSelectedFeeType] = useState("monthly");
  const [amount, setAmount] = useState("");
  const [concessionInfo, setConcessionInfo] = useState(null);
  const [netAmount, setNetAmount] = useState("");

  const [selectedMonths, setSelectedMonths] = useState([]);
  const [checkedTypes, setCheckedTypes] = useState({});
  const [bulkAmounts, setBulkAmounts] = useState({});
  const [occasionalMonths, setOccasionalMonths] = useState({});

  const classOptions = useMemo(() => {
    const set = new Set(allStudents.map((s) => s.class));
    return [...set].sort((a, b) => {
      const na = parseInt(a), nb = parseInt(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [allStudents]);

  const sectionOptions = useMemo(() => {
    if (!selectedClass) return [];
    const set = new Set(
      allStudents
        .filter((s) => s.class === selectedClass && s.section)
        .map((s) => s.section),
    );
    return [...set].sort();
  }, [allStudents, selectedClass]);

  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      if (selectedClass && s.class !== selectedClass) return false;
      if (selectedSection && s.section !== selectedSection) return false;
      return true;
    });
  }, [allStudents, selectedClass, selectedSection]);

  const bulkTotal = useMemo(() => {
    const regTotal = REGULAR_FEE_TYPES
      .filter((ft) => checkedTypes[ft.value])
      .reduce((sum, ft) => sum + (parseInt(bulkAmounts[ft.value]) || 0), 0);
    const occTotal = OCCASIONAL_FEE_TYPES
      .filter((ft) => checkedTypes[ft.value] && occasionalMonths[ft.value])
      .reduce((sum, ft) => sum + (parseInt(bulkAmounts[ft.value]) || 0), 0);
    return regTotal * selectedMonths.length + occTotal;
  }, [checkedTypes, bulkAmounts, selectedMonths, occasionalMonths]);

  function handleClassChange(e) {
    setSelectedClass(e.target.value);
    setSelectedSection("");
    setSelectedStudentId("");
    setAmount(""); setNetAmount(""); setConcessionInfo(null);
    setBulkAmounts({}); setCheckedTypes({});
  }

  function handleSectionChange(e) {
    setSelectedSection(e.target.value);
    setSelectedStudentId("");
  }

  function handleStudentChange(e) {
    const id = parseInt(e.target.value);
    setSelectedStudentId(id);
    const conc = concessions.find((c) => c.student_id === id) || null;
    setConcessionInfo(conc);
    fillSingleAmount(id, selectedFeeType, conc);
    fillBulkAmounts(id);
  }

  function fillSingleAmount(studentId, feeType, conc) {
    if (!studentId || !feeType) return;
    const student = allStudents.find((s) => s.id === studentId);
    if (!student) return;
    const structure = feeStructures.find(
      (fs) => fs.class === student.class && fs.fee_type === feeType,
    );
    if (structure) {
      const base = structure.amount;
      setAmount(String(base));
      if (conc) {
        const disc = conc.discount_type === "percent"
          ? Math.round((base * conc.discount_value) / 100)
          : conc.discount_value;
        setNetAmount(String(Math.max(0, base - disc)));
      } else {
        setNetAmount(String(base));
      }
    } else {
      setAmount(""); setNetAmount("");
    }
  }

  function fillBulkAmounts(studentId) {
    const student = allStudents.find((s) => s.id === studentId);
    if (!student) return;
    const newAmounts = {};
    [...REGULAR_FEE_TYPES, ...OCCASIONAL_FEE_TYPES].forEach(({ value }) => {
      const fs = feeStructures.find(
        (f) => f.class === student.class && f.fee_type === value,
      );
      if (fs) newAmounts[value] = String(fs.amount);
    });
    setBulkAmounts(newAmounts);
  }

  function handleFeeTypeChange(e) {
    const ft = e.target.value;
    setSelectedFeeType(ft);
    const conc = concessions.find((c) => c.student_id === selectedStudentId) || null;
    fillSingleAmount(selectedStudentId, ft, conc);
  }

  function handleAmountChange(e) {
    const base = parseInt(e.target.value) || 0;
    setAmount(e.target.value);
    if (concessionInfo) {
      const disc = concessionInfo.discount_type === "percent"
        ? Math.round((base * concessionInfo.discount_value) / 100)
        : concessionInfo.discount_value;
      setNetAmount(String(Math.max(0, base - disc)));
    } else {
      setNetAmount(e.target.value);
    }
  }

  function toggleMonth(m) {
    setSelectedMonths((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  }

  function toggleAllMonths() {
    setSelectedMonths((prev) => (prev.length === MONTHS.length ? [] : [...MONTHS]));
  }

  function toggleFeeType(type) {
    setCheckedTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  }

  const selectorProps = {
    classOptions,
    sectionOptions,
    filteredStudents,
    selectedClass,
    selectedSection,
    selectedStudentId,
    onClassChange: handleClassChange,
    onSectionChange: handleSectionChange,
    onStudentChange: handleStudentChange,
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setTab("single")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            tab === "single" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          Single Fee
        </button>
        <button
          type="button"
          onClick={() => setTab("bulk")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            tab === "bulk" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          By Package
        </button>
      </div>

      {/* ── TAB 1: Single Fee ── */}
      {tab === "single" && (
        <form
          method="POST"
          action="/api/fees/add"
          onSubmit={() => setSubmitting(true)}
          className="space-y-4"
        >
          <StudentSelector {...selectorProps} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                required
                min="1"
                value={amount}
                onChange={handleAmountChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Type <span className="text-red-500">*</span>
              </label>
              <select
                name="fee_type"
                value={selectedFeeType}
                onChange={handleFeeTypeChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[...REGULAR_FEE_TYPES, ...OCCASIONAL_FEE_TYPES].map((ft) => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>
          </div>

          {concessionInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-green-700 mb-1">💸 Concession Applied</p>
              <p className="text-xs text-green-600">
                {concessionInfo.discount_type === "percent"
                  ? `${concessionInfo.discount_value}% discount`
                  : `₹${concessionInfo.discount_value} off`}
                {concessionInfo.reason ? ` — ${concessionInfo.reason}` : ""}
              </p>
              {netAmount && amount && (
                <p className="text-xs text-green-700 font-bold mt-1">
                  Net Payable: ₹{netAmount}
                </p>
              )}
            </div>
          )}
          <input type="hidden" name="net_amount" value={netAmount || amount} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                name="month"
                defaultValue={currentMonth}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select...</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                name="academic_year"
                defaultValue={currentAcademicYear}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <PaymentFields
            defaultAcYear={false}
            currentAcademicYear={currentAcademicYear}
            today={today}
          />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Payment"}
            </button>
            <a
              href="/fees"
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center"
            >
              Cancel
            </a>
          </div>
        </form>
      )}

      {/* ── TAB 2: By Package (Bulk) ── */}
      {tab === "bulk" && (
        <form
          method="POST"
          action="/api/fees/bulk-add"
          onSubmit={() => setSubmitting(true)}
          className="space-y-4"
        >
          <StudentSelector {...selectorProps} />

          {/* Month checkboxes */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Months <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={toggleAllMonths}
                className="text-xs text-indigo-600 font-medium"
              >
                {selectedMonths.length === MONTHS.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((m) => (
                <label
                  key={m}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-xs font-medium cursor-pointer ${
                    selectedMonths.includes(m)
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="months[]"
                    value={m}
                    checked={selectedMonths.includes(m)}
                    onChange={() => toggleMonth(m)}
                    className="w-3.5 h-3.5 accent-indigo-600"
                  />
                  {m}
                </label>
              ))}
            </div>
            {selectedMonths.length > 0 && (
              <p className="text-xs text-indigo-600 mt-1.5 font-medium">
                {selectedMonths.length} months —{" "}
                {selectedMonths.length === 1
                  ? selectedMonths[0]
                  : `${selectedMonths[0]} to ${selectedMonths[selectedMonths.length - 1]}`}
              </p>
            )}
          </div>

          {/* Regular fees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Regular Fees{" "}
              <span className="text-gray-400 text-xs font-normal">
                (applies to all selected months)
              </span>
            </label>
            <div className="space-y-2">
              {REGULAR_FEE_TYPES.map((ft) => (
                <div
                  key={ft.value}
                  className={`border rounded-lg px-3 py-2.5 flex items-center gap-3 ${
                    checkedTypes[ft.value] ? "border-indigo-400 bg-indigo-50" : "border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`bulk_${ft.value}`}
                    checked={!!checkedTypes[ft.value]}
                    onChange={() => toggleFeeType(ft.value)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <label
                    htmlFor={`bulk_${ft.value}`}
                    className="flex-1 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {ft.label}
                  </label>
                  {checkedTypes[ft.value] ? (
                    <input
                      type="number"
                      name={`amount_${ft.value}`}
                      value={bulkAmounts[ft.value] || ""}
                      onChange={(e) =>
                        setBulkAmounts((prev) => ({ ...prev, [ft.value]: e.target.value }))
                      }
                      min="1"
                      required
                      placeholder="₹"
                      className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    bulkAmounts[ft.value] && (
                      <span className="text-xs text-gray-400">₹{bulkAmounts[ft.value]}</span>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Occasional fees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extra Fees{" "}
              <span className="text-gray-400 text-xs font-normal">
                (for the specific month)
              </span>
            </label>
            <div className="space-y-2">
              {OCCASIONAL_FEE_TYPES.map((ft) => (
                <div
                  key={ft.value}
                  className={`border rounded-lg px-3 py-2.5 ${
                    checkedTypes[ft.value] ? "border-amber-400 bg-amber-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`bulk_${ft.value}`}
                      checked={!!checkedTypes[ft.value]}
                      onChange={() => toggleFeeType(ft.value)}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <label
                      htmlFor={`bulk_${ft.value}`}
                      className="flex-1 text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      {ft.label}
                    </label>
                    {checkedTypes[ft.value] && (
                      <input
                        type="number"
                        name={`amount_${ft.value}`}
                        value={bulkAmounts[ft.value] || ""}
                        onChange={(e) =>
                          setBulkAmounts((prev) => ({ ...prev, [ft.value]: e.target.value }))
                        }
                        min="1"
                        required
                        placeholder="₹"
                        className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    )}
                  </div>
                  {checkedTypes[ft.value] && (
                    <div className="mt-2 ml-7">
                      <label className="text-xs text-amber-700 font-medium mb-1 block">
                        Which month?
                      </label>
                      <select
                        name={`month_${ft.value}`}
                        value={occasionalMonths[ft.value] || ""}
                        onChange={(e) =>
                          setOccasionalMonths((prev) => ({ ...prev, [ft.value]: e.target.value }))
                        }
                        required
                        className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <option value="">Select month...</option>
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total preview */}
          {bulkTotal > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-indigo-700">Total Payable</p>
                {selectedMonths.length > 1 && (
                  <p className="text-xs text-indigo-500 mt-0.5">
                    {selectedMonths.length} months × Regular + Extra fees
                  </p>
                )}
              </div>
              <p className="text-xl font-bold text-indigo-700">₹{bulkTotal}</p>
            </div>
          )}

          <PaymentFields
            defaultAcYear={true}
            currentAcademicYear={currentAcademicYear}
            today={today}
          />

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={
                submitting ||
                !selectedStudentId ||
                selectedMonths.length === 0 ||
                !Object.values(checkedTypes).some(Boolean)
              }
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Saving..."
                : `Save Fees${selectedMonths.length > 1 ? ` (${selectedMonths.length} months)` : ""}`}
            </button>
            <a
              href="/fees"
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center"
            >
              Cancel
            </a>
          </div>
        </form>
      )}
    </div>
  );
}