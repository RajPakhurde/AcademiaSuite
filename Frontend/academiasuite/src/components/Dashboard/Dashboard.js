import React, { useState } from "react";
// import "../../assets/styles/dashboard.css";
import PersonIcon from "@mui/icons-material/Person";
import Navbar from "./Navbar";
import Home from "../Home/Home";
import SubjectMaster from "../Subject/SubjectMaster";
import GroupMaster from "../Subject/GroupMaster";
import ExamCode from "../Exam/ExamCode";
import StudentAttendence from "../Exam/StudentAttendence";
import StudentEntry from "../Student_Entry/StudentEntry";
import ReExamEligibility from "../Exam/ReExamEligibility";
import MarksEntry from "../Entry/MarksEntry";
import PatternTransfer from "../Pattern/PatternTransfer";
import OverallMarks from "../Entry/OverallMarks";
import OverallEligibility from "../Entry/OverallEligibility";
import AcademicEligibility from "../Academic/AcademicEligibility";
import Backup from "../Backup/backup";
import MarksReport from "../ReportGeneration/MarksReport";
import Notifications from "../Notifications/Notifications";

const Dashboard = ({user, setDashboardActiveComp}) => {
  const [activeMainComponent, setActiveMainComponent] = useState("home");

  const renderMainComponent = () => {
    switch (activeMainComponent) {
      case "home":
        return <Home setActiveMainComponent={setActiveMainComponent} />;
      case "subject_master":
        return (
          <SubjectMaster setActiveMainComponent={setActiveMainComponent} />
        );
      case "group_master":
        return <GroupMaster setActiveMainComponent={setActiveMainComponent} />;
      case "exam-code":
        return <ExamCode setActiveMainComponent={setActiveMainComponent} />;
      case "re-exam-eligibility":
        return <ReExamEligibility setActiveMainComponent={setActiveMainComponent} />;
      case "student-attendence":
        return <StudentAttendence setActiveMainComponent={setActiveMainComponent} />
      case "pattern_transfer":
        return <PatternTransfer setActiveMainComponent={setActiveMainComponent} />
      case "marks_entry":
        return <MarksEntry setActiveMainComponent={setActiveMainComponent} />
      case "overall_marks":
        return <OverallMarks setActiveMainComponent={setActiveMainComponent} />
      case "overall_eligibility":
        return <OverallEligibility setActiveMainComponent={setActiveMainComponent} />
      case "academic_eligibility":
        return <AcademicEligibility setActiveMainComponent={setActiveMainComponent} />
      case "student_entry":
        return <StudentEntry setActiveMainComponent={setActiveMainComponent} />;
      case "backup":
        return <Backup />;
      case "marks_report":
        return <MarksReport />;
      case "notifications":
        return <Notifications />;
      default:
        return <Home setActiveMainComponent={setActiveMainComponent} />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-8 py-3 bg-white shadow-sm">
        <h2 className="text-2xl font-extrabold text-slate-800">
          ACADEMIA<span className="logo text-[#1659D7]">SUITE</span>
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xl text-slate-800">{user}</span>
          <PersonIcon
            style={{
              color: "#2B5ED6",
              fontSize: "1.5rem",
              backgroundColor: "#E9F3FD",
              borderRadius: "5px",
              padding: "2px",
            }}
          />
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 h-full overflow-y-auto bg-white shadow-sm">
          <Navbar 
            setActiveMainComponent={setActiveMainComponent} 
            setDashboardActiveComp={setDashboardActiveComp}
          />
        </div>
        <main className="flex-1 overflow-y-auto bg-slate-100">
          {renderMainComponent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
