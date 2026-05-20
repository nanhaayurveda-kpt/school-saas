import FeeStructureForm from "./FeeStructureForm";

export default async function AddFeeStructurePage() {
  const classes = [
    "Nursery",
    "LKG",
    "UKG",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

  const now = new Date();
  const baseYear =
    now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const currentAcademicYear = `${baseYear}-${String(baseYear + 1).slice(-2)}`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Add Fee Structure</h1>
        <p className="text-gray-500 text-xs mt-0.5">Define class-wise fee</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-w-md">
        <FeeStructureForm
          classes={classes}
          currentAcademicYear={currentAcademicYear}
        />
      </div>
    </div>
  );
}
