import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SwaayattRobots from './components/SwaayattRobots';
import DeepEigen from './components/DeepEigen';
import EmployeeProfileWrapper from './components/EmployeeProfileWrapper';
import AddEmployee from './components/AddEmployee';
import AccessControlCompanySelection from './components/AccessControlCompanySelection';
import AccessControlAdminSelection from './components/AccessControlAdminSelection';
import AccessControlEmployeeSelection from './components/AccessControlEmployeeSelection';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/" element={<LoginPage />} />

          <Route path="/swaayatt-robots" element={<SwaayattRobots />} />
          <Route path="/deep-eigen" element={<DeepEigen />} />

          <Route path="/deep-eigen/employee/:id" element={<EmployeeProfileWrapper />} />
          <Route path="/swaayatt-robots/employee/:id" element={<EmployeeProfileWrapper />} />
          <Route path="/add-employee" element={<AddEmployee />} />


          <Route path="/access-control" element={<AccessControlCompanySelection />} />
          <Route path="/access-control/:companyId" element={<AccessControlAdminSelection />} />
          <Route
            path="/access-control/:companyId/:adminName/:adminId/:adminLevel/employees"
            element={<AccessControlEmployeeSelection />}
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;