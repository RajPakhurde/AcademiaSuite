import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

const PatternTransfer = () => {
  const [year, setYear] = useState("Select year");
  const [pattern, setPattern] = useState("Select pattern");
  const [transferPattern, setTransferPattern] = useState("Select pattern");
  const [semester, setSemester] = useState("Select semester");
  const [branch, setBranch] = useState("Select branch");
  const [exam, setExam] = useState("Select exam");
  const [Data, setData] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [exams, setExams] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const years = [
    "Select year",
    "01/June 2011-31/May/2012",
    "01/June 2012-31/May/2013",
    "01/June 2013-31/May/2014",
  ];
  const patterns = ["Select pattern", "CBGS", "Old Pattern"];
  const patterns_transfer = ["Select pattern", "CBCS", "Old Pattern"];
  const semesters = [
    "Select semester",
    "Semester 1",
    "Semester 2",
    "Semester 3",
    "Semester 4",
  ];
  const branches = [
    "Select branch",
    "COMPUTER ENGINEERING",
    "MECHANICAL ENGINEERING",
    "CIVIL ENGINEERING",
    "ELECTRICAL ENGINEERING",
  ];
  const handleCheckboxChange = (student) => {
    setSelectedStudents((prevSelected) => {
      const updatedSelection = new Set(prevSelected);
      const uniqueKey = `${student.student_id}-${student.exam_id}`; // Unique key
  
      if (updatedSelection.has(uniqueKey)) {
        updatedSelection.delete(uniqueKey);
      } else {
        updatedSelection.add(uniqueKey);
      }
      return updatedSelection;
    });
  };
  
  
  
  const getSelectedStudentData = () => {
    return Data.filter((student) => {
      const uniqueKey = `${student.student_id}-${student.exam_id}`; // Correct format
      return selectedStudents.has(uniqueKey); 
    }).map((student) => ({
      student_id: student.student_id,
      semester: student.semester,
      subject_marker: student.subject_marker,
    }));
  };
  
  

  const handlePatternChange = async () => {
    if (selectedStudents.size === 0) {
      toast.error("Please select at least one student.");
      return;
    }
  
    if (!transferPattern || transferPattern === "Select pattern") {
      toast.error("Please select a valid pattern to transfer.");
      return;
    }
  
    try {
      const studentData = getSelectedStudentData(); // Get complete data
  
      console.log("Selected Student Data:", studentData);
      console.log("Selected Pattern to transfer:", transferPattern);
  
      const response = await window.api.invoke("update-student-pattern", {
        studentData,
        transferPattern,
      });
  
      if (response.success) {
        toast.success(`Pattern updated for ${response.updatedRows} students!`);
        setSelectedStudents(new Set());
        setTransferPattern("Select pattern");
        await handleGetData();
      } else {
        toast.error("Failed to update pattern.");
      }
    } catch (error) {
      console.error("Error updating pattern:", error);
      toast.error("An error occurred while updating the pattern.");
    }
  };
  
  

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedStudents(new Set()); // Clear all selections
    } else {
      const allStudents = new Set(Data.map((student) => `${student.student_id}-${student.exam_id}`));
      setSelectedStudents(allStudents);
    }
    setSelectAll(!selectAll);
  };
  

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await window.api.invoke("fetch-exam-code");
        setExams(response);
      } catch (error) {
        console.error("Error fetching exams:", error);
        toast.error("Error fetching exams.");
      }
    };
    fetchExams();
  }, []);

  const handleGetData = async () => {
    try {
      const sendData = { year, pattern, semester, branch };
      console.log(sendData);
      const data = await window.api.invoke("get-all-student-exams", sendData);
      setData(data);
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  return (
    <div className="exam-code-container">
      <ToastContainer />
      <div className="first-div">
        <div className="form-container form-exam-code">
          <h1 className="form-title">Pattern Transfer</h1>
          <form className="form-main">
            <div className="form-group">
              <label htmlFor="year">Year:</label>
              <select id="year" value={year} onChange={(e) => setYear(e.target.value)}>
                {years.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="branch">Branch:</label>
              <select id="branch" value={branch} onChange={(e) => setBranch(e.target.value)}>
                {branches.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="semester">Semester</label>
              <select id="semester" value={semester} onChange={(e) => setSemester(e.target.value)}>
                {semesters.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pattern">Pattern</label>
              <select id="pattern" value={pattern} onChange={(e) => setPattern(e.target.value)}>
                {patterns.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="transferPattern">Transfer to Pattern</label>
              <select
                id="transferPattern"
                name ='transferPattern'
                value={transferPattern}
                onChange={(e) => setTransferPattern(e.target.value)}
              >
                {patterns_transfer.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-buttons">
              <button type="button" className="btn-edit" onClick={handleGetData}>
                Get Data
              </button>
              <button type="button" className="btn-save" onClick={handlePatternChange}>
                Change
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="w-[40%] max-h-[90%] bg-white overflow-y-scroll">
    <div className="p-4">
      <table className="min-w-full divide-y divide-gray-200 w-full border-collapse ml-0 mt-0">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-lg uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
            </th>
            <th className="px-6 py-3 text-left text-lg font-medium uppercase tracking-wider">
              Student ID
            </th>
            <th className="px-6 py-3 text-left text-lg font-medium uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-lg font-medium uppercase tracking-wider">
              Semester
            </th>
            <th className="px-6 py-3 text-left text-lg font-medium uppercase tracking-wider">
              Subject Marker
            </th>
            <th className="px-6 py-3 text-left text-lg font-medium uppercase tracking-wider">
              Subject
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Data &&
            Data.map((student) => {
              const uniqueKey = `${student.student_id}-${student.exam_id}`;
              return (
                <tr key={uniqueKey}>
                  <td className="px-6 py-4 whitespace-nowrap">
                  <input
  type="checkbox"
  checked={selectedStudents.has(uniqueKey)}
  onChange={() => handleCheckboxChange(student)} // Pass full object
/>

                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.student_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.student_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.semester}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.subject_marker}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.subject_name}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  </div>

    </div>
  );
};

export default PatternTransfer;
