import React, { useEffect, useState } from "react";
import "../../assets/styles/home.css";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { CircularProgress } from '@mui/material';

const Home = () => {
  const [studentsCount, setstudentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/assets/images/college-img-4.jpg",
      alt: "College Logo"
    },
    {
      image: "/assets/images/college-img-3.jpg",
      alt: "Hackathon Event"
    },
    {
      image: "/assets/images/college-img-5.jpg",
      alt: "College Campus"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const getAllStudents = async () => {
    try {
      const count = await window.api.invoke("student-count");
      setstudentsCount(count);
    } catch (error) {
      console.error("Error fetching student count:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllStudents();
  }, []);

  const departmentStats = [
    { name: 'Computer', male: 65, female: 35 },
    { name: 'Mechanical', male: 80, female: 20 },
    { name: 'Civil', male: 55, female: 45 },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard Overview</h1>

      {/* Slideshow Section */}
      <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden shadow-lg">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Students</p>
              <h2 className="text-3xl font-bold text-gray-800">
                {loading ? <CircularProgress size={24} /> : studentsCount}
              </h2>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <PeopleAltIcon style={{ color: "#2563EB", fontSize: "2rem" }} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Departments</p>
              <h2 className="text-3xl font-bold text-gray-800">3</h2>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <SchoolIcon style={{ color: "#059669", fontSize: "2rem" }} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Growth Rate</p>
              <h2 className="text-3xl font-bold text-gray-800">12%</h2>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUpIcon style={{ color: "#7C3AED", fontSize: "2rem" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admission Stats Table */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Admission Statistics</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Branch</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">This Year</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Last Year</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm text-gray-700">Computer Engineering</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">0</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">0</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">0</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm text-gray-700">Mechanical Engineering</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">0</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">0</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">0</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Civil Engineering</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">0</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">0</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          {/* Gender Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Gender Distribution</h2>
            <div className="space-y-4">
              {departmentStats.map(dept => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{dept.name}</span>
                    <span className="text-gray-400">{dept.male}% M / {dept.female}% F</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${dept.male}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* College Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="/assets/images/college-logo.jpg"
                alt="College Logo"
                className="h-12 w-12 object-contain"
              />
              <h2 className="text-2xl font-bold text-gray-800">G.M.V.I.T</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <LocationOnIcon style={{ color: "#2563EB", fontSize: "1.5rem" }} />
                </div>
                <p className="text-sm text-gray-600">AT- Tala, Raigad, Maharashtra, IN</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <EmailIcon style={{ color: "#2563EB", fontSize: "1.5rem" }} />
                </div>
                <p className="text-sm text-gray-600">admin.gmvit@gmail.com</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <LocalPhoneIcon style={{ color: "#2563EB", fontSize: "1.5rem" }} />
                </div>
                <p className="text-sm text-gray-600">9200000000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
