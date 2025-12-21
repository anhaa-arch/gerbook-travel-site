"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface UseIdleLogoutProps {
  timeout?: number; // milliseconds (default: 5 minutes)
  onLogout?: () => void;
}

export function useIdleLogout({ 
  timeout = 5 * 60 * 1000, // 5 minutes default
  onLogout 
}: UseIdleLogoutProps = {}) {
  const router = useRouter();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = () => {
    console.log("🔴 Auto-logout triggered due to inactivity");
    
    // Clear localStorage
    localStorage.clear();
    
    // Call custom logout handler if provided
    if (onLogout) {
      onLogout();
    }
    
    // Redirect to login
    router.push("/login");
  };

  const resetTimer = () => {
    // Clear existing timeout
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    // Set new timeout
    timeoutId.current = setTimeout(() => {
      handleLogout();
    }, timeout);
  };

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Reset timer on any activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [timeout]);

  return null;
}

