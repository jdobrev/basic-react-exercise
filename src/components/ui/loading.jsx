import React from "react";
import styles from "./loading.module.scss";

export function Loading({ className }) {
  const wrapper = [styles.container, className].filter(Boolean).join(" ");
  return (
    <div className={wrapper}>
      <div className={styles.spinner} />
    </div>
  );
}
