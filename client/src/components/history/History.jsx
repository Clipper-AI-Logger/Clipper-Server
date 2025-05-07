import React from 'react';
import styles from '../../styles/common/premium/History.module.css';

export default function History({ data, selectedUuid, onSelect, onRemove }) {
  return (
    <div className={styles.timelineContainer}>
      {data.length === 0 ? (
        <div className={styles.emptyMessage}>
          <p>편집했던 영상이 없습니다.<br />영상 편집 후 이용해주세요.</p>
        </div>
      ) : (
        data.map((item, idx) => {
          const { uuid, title, date } = item;
          const isSelected = selectedUuid === uuid;
          return (
            <div
              key={uuid}
              className={`${styles.timelineItem} ${isSelected ? styles.selectedTimelineItem : ''}`}
              onClick={() => onSelect(uuid)}
            >
              <div className={styles.timelineContent}>
                <div className={styles.leftGroup}>
                  <img
                    src="/video.svg"
                    alt="Video Icon"
                    className={styles.fileIcon}
                  />
                  <div className={styles.timelineTitle}>{title}</div>
                </div>
                <div className={styles.rightGroup}>
                  <div className={styles.timelineDate}>{date}</div>
                  <img
                    src="/trash.svg"
                    alt="Trash Icon"
                    className={styles.trashIcon}
                    onClick={(e) => { 
                      e.stopPropagation();
                      if (window.confirm("기록을 삭제하시겠습니까? 삭제하면 더 이상 수정할 수 없습니다")) {
                        onRemove(uuid);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
