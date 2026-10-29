"use client"

import { useState } from "react"
import {
  Box,
} from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import PageWrapper from "../components/layout/PageWrapper"
import MapPage from "../components/dealers/MapPage"
import LiveTrack from "../components/dealers/LiveTrack"

function Maps() {
  const selectedTab = window.location.href.includes("live-track") ? "liveField" : "visitMap";

  return (
    <PageWrapper 
      title="Maps & Tracking" 
      maxWidth={false}
      sx={{ 
        bgcolor: 'background.default',
        p: 0,
       
      }}
    >
      

      {/* Content Area */}
      <Box sx={{ flexGrow: 1, px: 1, pb: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%" }}
          >
            <Box sx={{ height: "100%", borderRadius: 2, overflow: 'hidden' }}>
              {selectedTab === "visitMap" ? <MapPage /> : <LiveTrack />}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </PageWrapper>
  )
}

export default Maps