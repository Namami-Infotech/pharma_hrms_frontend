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
    <Box sx={{ height: "100%", overflowX: "hidden", overflowY: { xs: "auto", md: "hidden" }, bgcolor: "#f5f7fa" }}>
      {/* Content Section */}
      <Box sx={{ 
        height: "100%", 
        minHeight: 0,
        p: 0,
        display: "flex",
        flexDirection: "column",
      }}>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  )
}

export default PageWrapper