import React from "react";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "./Layout.css"

export default function Layout({ children, title, subtitle }) {
    return (
        <div className="layout-root">
            {/* Optional visual layers (safe if CSS not added yet) */}
            <div className="grid-bg" />
            <div className="noise-overlay" />

            <Sidebar />

            <motion.main
                className="layout-main"
                layout
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
                <TopBar title={title} subtitle={subtitle} />

                <motion.div
                    className="layout-content"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1],
                        delay: 0.1,
                    }}
                >
                    {children}
                </motion.div>
            </motion.main>
        </div>
    );
}