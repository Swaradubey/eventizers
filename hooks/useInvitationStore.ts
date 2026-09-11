"use client";

import { useSyncExternalStore, useCallback } from "react";
import { getTemplateConfig, NewTemplateData } from "../lib/newTemplatesData";
import { StageTextLayer } from "../components/designer/EvitePureCssStage";

export interface InvitationStoreState {
  activeTemplateId: string;
  template: NewTemplateData | null;
  textLayers: StageTextLayer[];
  selectedTextId: string | null;
  editingTextId: string | null;
  envelope: {
    outerColor: string;
    linerCss?: string;
    isOpen: boolean;
  };
  card: {
    backgroundColor: string;
    cssConfig?: any;
    aspectRatio?: "portrait" | "square" | "5x7";
  };
  backdrop: {
    color: string;
    gradient?: string;
  };
}

const DEFAULT_TEMPLATE_ID = "tpl-golden-milestone";

function createInitialState(templateId = DEFAULT_TEMPLATE_ID): InvitationStoreState {
  const tpl = getTemplateConfig(templateId);
  const layers: StageTextLayer[] = (
    tpl?.defaultTextLayers && tpl.defaultTextLayers.length > 0 ? tpl.defaultTextLayers
    : tpl?.textLayers && tpl.textLayers.length > 0 ? tpl.textLayers
    : []
  ).map((l: any) => ({
    id: l.id,
    key: l.key,
    text: l.text,
    fontFamily: l.fontFamily,
    fontSize: l.fontSize,
    fontWeight: l.fontWeight,
    color: l.color,
    textAlign: l.textAlign || l.align || "center",
    top: l.top !== undefined ? l.top : (l.y || 50),
    left: l.left !== undefined ? l.left : (l.x || 50),
    foilGradient: l.foilGradient,
    letterSpacing: l.letterSpacing,
    lineHeight: l.lineHeight,
    casing: l.casing,
  }));

  return {
    activeTemplateId: templateId,
    template: tpl,
    textLayers: layers,
    selectedTextId: layers[0]?.id || null,
    editingTextId: null,
    envelope: {
      outerColor: tpl?.envelope?.outerColor || "#1C1A10",
      linerCss: (tpl?.envelope as any)?.linerCss || undefined,
      isOpen: true,
    },
    card: {
      backgroundColor: tpl?.card?.backgroundColor || "#141414",
      cssConfig: (tpl?.card as any)?.cssConfig,
      aspectRatio: tpl?.card?.aspectRatio || "5x7",
    },
    backdrop: {
      color: (tpl?.backdrop as any)?.value || "#161616",
      gradient: (tpl?.backdrop as any)?.gradient || (tpl?.backdrop as any)?.value,
    },
  };
}

let storeState: InvitationStoreState = createInitialState();
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export const invitationStore = {
  getState: () => storeState,
  
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setTemplate: (templateId: string) => {
    storeState = createInitialState(templateId);
    emitChange();
  },

  updateTextLayer: (id: string, updates: Partial<StageTextLayer>) => {
    storeState = {
      ...storeState,
      textLayers: storeState.textLayers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    };
    emitChange();
  },

  selectTextLayer: (id: string | null) => {
    storeState = {
      ...storeState,
      selectedTextId: id,
    };
    emitChange();
  },

  setEditingTextId: (id: string | null) => {
    storeState = {
      ...storeState,
      editingTextId: id,
    };
    emitChange();
  },

  updateEnvelope: (updates: Partial<InvitationStoreState["envelope"]>) => {
    storeState = {
      ...storeState,
      envelope: { ...storeState.envelope, ...updates },
    };
    emitChange();
  },

  updateCard: (updates: Partial<InvitationStoreState["card"]>) => {
    storeState = {
      ...storeState,
      card: { ...storeState.card, ...updates },
    };
    emitChange();
  },

  updateBackdrop: (updates: Partial<InvitationStoreState["backdrop"]>) => {
    storeState = {
      ...storeState,
      backdrop: { ...storeState.backdrop, ...updates },
    };
    emitChange();
  },

  reset: (templateId?: string) => {
    storeState = createInitialState(templateId || storeState.activeTemplateId);
    emitChange();
  },
};

export function useInvitationStore() {
  const state = useSyncExternalStore(
    invitationStore.subscribe,
    invitationStore.getState,
    invitationStore.getState
  );

  const setTemplate = useCallback((id: string) => invitationStore.setTemplate(id), []);
  const updateTextLayer = useCallback((id: string, updates: Partial<StageTextLayer>) => invitationStore.updateTextLayer(id, updates), []);
  const selectTextLayer = useCallback((id: string | null) => invitationStore.selectTextLayer(id), []);
  const setEditingTextId = useCallback((id: string | null) => invitationStore.setEditingTextId(id), []);
  const updateEnvelope = useCallback((updates: Partial<InvitationStoreState["envelope"]>) => invitationStore.updateEnvelope(updates), []);
  const updateCard = useCallback((updates: Partial<InvitationStoreState["card"]>) => invitationStore.updateCard(updates), []);
  const updateBackdrop = useCallback((updates: Partial<InvitationStoreState["backdrop"]>) => invitationStore.updateBackdrop(updates), []);
  const reset = useCallback((id?: string) => invitationStore.reset(id), []);

  return {
    ...state,
    setTemplate,
    updateTextLayer,
    selectTextLayer,
    setEditingTextId,
    updateEnvelope,
    updateCard,
    updateBackdrop,
    reset,
  };
}

export default useInvitationStore;
