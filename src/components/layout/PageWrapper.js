"use client";
// components/layout/PageWrapper.jsx (Simplified)

import React from "react"
import { Box } from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"

const PageWrapper = ({ 
  children, 
  title,
  breadcrumbs = true,
  header = true 
}) => {

  return (
    <Box sx={{ height: "100%", overflow: "auto", bgcolor: "#f5f7fa" }}>
      {/* Header Section */}
      

      {/* Content Section */}
      <Box sx={{ 
        height: "100%", 
        p: 0,
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