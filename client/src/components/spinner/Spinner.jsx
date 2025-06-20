import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import styles from "./Spinner.module.css";

export default function Spinner({ progress = 0, message = "처리 중..." }) {
  return (
    <div className={styles.spinnerContainer}>
      <div style={{ width: 120, height: 120 }}>
        <CircularProgressbar
          value={progress}
          text={`${progress}%`}
          styles={buildStyles({
            // 원형 프로그레스바의 색상 설정
            pathColor: `#007bff`,
            textColor: '#007bff',
            trailColor: '#d6d6d6',
            backgroundColor: '#3e98c7',
          })}
        />
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}