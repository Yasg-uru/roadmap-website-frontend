import { Button } from "@/components/ui/button"
import { Route, Routes } from "react-router-dom"
import Signup from "./pages/authpages/register-user"
import Verify from "./pages/authpages/otp-verify"

function App() {
  return (
   <Routes>
    <Route path="/signup" element={<Signup/>}/>
    <Route path = "/verify/:email"  element={<Verify/>}/>
   </Routes>
  )
}

export default App
