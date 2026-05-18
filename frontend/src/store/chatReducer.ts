import type { ChatState, Message } from "@/types";

export type ChatAction =
  | { type: "SET_MESSAGES"; sessionId: string; messages: Message[] }
  | { type: "APPEND"; sessionId: string; messages: Message[] }
  | {
      type: "REPLACE_OPTIMISTIC";
      sessionId: string;
      tempId: string;
      messages: Message[];
    }
  | {
      type: "UPDATE_MESSAGE_CONTENT";
      sessionId: string;
      messageId: string;
      content: string;
    }
  | {
      type: "REPLACE_MESSAGE";
      sessionId: string;
      messageId: string;
      message: Message;
    }
  | { type: "REMOVE"; sessionId: string; messageId: string }
  | { type: "CLEAR_SESSION"; sessionId: string };

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_MESSAGES":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.sessionId]: action.messages,
        },
      };

    case "APPEND": {
      const prev = state.messages[action.sessionId] ?? [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.sessionId]: [...prev, ...action.messages],
        },
      };
    }

    case "REPLACE_OPTIMISTIC": {
      const prev = state.messages[action.sessionId] ?? [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.sessionId]: [
            ...prev.filter((m) => m._id !== action.tempId),
            ...action.messages,
          ],
        },
      };
    }

    case "UPDATE_MESSAGE_CONTENT": {
      const prev = state.messages[action.sessionId] ?? [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.sessionId]: prev.map((m) =>
            m._id === action.messageId
              ? { ...m, content: action.content }
              : m,
          ),
        },
      };
    }

    case "REPLACE_MESSAGE": {
      const prev = state.messages[action.sessionId] ?? [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.sessionId]: prev.map((m) =>
            m._id === action.messageId ? action.message : m,
          ),
        },
      };
    }

    case "REMOVE": {
      const prev = state.messages[action.sessionId] ?? [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.sessionId]: prev.filter((m) => m._id !== action.messageId),
        },
      };
    }

    case "CLEAR_SESSION":
      return {
        ...state,
        messages: { ...state.messages, [action.sessionId]: [] },
      };

    default:
      return state;
  }
}
