
import { Route, Routes } from "react-router-dom"
import Signup from "./pages/authpages/register-user"
import Verify from "./pages/authpages/otp-verify"
import Login from "./pages/authpages/login"
import ForgotPassword from "./pages/authpages/forgot-password"
import ResetPassword from "./pages/authpages/reset-password"
import Navbar from "./pages/main-pages/navbar"
import Roadmaps from "./pages/roadmap/roadmaps"
import Home from "./pages/main-pages/home-page"
import Roadmap from "./pages/main-pages/roadmap.example"
import RoadmapDetails from "./pages/roadmap/roadmap-details"
import { useEffect } from "react"
import { socket } from "./helper/useSocket"
import { useAuth } from "./contexts/authContext"
import GenerateRoadmap from "./pages/roadmap-generation/generate-roadmap"
import RoadmapDetailsPage from "./pages/roadmap/getroadmapdetails-page"
import Analytics from './pages/Analytics/Analytics'

function App() {
  const { user } = useAuth()
  useEffect(() => {
    socket.emit("registerUser", user?._id);

  }, [])
  return (
    <>
    <Navbar/>
   <Routes>
    <Route path="/" element={<Home/>} />
    <Route path="/roadmap" element={<Roadmaps/>}/>
    <Route path="/signup" element={<Signup/>}/>
    <Route path = "/verify/:email"  element={<Verify/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/forgot-password" element={<ForgotPassword/>}/>
     
    <Route path="/reset-password/:token" element={<ResetPassword/>}/>

    <Route path="/roadmaps" element={<Roadmaps/>}/>
    <Route path="/details/:roadmapId"  element={<RoadmapDetailsPage />}/>
  <Route path="/generate-roadmap" element= {<GenerateRoadmap/>} />
  <Route path="/progress" element={<Analytics />} />
  
   </Routes>
   </>
  )
}

export default App
