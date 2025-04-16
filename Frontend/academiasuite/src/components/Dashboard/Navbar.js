import React, { useState } from "react";
import RoofingIcon from "@mui/icons-material/Roofing";
import SubjectIcon from "@mui/icons-material/Subject";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import PatternIcon from '@mui/icons-material/Pattern';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import LogoutIcon from '@mui/icons-material/Logout';
import BackupIcon from '@mui/icons-material/Backup';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CircularProgress from '@mui/material/CircularProgress';
import Backup from "../Backup/backup";
import axios from "axios";

import "../../assets/styles/navbar.css";

const api = axios.create({
  baseURL: 'http://localhost:5000'
});

const Navbar = (props) => {
  const [activeMenu, setActiveMenu] = useState("home");
  const [activeSubMenu, setActiveSubMenu] = useState("");
  const [activeSubSubMenu, setActiveSubSubMenu] = useState("");
  const [forwordArrow, setForwordArrow] = useState("►");
  const [downArrow, setDownArrow] = useState("▼");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setShowLogoutConfirm(false);
      setIsLoggingOut(false);
      props.setDashboardActiveComp();
    }, 1500); // 1.5 seconds delay to show loading
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const dropdownActive = {
    display: "flex",
    flexDirection: "column",
    alignItem: "center",
    height: "auto",
    opacity: "1",
  };
  const dropdownDisable = {
    maxHeight: "0",
    opacity: "0",
    overflow: "hidden",
    transition: "max-height 0.9s ease, opacity 0.9s ease",
  };
  const activeMenustyle = {
    backgroundColor: "#E9F3FD",
    color: "#2B5ED6",
  };

  const disableMenustyle = {
    backgroundColor: "transparent",
    color: "#8B8A8E",
  };
  const activeSubSubMenustyle = {
    color: "#E1767B",
  };
  const disableSubsubMenustyle = {
    color: "#8B8A8E",
  };

  return (
    <>
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <WarningIcon className="text-yellow-500" />
                <h2 className="text-xl font-semibold text-gray-800">Confirm Logout</h2>
              </div>
              {!isLoggingOut && (
                <button 
                  onClick={cancelLogout}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-4">
              {isLoggingOut ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <CircularProgress size={20} color="inherit" />
                  <span>Logging out...</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={cancelLogout}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yes, Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="nav-container flex flex-col justify-between">
        <div className="flex flex-col gap-1">
        {/* // home nav element */}
        <div
          style={activeMenu === "home" ? activeMenustyle : disableMenustyle}
          className="nav-item hover:text-yellow-200"
          onClick={() => {
            setActiveMenu("home");
            setActiveSubMenu("");
            setActiveSubSubMenu("");
            props.setActiveMainComponent("home");
          }}
        >
          <p className="mb-0 p-2">
            <RoofingIcon /> Home
          </p>
        </div>

        {/* // subject nav element */}
        <div
          className="nav-item"
          style={activeMenu === "subject" ? activeMenustyle : disableMenustyle}
          onClick={() => {
            setActiveSubMenu("subject");
            setActiveMenu("subject");
          }}
        >
          <p className="mb-0 p-2">
            <SubjectIcon /> Subject
          </p>
          <p className="mb-0 p-2">{activeMenu === "subject" ? downArrow : forwordArrow}</p>
        </div>
        <div
          className="dropdown-subject dropdown "
          style={activeSubMenu !== "subject" ? dropdownDisable : dropdownActive}
        >
          <p
            style={
              activeSubSubMenu === "subject_master"
                ? activeSubSubMenustyle
                : disableSubsubMenustyle
            }
            className="submenu-item1 submenu-item"
            onClick={() => {
              setActiveSubSubMenu("subject_master");
              props.setActiveMainComponent("subject_master");
            }}
          >
          {activeSubSubMenu === "subject_master" && "-"}  Subject Master
          </p>
          <p
            style={
              activeSubSubMenu === "group_master"
                ? activeSubSubMenustyle
                : disableSubsubMenustyle
            }
            className="submenu-item2 submenu-item"
            onClick={() => {
              setActiveSubSubMenu("group_master");
              props.setActiveMainComponent("group_master");
            }}
          >
          {activeSubSubMenu === "group_master" && "-"}  Subject Group
          </p>
        </div>

        {/* // Exam nav element */}
        <div
          style={activeMenu === "exam" ? activeMenustyle : disableMenustyle}
          className="nav-item"
          onClick={() => {
            setActiveSubMenu("exam");
            setActiveMenu("exam");
          }}
        >
          <p className="mb-0 p-2">
            <DescriptionIcon /> Exam
          </p>
          <p className="mb-0 p-2">{activeMenu === "exam" ? downArrow : forwordArrow}</p>
        </div>
        <div
          className="dropdown-subject dropdown"
          style={activeSubMenu !== "exam" ? dropdownDisable : dropdownActive}
        >
          <p
            style={
              activeSubSubMenu === "exam-code"
                ? activeSubSubMenustyle
                : disableSubsubMenustyle
            }
            className="submenu-item1"
            onClick={() => {
              setActiveSubSubMenu("exam-code");
              props.setActiveMainComponent("exam-code");
            }}
          >
          {activeSubSubMenu === "exam-code" && "-"}  Exam Code
          </p>
          <p
            style={
              activeSubSubMenu === "student-attendence"
                ? activeSubSubMenustyle
                : disableSubsubMenustyle
            }
            className="submenu-item2"
            onClick={() => {
              setActiveSubSubMenu("student-attendence");
              props.setActiveMainComponent("student-attendence");
            }}
          >
          {activeSubSubMenu === "student-attendence" && "-"}  Student Attendence
          </p>
          <p
            style={
              activeSubSubMenu === "re-exam-eligibility"
                ? activeSubSubMenustyle
                : disableSubsubMenustyle
            }
            className="submenu-item2"
            onClick={() => {
              setActiveSubSubMenu("re-exam-eligibility");
              props.setActiveMainComponent("re-exam-eligibility");
            }}
          >
          {activeSubSubMenu === "re-exam-eligibility" && "-"}  Re-Exam Eligibility
          </p>
        </div>

        {/* // StudentEntry nav element */}
        <div
          style={
            activeMenu === "studentEntry" ? activeMenustyle : disableMenustyle
          }
          className="nav-item"
          onClick={() => {
            setActiveSubMenu("studentEntry");
            setActiveMenu("studentEntry");
          }}
        >
          <p className="mb-0 p-2">
            <PersonIcon /> Student
          </p>
          <p className="mb-0 p-2">{activeMenu === "studentEntry" ? downArrow : forwordArrow}</p>
        </div>
        <div
          className="dropdown-studentEntry dropdown"
          style={
            activeSubMenu !== "studentEntry" ? dropdownDisable : dropdownActive
          }
        >
          <p
            style={
              activeSubSubMenu === "student_entry"
                ? activeSubSubMenustyle
                : disableSubsubMenustyle
            }
            className="submenu-item1"
            onClick={() => {
              setActiveSubSubMenu("student_entry");
              props.setActiveMainComponent("student_entry");
            }}
          >
          {activeSubSubMenu === "student_entry" && "-"}  Student Entry
          </p>
        </div>

        {/* // Pattern nav element */}
        <div
          style={
            activeMenu === "pattern" ? activeMenustyle : disableMenustyle
          }
          className="nav-item"
          onClick={() => {
            setActiveSubMenu("pattern");
            setActiveMenu("pattern");
          }}
        >
          <p className="mb-0 p-2">
            <PatternIcon /> Pattern
          </p>
          <p className="mb-0 p-2">{activeMenu === "pattern" ? downArrow : forwordArrow}</p>
        </div>
        <div
          className="dropdown-pattern dropdown"
          style={
            activeSubMenu !== "pattern" ? dropdownDisable : dropdownActive
          }
        >
          <p
            style={
              activeSubSubMenu === "pattern_transfer"
                ? activeSubSubMenustyle
                : disableSubsubMenustyle
            }
            className="submenu-item1"
            onClick={() => {
              setActiveSubSubMenu("pattern_transfer");
              props.setActiveMainComponent("pattern_transfer");
            }}
          >
          {activeSubSubMenu === "pattern_transfer" && "-"}  Pattern Transfer
          </p>
        </div>

        {/* // Entry nav element */}
        <div
          style={
            activeMenu === "entry" ? activeMenustyle : disableMenustyle
          }
          className="nav-item"
          onClick={() => {
            setActiveSubMenu("entry");
            setActiveMenu("entry");
          }}
        >
          <p className="mb-0 p-2">
            <AppRegistrationIcon /> Entry
          </p>
          <p className="mb-0 p-2">{activeMenu === "entry" ? downArrow : forwordArrow}</p>
        </div>
        <div
          className="dropdown-entry dropdown"
          style={
            activeSubMenu !== "entry" ? dropdownDisable : dropdownActive
          }
        >
          <p
            style={
              activeSubSubMenu === "marks_entry"
                ? activeSubSubMenustyle
                : disableSubsubMenustyle
            }
            className="submenu-item1"
            onClick={() => {
              setActiveSubSubMenu("marks_entry");
              props.setActiveMainComponent("marks_entry");
            }}
          >
          {activeSubSubMenu === "marks_entry" && "-"}  Marks Entry
          </p>
          <p
            style={
              activeSubSubMenu === "overall_marks"
                ? activeSubSubMenustyle
                : disableSubsubMenustyle
            }
            className="submenu-item1"
            onClick={() => {
              setActiveSubSubMenu("overall_marks");
              props.setActiveMainComponent("overall_marks");
            }}
          >
          {activeSubSubMenu === "overall_marks" && "-"}  Overall Marks
          </p>
          <p
            style={
              activeSubSubMenu === "overall_eligibility"
                ? activeSubSubMenustyle
                : disableSubsubMenustyle
            }
            className="submenu-item1"
            onClick={() => {
              setActiveSubSubMenu("overall_eligibility");
              props.setActiveMainComponent("overall_eligibility");
            }}
          >
          {activeSubSubMenu === "overall_eligibility" && "-"}  Overall Eligibility
          </p>
        </div>
               {/* // Pattern nav element */}
        <div
          style={
            activeMenu === "academic" ? activeMenustyle : disableMenustyle
          }
          className="nav-item"
          onClick={() => {
            setActiveSubMenu("academic");
            setActiveMenu("academic");
          }}
        >
          <p className="mb-0 p-2">
            <PatternIcon /> Academic
          </p>
          <p className="mb-0 p-2">{activeMenu === "academic" ? downArrow : forwordArrow}</p>
        </div>
        <div
          className="dropdown-pattern dropdown"
          style={
            activeSubMenu !== "academic" ? dropdownDisable : dropdownActive
          }
        >
          <p
            style={
              activeSubSubMenu === "academic_eligibility"
                ? activeSubSubMenustyle
                : disableSubsubMenustyle
            }
            className="submenu-item1"
            onClick={() => {
              setActiveSubSubMenu("academic_eligibility");
              props.setActiveMainComponent("academic_eligibility");
            }}
          >
          {activeSubSubMenu === "academic_eligibility" && "-"}  Academic Eligibility
          </p>
        </div>

        {/* // Backup nav element */}
        <div
          style={activeMenu === "backup" ? activeMenustyle : disableMenustyle}
          className="nav-item hover:text-yellow-200"
          onClick={() => {
            setActiveMenu("backup");
            setActiveSubMenu("");
            setActiveSubSubMenu("");
            props.setActiveMainComponent("backup");
          }}
        >
          <p className="mb-0 p-2">
            <BackupIcon /> Backup
          </p>
        </div>

        {/* // Marks Report nav element */}
        <div
          style={activeMenu === "marks_report" ? activeMenustyle : disableMenustyle}
          className="nav-item hover:text-yellow-200"
          onClick={() => {
            setActiveMenu("marks_report");
            setActiveSubMenu("");
            setActiveSubSubMenu("");
            props.setActiveMainComponent("marks_report");
          }}
        >
          <p className="mb-0 p-2">
            <AssessmentIcon /> Marks Report
          </p>
        </div>

        {/* Notifications nav element */}
        <div
          style={activeMenu === "notifications" ? activeMenustyle : disableMenustyle}
          className="nav-item hover:text-yellow-200"
          onClick={() => {
            setActiveMenu("notifications");
            setActiveSubMenu("");
            setActiveSubSubMenu("");
            props.setActiveMainComponent("notifications");
          }}
        >
          <p className="mb-0 p-2">
            <NotificationsIcon /> Notifications
          </p>
        </div>
        </div>
        <div>
          {/* // Logout nav element */}
          <div
            style={activeMenu === "logout" ? activeMenustyle : disableMenustyle}
            className="nav-item hover:text-yellow-200"
            onClick={handleLogout}
          >
            <p className="mb-0 p-2">
              <LogoutIcon /> Log out
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
