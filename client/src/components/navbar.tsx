import { Button } from "@/components/ui/button"
import { Bot, Menu } from "lucide-react"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom" // Updated import

export default function Navbar() {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/10"
    >
      <Link to="/" className="flex items-center space-x-2">
        <Bot className="w-8 h-8 text-purple-500" />
        <span className="text-white font-medium text-xl">ResearchAI</span>
      </Link>

      <div className="hidden md:flex items-center space-x-8">
        <Link to="/features" className="text-white hover:text-purple-400">Features</Link>
        <Link to="/how-it-works" className="text-white hover:text-purple-400">How it Works</Link>
        <Link to="/examples" className="text-white hover:text-purple-400">Examples</Link>
        <Link to="/pricing" className="text-white hover:text-purple-400">Pricing</Link>
      </div>

      <div className="hidden md:flex items-center space-x-4">
        <Button variant="ghost" className="text-white hover:text-purple-400">
          Sign In
        </Button>
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white" 
          onClick={handleLoginClick} // Add onClick handler
        >
          Log In
        </Button>
      </div>

      <Button variant="ghost" size="icon" className="md:hidden text-white">
        <Menu className="w-6 h-6" />
      </Button>
    </motion.nav>
  )
}

