import { useState } from "react"
import PageWrapper from '../components/layout/PageWrapper';
import ViewExpense from '../components/expense/ViewExpense';
import { useAuth } from '../components/auth/AuthContext';
import {
  Box,
  Button,
  useMediaQuery,
  Paper,
  Typography,
  Fab,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
} from "@mui/material"
import { Add, Receipt, TrendingUp, Assessment, AttachMoney } from "@mui/icons-material"
import ApplyExpense from '../components/expense/ApplyExpense';

import { motion, AnimatePresence } from "framer-motion"
function EnhancedExpensePage() {
  const { user } = useAuth();
  const [openApplyExpenseDialog, setOpenApplyExpenseDialog] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
const isMobile = useMediaQuery("(max-width:600px)")
  const drawerWidth = isMobile ? 0 : 11
    const handleOpenApplyExpenseDialog = () => setOpenApplyExpenseDialog(true)
  const handleCloseApplyExpenseDialog = () => setOpenApplyExpenseDialog(false)

  const handleExpenseApplied = () => {
    setRefreshTrigger((prev) => prev + 1)
    handleCloseApplyExpenseDialog()
  }

    return (
        <PageWrapper title="Holidays">
          
        <ViewExpense />
        <AnimatePresence>
          {isMobile && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Tooltip title="Quick Apply Expense">
                <Fab
                  z
                  onClick={handleOpenApplyExpenseDialog}
                  sx={{
                    position: "fixed",
                    bottom: 24,
                    right: 24,
                    background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #667eea 60%, #764ba2 100%)",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.3s ease",
                    zIndex: 1000,
                  }}
                >
                  <Add />
                </Fab>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
        {user && user.role === 'HR' &&  <ApplyExpense
          open={openApplyExpenseDialog}
          onClose={handleCloseApplyExpenseDialog}
          onExpenseApplied={handleExpenseApplied}
        />}
        </PageWrapper>
    );
}

export default EnhancedExpensePage;