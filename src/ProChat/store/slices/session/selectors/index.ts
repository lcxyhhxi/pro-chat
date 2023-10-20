import { INBOX_SESSION_ID } from '@/const/session';
import { SessionStore } from '@/ProChat/store';

import { exportAgents, exportSessions, getExportAgent } from './export';
import {
  currentSession,
  currentSessionSafe,
  getSessionById,
  getSessionMetaById,
  hasSessionList,
  sessionList,
} from './list';

const isInboxSession = (s: SessionStore) => s.activeId === INBOX_SESSION_ID;

export const sessionSelectors = {
  currentSession,
  currentSessionSafe,
  exportAgents,
  exportSessions,
  getExportAgent,
  getSessionById,
  getSessionMetaById,
  hasSessionList,
  isInboxSession,
  sessionList,
};
