import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useHandleRoute() {
  const navigate = useNavigate();

  /**
   * path: 이동할 경로
   * state: 다음 페이지에서 사용할 추가 데이터
   */
  const handleRoute = (path, state) => {
    navigate(path, { state });
  };

  return { handleRoute };
}