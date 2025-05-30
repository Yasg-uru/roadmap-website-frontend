import { Button } from "@/components/ui/button"
import { Route, Routes } from "react-router-dom"
import Signup from "./pages/authpages/register-user"

function App() {
  return (
   <Routes>
    <Route path="/signup" element={<Signup/>}/>
   </Routes>
  )
}

export default App
