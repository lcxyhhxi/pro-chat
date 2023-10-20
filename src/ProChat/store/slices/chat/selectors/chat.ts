import { t } from 'i18next';

import { FunctionCallProps } from '@/app/chat/features/Conversation/ChatList/Plugins/FunctionCall';
import { DEFAULT_INBOX_AVATAR, DEFAULT_USER_AVATAR } from '@/const/meta';
import { useGlobalStore } from '@/store/global';
import { ChatMessage } from '@/types/chatMessage';

import type { SessionStore } from '../../../store';
import { agentSelectors } from '../../agentConfig';
import { sessionSelectors } from '../../session/selectors';
import { getSlicedMessagesWithConfig } from '../utils';
import { organizeChats } from './utils';

export const getChatsById =
  (id: string) =>
  (s: SessionStore): ChatMessage[] => {
    const session = sessionSelectors.getSessionById(id)(s);

    if (!session) return [];

    return organizeChats(session, {
      meta: {
        assistant: {
          avatar: agentSelectors.currentAgentAvatar(s),
          backgroundColor: agentSelectors.currentAgentBackgroundColor(s),
        },
        user: {
          avatar:
            // TODO: need props config
            useGlobalStore.getState().settings.avatar || DEFAULT_USER_AVATAR,
        },
      },
      topicId: s.activeTopicId,
    });
  };

// 当前激活的消息列表
export const currentChats = (s: SessionStore): ChatMessage[] => {
  if (!s.activeId) return [];

  return getChatsById(s.activeId)(s);
};

// 针对新助手添加初始化时的自定义消息
export const currentChatsWithGuideMessage = (s: SessionStore): ChatMessage[] => {
  const data = currentChats(s);
  // TODO: need topic inject

  const isBrandNewChat = data.length === 0;

  if (!isBrandNewChat) return data;

  const [activeId] = [s.activeId];
  const meta = agentSelectors.currentAgentMeta(s);

  const agentSystemRoleMsg = t('agentDefaultMessageWithSystemRole', {
    name: meta.title || t('defaultAgent'),
    ns: 'chat',
    systemRole: meta.description,
  });
  const agentMsg = t('agentDefaultMessage', {
    id: activeId,
    name: meta.title || t('defaultAgent'),
    ns: 'chat',
  });

  const emptyInboxGuideMessage = {
    content: !!meta.description ? agentSystemRoleMsg : agentMsg,
    createAt: Date.now(),
    extra: {},
    id: 'default',
    meta: meta || {
      avatar: DEFAULT_INBOX_AVATAR,
    },
    role: 'assistant',
    updateAt: Date.now(),
  } as ChatMessage;

  return [emptyInboxGuideMessage];
};

export const currentChatsWithHistoryConfig = (s: SessionStore): ChatMessage[] => {
  const chats = currentChats(s);
  const config = agentSelectors.currentAgentConfig(s);

  return getSlicedMessagesWithConfig(chats, config);
};

export const chatsMessageString = (s: SessionStore): string => {
  const chats = currentChatsWithHistoryConfig(s);
  return chats.map((m) => m.content).join('');
};

export const getFunctionMessageParams =
  (
    s: SessionStore,
  ): ((
    props: Pick<ChatMessage, 'plugin' | 'function_call' | 'content' | 'id'>,
  ) => FunctionCallProps) =>
  ({ plugin, function_call, content, id }) => {
    const itemId = plugin?.identifier || function_call?.name;
    const command = plugin ?? function_call;
    const args = command?.arguments;

    return {
      arguments: args,
      command,
      content,
      id: itemId,
      loading: id === s.chatLoadingId,
    };
  };
