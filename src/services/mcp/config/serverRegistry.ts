import { NotesServer } from "../notes/NotesServer";
import { TimerServer } from "../timer/TimerServer";
import { McpServerConfig } from "../shared/types";

export const serverRegistry: readonly McpServerConfig[] = [
  {
    id: "notes",
    createInstance: () => new NotesServer(),
    options: {
      path: '/notes'
    }
  },
  {
    id: "timer", 
    createInstance: () => new TimerServer(),
    options: {
      path: '/timer'
    }
  }
] as const; 