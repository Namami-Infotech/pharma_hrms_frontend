"use client";
// components/layout/PageWrapper.jsx (Simplified)

import React from "react"
import { Box, Typography, Breadcrumbs } from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useLocation } from "react-router-dom"

const PageWrapper = ({ 
  children, 
  title,
  breadcrumbs = true,
  header = true 
}) => {
  const location = useLocation()

  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean)
    return paths.map((path, index, array) => {
      const route = `/${array.slice(0, index + 1).join('/')}`
      const isLast = index === array.length - 1
      const name = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
      
      return { name, route, isLast }
    })
  }

  const pageBreadcrumbs = generateBreadcrumbs()
  const pageTitle = title || pageBreadcrumbs[pageBreadcrumbs.length - 1]?.name || 'Page'

  return (
    <Box sx={{ height: "100%", overflow: "auto", bgcolor: "#f5f7fa" }}>
      {/* Header Section */}
      

      {/* Content Section */}
      <Box sx={{ 
        height: header ? "calc(100% - 120px)" : "100%", 
        p: 0,
        pt: header ? 1 : 3
      }}>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ height: "100%" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  )
}

export default PageWrapper