import React from "react";
import styles from "./Spinner.module.css";

export default function Spinner() {
  return (
    <div className={styles.spinnerContainer}>
      <img src="/spinner.gif" alt="Loading..." className={styles.spinnerImage} />
    </div>
  );
}