import { useEffect, useRef } from "react";

/**
 * Hook to manage the lifecycle of an audio node in a React component.
 * Ensures the node is disposed on unmount to prevent memory leaks.
 */

export function useAudioLifecycle<T extends { dispose(): void }>(factory: () => T): T {
  const nodeRef = useRef<T | null>(null);

  if (nodeRef.current === null) {
    nodeRef.current = factory();
  }

  useEffect(() => {
    const node = nodeRef.current;
    return () => {
      node?.dispose();
      nodeRef.current = null;
    };
  }, []);

  return nodeRef.current;
}