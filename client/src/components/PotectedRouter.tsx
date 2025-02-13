import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import axios from 'axios'

interface ProtectedRouterProps {
  children: React.ReactNode;
}

const ProtectedRouter: React.FC<ProtectedRouterProps> = ({ children }) => {
    const navigate = useNavigate()
    const { setUser } = useContext(UserContext)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("userData")
                if (!token) {
                    navigate('/login')
                    return
                }
                    setIsLoading(false)
                
            } catch (error) {
                console.error("Auth error:", error)
                localStorage.removeItem("token")
                navigate("/userLogin")
            }
        }

        checkAuth()
    }, [navigate, setUser])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return <>{children}</>
}

export default ProtectedRouter