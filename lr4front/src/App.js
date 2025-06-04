import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Buildings from './pages/Buildings';
import BuildingForm from './components/Buildings/BuildingForm';
import BuildingDetail from './components/Buildings/BuildingDetail';
import BuildingEditForm from './components/Buildings/BuildingEditForm';
import ProtectedRoute from './components/Shared/ProtectedRoute';
import SensorDetail from './components/Sensors/SensorDetail';
import SensorEditForm from './components/Sensors/SensorEditForm';
import IncidentReportForm from './components/Sensors/IncidentReportForm';
import IncidentDetail from './components/Sensors/IncidentDetail';
import RegisterForm from './pages/RegisterForm';
import SensorForm from './components/Sensors/SensorForm';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './components/Auth/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CssBaseline />
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/buildings" element={<ProtectedRoute><Buildings /></ProtectedRoute>} />
            <Route path="/buildings/new" element={<ProtectedRoute><BuildingForm /></ProtectedRoute>} />
            <Route path="/buildings/:id" element={<ProtectedRoute><BuildingDetail /></ProtectedRoute>} />
            <Route path="/buildings/:id/add-sensor" element={<ProtectedRoute><SensorForm /></ProtectedRoute>} />
	    <Route path="/buildings/:id/edit" element={<ProtectedRoute><BuildingEditForm /></ProtectedRoute>} />
            <Route path="/sensors/:id" element={<ProtectedRoute><SensorDetail /></ProtectedRoute>} />
            <Route path="/sensors/:id/edit" element={<ProtectedRoute><SensorEditForm /></ProtectedRoute>} />
            <Route path="/sensors/:id/report-incident" element={<ProtectedRoute><IncidentReportForm /></ProtectedRoute>} />
            <Route path="/incidents/:id" element={<ProtectedRoute><IncidentDetail /></ProtectedRoute>} />
            <Route path="/register" element={<RegisterForm />} />
          </Routes>
        </Container>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;