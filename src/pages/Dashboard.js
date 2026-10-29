// pages/Dashboard.jsx
import React from "react"
import PageWrapper from "../components/layout/PageWrapper"
import DashboardData from "../components/dashboard/DashboardData"

function Dashboard() {
  return (
    <PageWrapper title="Dashboard">
      <DashboardData />
    </PageWrapper>
  )
}

export default Dashboard