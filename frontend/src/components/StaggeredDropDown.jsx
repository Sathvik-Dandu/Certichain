import { FiChevronDown, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const StaggeredDropDown = ({ options, onSelect, placeholder = "Select an option" }) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!open) {
            setSearch(""); 
        }
    }, [open]);

    const handleSelect = (text) => {
        setSelected(text);
        onSelect(text);
        setOpen(false);
    };

    const filteredOptions = options.filter((opt) =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full" style={{ position: "relative", zIndex: open ? 200 : 10 }}>
            <motion.div animate={open ? "open" : "closed"} className="w-full">
                <button
                    type="button"
                    onClick={() => setOpen((pv) => !pv)}
                    className="form-input"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                    }}
                >
                    <span className="font-medium text-sm" style={{ color: selected ? "var(--text)" : "var(--text-light)" }}>
                        {selected || placeholder}
                    </span>
                    <motion.span variants={iconVariants}>
                        <FiChevronDown />
                    </motion.span>
                </button>

                <motion.div
                    initial={wrapperVariants.closed}
                    variants={wrapperVariants}
                    style={{
                        originY: "top",
                        translateX: "-50%",
                        left: "50%",
                        width: "100%",
                        position: "absolute",
                        top: "110%",
                        zIndex: 200,
                        background: "var(--surface)",
                        boxShadow: "var(--shadow-lg)",
                        borderRadius: "var(--radius-sm)",
                        padding: "0.5rem",
                        border: "1px solid var(--border)",
                        maxHeight: "300px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem"
                    }}
                >
                    <div className="relative" style={{ padding: "0 0.25rem", position: "relative" }}>
                        <FiSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)", zIndex: 10, pointerEvents: "none" }} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Search..."
                            style={{
                                width: "100%",
                                padding: "0.5rem 0.5rem 0.5rem 2rem",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border)",
                                fontSize: "0.9rem",
                                outline: "none"
                            }}
                        />
                    </div>

                    <div style={{ overflowY: "auto", maxHeight: "200px" }}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <Option key={option} text={option} onClick={() => handleSelect(option)} />
                            ))
                        ) : (
                            <p style={{ padding: "0.5rem", fontSize: "0.85rem", color: "var(--text-light)", textAlign: "center" }}>
                                No results found
                            </p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

const Option = ({ text, onClick }) => {
    return (
        <motion.div
            variants={itemVariants}
            onClick={onClick}
            whileHover={{ scale: 1.0, backgroundColor: "var(--surface-alt)", color: "var(--primary)" }}
            whileTap={{ scale: 0.98 }}
            style={{
                padding: "0.5rem 0.75rem",
                width: "100%",
                cursor: "pointer",
                fontSize: "0.95rem",
                color: "var(--text-secondary)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.25rem"
            }}
        >
            <span>{text}</span>
        </motion.div>
    );
};

export default StaggeredDropDown;

const wrapperVariants = {
    open: {
        scaleY: 1,
        visibility: "visible",
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.03,
        },
    },
    closed: {
        scaleY: 0,
        visibility: "hidden",
        transition: {
            when: "afterChildren",
            staggerChildren: 0,
            staggerDirection: -1
        },
    },
};

const iconVariants = {
    open: { rotate: 180 },
    closed: { rotate: 0 },
};

const itemVariants = {
    open: {
        opacity: 1,
        y: 0,
        transition: {
            when: "beforeChildren",
            duration: 0.15
        },
    },
    closed: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.1
        },
    },
};
