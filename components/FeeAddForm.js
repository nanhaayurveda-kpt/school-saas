"use client";

import { useState, useMemo } from "react";

const REGULAR_FEE_TYPES = [
  { value: "monthly", label: "Monthly Fee" },
  { value: "transport", label: "Transport Fee" },
  { value: "amenity", label: "Amenity Fee" },
];

const OCCASIONAL_FEE_TYPES = [
  { value: "exam", label: "Exam Fee" },
  { value: "admission", label: "Admission Fee" },
  { value: "late", label: "Late Payment" },
];

const FIXED_VALUES = new Set([
  ...REGULAR_FEE_TYPES.map((f) => f.value),
  ...OCCASIONAL_FEE_TYPES.map((f) => f.value),
]);

const MONTHS = [
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March",
];

function humanize(slug) {
  return slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function FeeAddForm({
  allStudents,
  packages,
  duesMap,
  concessions,
  today,
  currentMonth,
  currentAcademicYear,
}) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState([currentMonth]);
  const [checkedTypes, setCheckedTypes] = useState({});
  const [amounts, setAmounts] = useState({});
  const [occasionalMonths, setOccasionalMonths] = useState({});
  const [previousDues, setPreviousDues] = useState(0);
  const [customItems, setCustomItems] = useState([]);

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
      allStudents.filter((s) => s.class === selectedClass && s.section).map((s) => s.section),
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

  function loadForStudent(studentId) {
    const student = allStudents.find((s) => s.id === studentId);
    if (!student) return;
    setPreviousDues(duesMap[studentId] || 0);
    const pkg = packages.find((p) => p.class === student.class);
    const newAmounts = {};
    const newChecked = {};
    const newCustoms = [];
    if (pkg && pkg.items.length > 0) {
      for (const item of pkg.items) {
        if (FIXED_VALUES.has(item.fee_type)) {
          newAmounts[item.fee_type] = String(item.amount);
          newChecked[item.fee_type] = true;
        } else {
          newCustoms.push({
            name: humanize(item.fee_type),
            amount: String(item.amount),
            saveToTemplate: false,
            fromTemplate: true,
          });
        }
      }
    }
    setAmounts(newAmounts);
    setCheckedTypes(newChecked);
    setCustomItems(newCustoms);
  }

  function handleClassChange(e) {
    setSelectedClass(e.target.value);
    setSelectedSection("");
    setSelectedStudentId("");
    setAmounts({});
    setCheckedTypes({});
    setPreviousDues(0);
    setCustomItems([]);
  }
  function handleSectionChange(e) {
    setSelectedSection(e.target.value);
    setSelectedStudentId("");
  }
  function handleStudentChange(e) {
    const id = parseInt(e.target.value);
    setSelectedStudentId(id);
    loadForStudent(id);
  }
  function toggleType(type) {
    setCheckedTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  }
  function toggleMonth(m) {
    setSelectedMonths((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  }
  function toggleAllMonths() {
    setSelectedMonths((prev) => prev.length === MONTHS.length ? [] : [...MONTHS]);
  }
  function addCustomItem() {
    setCustomItems((prev) => [...prev, { name: "", amount: "", saveToTemplate: false, fromTemplate: false }]);
  }
  function updateCustom(index, field, val) {
    setCustomItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: val } : it)));
  }
  function removeCustom(index) {
    setCustomItems((prev) => prev.filter((_, i) => i !== index));
  }

  const total = useMemo(() => {
    const reg = REGULAR_FEE_TYPES.filter((ft) => checkedTypes[ft.value]).reduce(
      (sum, ft) => sum + (parseInt(amounts[ft.value]) || 0), 0,
    );
    const occ = OCCASIONAL_FEE_TYPES.filter(
      (ft) => checkedTypes[ft.value] && occasionalMonths[ft.value],
    ).reduce((sum, ft) => sum + (parseInt(amounts[ft.value]) || 0), 0);
    const monthCount = selectedMonths.length || 0;
    const custom = customItems.reduce((sum, it) => sum + (parseInt(it.amount) || 0), 0);
    return (previousDues || 0) + reg * monthCount + occ + custom * monthCount;
  }, [checkedTypes, amounts, selectedMonths, occasionalMonths, previousDues, customItems]);

  const concessionInfo = useMemo(
    () => concessions.find((c) => c.student_id === selectedStudentId) || null,
    [concessions, selectedStudentId],
  );

  const validCustomCount = customItems.filter((it) => it.name.trim() && parseInt(it.amount) > 0).length;
  const canSubmit =
    selectedStudentId && selectedMonths.length > 0 &&
    (Object.values(checkedTypes).some(Boolean) || validCustomCount > 0);

  return (
    <form method="POST" action="/api/fees/bulk-add" onSubmit={() => setSubmitting(true)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class <span className="text-red-500">*</span>
          </label>
          <select value={selectedClass} onChange={handleClassChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select class...</option>
            {classOptions.map((c) => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select value={selectedSection} onChange={handleSectionChange} disabled={!selectedClass}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400">
            <option value="">All</option>
            {sectionOptions.map((s) => <option key={s} value={s}>Section {s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Student <span className="text-red-500">*</span>
        </label>
        <select name="student_id" required value={selectedStudentId} onChange={handleStudentChange} disabled={!selectedClass}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400">
          <option value="">{selectedClass ? "Select student..." : "Select class first"}</option>
          {filteredStudents.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — Class {s.class} {s.section || ""}</option>
          ))}
        </select>
        {selectedClass && filteredStudents.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">No students found.</p>
        )}
      </div>

      {selectedStudentId && (
        <>
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-red-700">Previous Dues</p>
              <p className="text-xs text-red-500 mt-0.5">Auto — outstanding from earlier</p>
            </div>
            <p className="text-lg font-bold text-red-700">₹{previousDues}</p>
          </div>
          <input type="hidden" name="previous_dues" value={previousDues} />

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Months <span className="text-red-500">*</span>
              </label>
              <button type="button" onClick={toggleAllMonths} className="text-xs text-indigo-600 font-medium">
                {selectedMonths.length === MONTHS.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((m) => (
                <label key={m} className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-xs font-medium cursor-pointer ${
                  selectedMonths.includes(m) ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600"
                }`}>
                  <input type="checkbox" name="months[]" value={m} checked={selectedMonths.includes(m)}
                    onChange={() => toggleMonth(m)} className="w-3.5 h-3.5 accent-indigo-600" />
                  {m}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Fees <span className="text-gray-400 text-xs font-normal">(applies to all selected months)</span>
            </label>
            <div className="space-y-2">
              {REGULAR_FEE_TYPES.map((ft) => (
                <div key={ft.value} className={`border rounded-lg px-3 py-2.5 flex items-center gap-3 ${
                  checkedTypes[ft.value] ? "border-indigo-400 bg-indigo-50" : "border-gray-200"
                }`}>
                  <input type="checkbox" id={`t_${ft.value}`} checked={!!checkedTypes[ft.value]}
                    onChange={() => toggleType(ft.value)} className="w-4 h-4 accent-indigo-600" />
                  <label htmlFor={`t_${ft.value}`} className="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
                    {ft.label}
                  </label>
                  {checkedTypes[ft.value] && (
                    <input type="number" name={`amount_${ft.value}`} value={amounts[ft.value] || ""}
                      onChange={(e) => setAmounts((prev) => ({ ...prev, [ft.value]: e.target.value }))}
                      min="1" required placeholder="₹"
                      className="w-32 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Custom Items <span className="text-gray-400 text-xs font-normal">(i-card, uniform, etc.)</span>
              </label>
              <button type="button" onClick={addCustomItem} className="text-xs text-indigo-600 font-medium">
                + Add Item
              </button>
            </div>
            {customItems.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No custom items yet.</p>
            ) : (
              <div className="space-y-2">
                {customItems.map((it, i) => (
                  <div key={i} className="border border-amber-200 bg-amber-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input type="text" name={`custom_name_${i}`} value={it.name}
                        onChange={(e) => updateCustom(i, "name", e.target.value)}
                        placeholder="Item name" required
                        className="flex-1 border border-amber-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                      <input type="number" name={`custom_amount_${i}`} value={it.amount}
                        onChange={(e) => updateCustom(i, "amount", e.target.value)}
                        min="1" required placeholder="₹"
                        className="w-32 border border-amber-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-400" />
                      <button type="button" onClick={() => removeCustom(i)} className="text-red-500 text-lg font-bold w-6" title="Remove">×</button>
                    </div>
                    {!it.fromTemplate && (
                      <label className="flex items-center gap-2 mt-2 ml-1 text-xs text-amber-700 cursor-pointer">
                        <input type="checkbox" name={`custom_save_${i}`} checked={!!it.saveToTemplate}
                          onChange={(e) => updateCustom(i, "saveToTemplate", e.target.checked)}
                          className="w-3.5 h-3.5 accent-amber-500" />
                        Save to class template for next time
                      </label>
                    )}
                    {it.fromTemplate && (
                      <p className="text-xs text-amber-600 mt-1.5 ml-1 italic">From template</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <input type="hidden" name="custom_count" value={customItems.length} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extra Fees <span className="text-gray-400 text-xs font-normal">(for a specific month)</span>
            </label>
            <div className="space-y-2">
              {OCCASIONAL_FEE_TYPES.map((ft) => (
                <div key={ft.value} className={`border rounded-lg px-3 py-2.5 ${
                  checkedTypes[ft.value] ? "border-amber-400 bg-amber-50" : "border-gray-200"
                }`}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id={`t_${ft.value}`} checked={!!checkedTypes[ft.value]}
                      onChange={() => toggleType(ft.value)} className="w-4 h-4 accent-amber-500" />
                    <label htmlFor={`t_${ft.value}`} className="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
                      {ft.label}
                    </label>
                    {checkedTypes[ft.value] && (
                      <input type="number" name={`amount_${ft.value}`} value={amounts[ft.value] || ""}
                        onChange={(e) => setAmounts((prev) => ({ ...prev, [ft.value]: e.target.value }))}
                        min="1" required placeholder="₹"
                        className="w-32 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    )}
                  </div>
                  {checkedTypes[ft.value] && (
                    <div className="mt-2 ml-7">
                      <label className="text-xs text-amber-700 font-medium mb-1 block">Which month?</label>
                      <select name={`month_${ft.value}`} value={occasionalMonths[ft.value] || ""}
                        onChange={(e) => setOccasionalMonths((prev) => ({ ...prev, [ft.value]: e.target.value }))}
                        required
                        className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                        <option value="">Select month...</option>
                        {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {concessionInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
              <p className="text-xs font-semibold text-green-700">
                💸 Concession:{" "}
                {concessionInfo.discount_type === "percent"
                  ? `${concessionInfo.discount_value}%`
                  : `₹${concessionInfo.discount_value}`}
                {concessionInfo.reason ? ` — ${concessionInfo.reason}` : ""}
              </p>
            </div>
          )}

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-indigo-700">Total Payable</p>
              <p className="text-xs text-indigo-500 mt-0.5">Previous dues + {selectedMonths.length} month(s) + extra</p>
            </div>
            <p className="text-xl font-bold text-indigo-700">₹{total}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input type="text" name="academic_year" defaultValue={currentAcademicYear}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input type="date" name="due_date" required defaultValue={today}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid Date <span className="text-gray-400 font-normal text-xs">(empty = pending)</span>
            </label>
            <input type="date" name="paid_date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Mode <span className="text-gray-400 font-normal text-xs">(if paid)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["cash", "online", "upi", "cheque"].map((mode) => (
                <label key={mode}
                  className="flex items-center justify-center border border-gray-300 rounded-lg px-2 py-2 text-xs font-medium cursor-pointer has-[:checked]:bg-indigo-600 has-[:checked]:text-white has-[:checked]:border-indigo-600">
                  <input type="radio" name="payment_mode" value={mode} defaultChecked={mode === "cash"} className="sr-only" />
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={submitting || !canSubmit}
          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? "Saving..." : "Save Fee Package"}
        </button>
        <a href="/fees" className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium text-center">
          Cancel
        </a>
      </div>
    </form>
  );
}
