import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useHandleRoute } from "../../lib/util";
import { uploadVideos } from "../../lib/api";
import styles from "../../styles/common/edit/Video.module.css";
import Step2 from "../../components/steps/step2";
import Spinner from "../../components/spinner/Spinner";

export default function GetVideoPage() {
    const { handleRoute } = useHandleRoute();
    const location = useLocation();

    const email = location.state?.email || "";
    const title = location.state?.title || "";
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isNextDisabled, setIsNextDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [subtitleChecked, setSubtitleChecked] = useState(false);
    const [swappingIndices, setSwappingIndices] = useState([]);

    // 수정된 제한: 총 업로드 용량 30GB, 영상 하나당 30분 제한
    const MAX_TOTAL_SIZE = 30 * 1024 * 1024 * 1024; // 30GB
    const MAX_VIDEO_COUNT = 5;
    const MAX_VIDEO_DURATION = 30 * 60; // 30분 (초)

    const truncateFileName = (name) => {

        const normalized = name.normalize('NFC');
        const limit = 25;
    
        if ('Segmenter' in Intl) {
            const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
            const segments = Array.from(segmenter.segment(normalized), segment => segment.segment);
            return segments.length > limit ? segments.slice(0, limit).join('') + "..." : normalized;
        } else {
            const graphemes = [...normalized];
            return graphemes.length > limit ? graphemes.slice(0, limit).join('') + "..." : normalized;
        }
    };

    const calculateTotalSize = (files) => {
        return files.reduce((total, file) => total + file.file.size, 0);
    };

    const calculateVideoDurations = async (files) => {

        const durationPromises = files.map((file) =>
            new Promise((resolve) => {
                const videoElement = document.createElement("video");
                videoElement.preload = "metadata";
                videoElement.onloadedmetadata = () => {
                    resolve(videoElement.duration);
                };
                videoElement.src = URL.createObjectURL(file.file);
            })
        );
        return Promise.all(durationPromises);
    };

    const handleFileSelect = async (event) => {
        const files = Array.from(event.target.files);
        const validFiles = files.filter((file) => file.type.startsWith("video/"));
        await updateFileList(validFiles);
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        const validFiles = files.filter((file) => file.type.startsWith("video/"));
        await updateFileList(validFiles);
    };

    const updateFileList = async (files) => {

        const newFiles = files.map((file) => ({
            file,
            name: file.name,
            size: file.size,
            displaySize: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        }));

        const updatedFiles = [...uploadedFiles, ...newFiles];

        if (updatedFiles.length > MAX_VIDEO_COUNT) {
            alert("동영상은 최대 5개만 업로드할 수 있습니다.");
            return;
        }

        const totalSize = calculateTotalSize(updatedFiles);

        if (totalSize > MAX_TOTAL_SIZE) {
            alert("동영상은 총 30GB만 가능합니다.");
            return;
        }

        const durations = await calculateVideoDurations(updatedFiles);

        if (durations.some(duration => duration > MAX_VIDEO_DURATION)) {
            alert("각 동영상은 30분을 초과할 수 없습니다.");
            return;
        }

        setUploadedFiles(updatedFiles);
        setIsNextDisabled(false);
    };

    const handleRemoveFile = (index) => {
        const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(updatedFiles);

        const totalSize = calculateTotalSize(updatedFiles);
        setIsNextDisabled(totalSize > MAX_TOTAL_SIZE);
    };

    const handleUploadAndNext = async () => {
        if (uploadedFiles.length === 0) {
            alert("업로드할 동영상이 없습니다.");
            return;
        }
        try {
            setIsLoading(true);
            const response = await uploadVideos(
                subtitleChecked ? 1 : 0,
                email,
                title,
                uploadedFiles
            );
            if (!response.success) {
                console.error("업로드 실패", response.message);
                alert(response.message);
                setIsLoading(false);
                return;
            }
            alert(response.message);
            handleRoute("/complete");

        } catch (error) {
            console.error("업로드 에러", error);
            alert("업로드 중 오류가 발생했습니다.");
            setIsLoading(false);
        }
    };

    const handleMoveUp = (index) => {
        if (index === 0) return;
        swapItems(index, index - 1);
    };

    const handleMoveDown = (index) => {
        if (index === uploadedFiles.length - 1) return;
        swapItems(index, index + 1);
    };

    // 두 인덱스를 교체하는 공통 로직 (fade 효과 포함)
    const swapItems = (i1, i2) => {
        setSwappingIndices([i1, i2]);
        setTimeout(() => {
            const updated = [...uploadedFiles];
            [updated[i1], updated[i2]] = [updated[i2], updated[i1]];
            setUploadedFiles(updated);
            setSwappingIndices([]);
        }, 300);
    };

    return (
        <div className={styles.root}>
        {isLoading && (
            <div className={styles.loadingOverlay}>
            <Spinner />
            </div>
        )}

        <h2 className={styles.title}>Upload video</h2>
        <div className={styles.notice}>
            <p className={styles.noticeLine1}>
            영상은 5개 이하, 총 30GB 이하 업로드 가능합니다.
            </p>
            <p className={styles.noticeLine1}>
            각 동영상은 30분을 초과할 수 없습니다.
            </p>
            <p className={styles.noticeLine2}>
            동영상을 시간 순서대로 나열해주세요.
            </p>
        </div>

        {uploadedFiles.length === 0 ? (
            <div
            className={styles.videoInput}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            >
            <label htmlFor="fileInput" className={styles.dropContent}>
                <img
                    src="/drop.svg"
                    alt="Drop Icon"
                    className={styles.dropIcon}
                />
                <p><span className={styles.uploadLink}>Click to Upload</span> or drag and drop</p>
                <p className={styles.fileSize}>Max. number of video 5</p>
            </label>
            <input
                id="fileInput"
                type="file"
                accept="video/*"
                multiple
                className={styles.fileInput}
                onChange={handleFileSelect}
            />
            </div>
        ) : (
            <>
            <div className={styles.fileList}>
                {uploadedFiles.map((item, index) => {
                const isSwapping = swappingIndices.includes(index);
                return (
                    <div key={index} className={`${styles.fileItem} ${isSwapping ? styles.fadeOut : ""}`}>
                    <div className={styles.fileDetails}>
                        <img
                            src="/video.svg"
                            alt="Video Icon"
                            className={styles.fileIcon}
                        />
                        <div>
                        <p className={styles.fileName}>
                            {truncateFileName(item.name)}
                        </p>
                        <p className={styles.fileSize}>{item.displaySize}</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                            src="/upperArrow.svg"
                            alt="Move Up"
                            className={styles.arrowIcon}
                            onClick={() => handleMoveUp(index)}
                        />
                        <img
                            src="/underArrow.svg"
                            alt="Move Down"
                            className={styles.arrowIcon}
                            onClick={() => handleMoveDown(index)}
                        />
                        <img
                            src="/trash.svg"
                            alt="Trash Icon"
                            className={styles.trashIcon}
                            onClick={() => handleRemoveFile(index)}
                        />
                    </div>
                    </div>
                );
                })}
            </div>

            <div className={styles.addButton}>
                <button
                    className={styles.addVideoButton}
                    onClick={() => document.getElementById("fileInput").click()}
                >
                + Add Video
                </button>
                <input
                    id="fileInput"
                    type="file"
                    accept="video/*"
                    multiple
                    className={styles.fileInput}
                    onChange={handleFileSelect}
                />
            </div>
            </>
        )}

        <div className={styles.checkboxContainer}>
            <label className={styles.checkboxLabel}>
            <input
                type="checkbox"
                checked={subtitleChecked}
                onChange={(e) => setSubtitleChecked(e.target.checked)}
                className={styles.checkbox}
                disabled={uploadedFiles.length === 0}
            />
            자막 씌우기
            </label>
        </div>

        <div className={styles.buttons}>
            <button
                className={styles.startButton}
                disabled={uploadedFiles.length === 0 || isNextDisabled}
                onClick={handleUploadAndNext}
            >
            다음
            </button>
        </div>

        <div className={styles.graph}>
            <Step2 />
        </div>
        </div>
    );
}
