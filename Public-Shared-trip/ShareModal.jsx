/**
 * ShareModal.jsx
 * ---------------------------------------------------------------------------
 * Owner: Person D (Budget / Calendar / Sharing)
 * Blueprint refs: §2.2 ("Sharing a trip"), §13 (public page it generates the
 *                 link for), §15 (mounts in B's Modal primitive), §16.3
 *                 (optimistic update pattern), §19 (share loading/success/error states)
 *
 * Design note (§15): this is meant to mount *inside* B's <Modal>. Since B's
 * exact Modal API may not exist yet, this component accepts an optional
 * `ModalComponent` prop — pass B's real Modal once it's ready and this
 * degrades to zero changes on your end. Until then it renders a small
 * self-contained backdrop+panel so it's usable standalone from day one.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

/** Minimal built-in modal shell used only if no ModalComponent is supplied. */
function FallbackModal({ isOpen, onClose, children, labelledBy }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="gt-share-modal__backdrop">
      <div className="gt-share-modal__panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Object} props.trip                          - { id, name, isPublic, shareId }
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {(tripId: string, makePublic: boolean) => Promise<{ isPublic: boolean, shareUrl: string }>} [props.onShareToggle]
 *        - override for the API call; defaults to POST /trips/:id/share via fetchImpl
 * @param {typeof fetch} [props.fetchImpl]
 * @param {string} [props.apiBaseUrl]
 * @param {string} [props.shareOrigin]                  - defaults to window.location.origin
 * @param {(toast: { type: 'success'|'error', message: string }) => void} [props.showToast]
 * @param {React.ComponentType} [props.ModalComponent]  - B's real Modal, once available
 */
export default function ShareModal({
  trip,
  isOpen,
  onClose,
  onShareToggle,
  fetchImpl = typeof fetch !== 'undefined' ? fetch : undefined,
  apiBaseUrl = '',
  shareOrigin = typeof window !== 'undefined' ? window.location.origin : '',
  showToast,
  ModalComponent,
}) {
  const [isPublic, setIsPublic] = useState(!!trip?.isPublic);
  const [shareId, setShareId] = useState(trip?.shareId || null);
  const [isToggling, setIsToggling] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy link');
  const [error, setError] = useState(null);

  // Reset local state whenever a different trip is opened in the modal.
  useEffect(() => {
    setIsPublic(!!trip?.isPublic);
    setShareId(trip?.shareId || null);
    setError(null);
    setCopyLabel('Copy link');
  }, [trip?.id, trip?.isPublic, trip?.shareId]);

  const shareUrl = shareId ? `${shareOrigin}/share/${shareId}` : '';

  const defaultToggle = useCallback(
    async (tripId, makePublic) => {
      if (!fetchImpl) throw new Error('No fetch implementation available');
      const res = await fetchImpl(`${apiBaseUrl}/trips/${tripId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: makePublic }),
      });
      if (!res.ok) throw new Error(`Share toggle failed (${res.status})`);
      return res.json(); // expected: { isPublic, shareUrl } or { isPublic, shareId }
    },
    [fetchImpl, apiBaseUrl]
  );

  const handleToggle = async () => {
    const next = !isPublic;
    const previous = { isPublic, shareId };

    // Optimistic update (§16.3) — flip immediately, roll back on failure.
    setIsPublic(next);
    setIsToggling(true);
    setError(null);

    try {
      const toggleFn = onShareToggle || defaultToggle;
      const result = await toggleFn(trip.id, next);
      setIsPublic(result?.isPublic ?? next);
      setShareId(result?.shareId || (result?.shareUrl ? result.shareUrl.split('/').pop() : previous.shareId));
      if (next && showToast) showToast({ type: 'success', message: 'Trip is now public' });
      // Turning sharing off is non-destructive/reversible — no confirm, no toast noise (§19).
    } catch (err) {
      setIsPublic(previous.isPublic);
      setShareId(previous.shareId);
      setError("Couldn't update sharing — try again.");
      if (showToast) showToast({ type: 'error', message: "Couldn't update sharing — try again." });
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyLabel('Copied!');
      if (showToast) showToast({ type: 'success', message: 'Link copied' });
      setTimeout(() => setCopyLabel('Copy link'), 2000);
    } catch {
      setCopyLabel('Press ⌘/Ctrl+C');
      setTimeout(() => setCopyLabel('Copy link'), 2000);
    }
  };

  const ModalWrapper = ModalComponent || FallbackModal;
  const modalProps = ModalComponent
    ? { isOpen, onClose, 'aria-labelledby': 'gt-share-modal-title' }
    : { isOpen, onClose, labelledBy: 'gt-share-modal-title' };

  return (
    <ModalWrapper {...modalProps}>
      <GlobalShareModalStyles />
      <div className="gt-share-modal">
        <div className="gt-share-modal__header">
          <h2 id="gt-share-modal-title" className="gt-share-modal__title">
            Share trip
          </h2>
          <button type="button" className="gt-share-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="gt-share-modal__row">
          <div>
            <div className="gt-share-modal__label">Make trip public</div>
            <div className="gt-share-modal__hint">
              {isPublic
                ? 'Anyone with the link can view a read-only copy of this trip.'
                : 'Only you can see this trip right now.'}
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-label="Make trip public"
            className={`gt-share-modal__switch ${isPublic ? 'is-on' : ''}`}
            onClick={handleToggle}
            disabled={isToggling}
          >
            <span className="gt-share-modal__switch-knob" />
          </button>
        </div>

        {isToggling && <div className="gt-share-modal__status">Updating…</div>}
        {error && <div className="gt-share-modal__error">{error}</div>}

        {isPublic && shareUrl && (
          <>
            <div className="gt-share-modal__link-row">
              <input className="gt-share-modal__link-input" readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
              <button type="button" className="gt-share-modal__copy-btn" onClick={handleCopy}>
                {copyLabel}
              </button>
            </div>

            <div className="gt-share-modal__social" aria-label="Share to social">
              <a
                className="gt-share-modal__social-link"
                href={`https://wa.me/?text=${encodeURIComponent(`Check out my trip: ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              <a
                className="gt-share-modal__social-link"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my trip on GlobeTrotter: ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                X / Twitter
              </a>
              <a
                className="gt-share-modal__social-link"
                href={`mailto:?subject=${encodeURIComponent('My trip on GlobeTrotter')}&body=${encodeURIComponent(shareUrl)}`}
              >
                Email
              </a>
            </div>
          </>
        )}
      </div>
    </ModalWrapper>
  );
}

function GlobalShareModalStyles() {
  return (
    <style>{`
      .gt-share-modal__backdrop { position: fixed; inset: 0; background: rgba(28,27,24,0.25); display: flex; align-items: center; justify-content: center; z-index: 60; }
      .gt-share-modal__panel { background: var(--gt-surface, #FFFFFF); border-radius: 12px; box-shadow: 0 6px 20px rgba(28,27,24,0.10); width: 420px; max-width: 92vw; padding: 20px; }
      .gt-share-modal { font-family: Inter, system-ui, sans-serif; color: var(--gt-text-primary, #1C1B18); }
      .gt-share-modal__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
      .gt-share-modal__title { font-family: Fraunces, Georgia, serif; font-size: 19px; font-weight: 600; margin: 0; }
      .gt-share-modal__close { border: none; background: none; font-size: 20px; cursor: pointer; color: var(--gt-text-muted, #8B8879); }
      .gt-share-modal__row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 8px 0; }
      .gt-share-modal__label { font-size: 14px; font-weight: 600; }
      .gt-share-modal__hint { font-size: 12px; color: var(--gt-text-secondary, #5B594F); margin-top: 2px; }
      .gt-share-modal__switch { width: 40px; height: 22px; border-radius: 999px; border: 1px solid var(--gt-border, #E4E0D6); background: var(--gt-surface-alt, #F3F1EB); position: relative; cursor: pointer; flex-shrink: 0; transition: background 0.15s; }
      .gt-share-modal__switch.is-on { background: var(--gt-primary, #0E6E5C); border-color: var(--gt-primary, #0E6E5C); }
      .gt-share-modal__switch:disabled { opacity: 0.6; cursor: not-allowed; }
      .gt-share-modal__switch-knob { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(28,27,24,0.2); transition: transform 0.15s; }
      .gt-share-modal__switch.is-on .gt-share-modal__switch-knob { transform: translateX(18px); }
      .gt-share-modal__status { font-size: 12px; color: var(--gt-text-muted, #8B8879); margin-top: 4px; }
      .gt-share-modal__error { font-size: 12px; color: var(--gt-danger, #C43D3D); margin-top: 4px; }
      .gt-share-modal__link-row { display: flex; gap: 8px; margin-top: 14px; }
      .gt-share-modal__link-input { flex: 1; border: 1px solid var(--gt-border, #E4E0D6); border-radius: 8px; padding: 8px 10px; font-size: 13px; background: var(--gt-surface-alt, #F3F1EB); color: var(--gt-text-secondary, #5B594F); }
      .gt-share-modal__copy-btn { border: none; background: var(--gt-primary, #0E6E5C); color: #fff; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
      .gt-share-modal__copy-btn:hover { background: var(--gt-primary-hover, #0A5548); }
      .gt-share-modal__social { display: flex; gap: 14px; margin-top: 14px; flex-wrap: wrap; }
      .gt-share-modal__social-link { font-size: 12px; color: var(--gt-primary, #0E6E5C); text-decoration: none; font-weight: 600; }
      .gt-share-modal__social-link:hover { text-decoration: underline; }
    `}</style>
  );
}
